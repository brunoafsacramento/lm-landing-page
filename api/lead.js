// Recebe o formulário do site (Vercel Function).
// Fase 1 (revisão, seção 6.1): grava no Supabase (tabela site_leads) e avisa por e-mail
// usando a função send-email que o portal já tem. Fase 2: APICE_WEBHOOK_URL repassa o lead ao Ápice.
//
// Variáveis de ambiente na Vercel:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (obrigatórias)
//   LEAD_EMAIL_TO      (padrão: lmcontabilidade@lmcontab.com.br)
//   LEAD_IP_SALT       (qualquer texto aleatório; cifra o IP)
//   APICE_WEBHOOK_URL  (opcional, fase 2)

import { createHash } from 'node:crypto';

const LIMITE_POR_IP = 5; // envios por IP a cada 10 minutos
const ORIGEM_PERMITIDA = /^https:\/\/(www\.)?lmcontab\.com\.br$|^http:\/\/localhost(:\d+)?$|\.vercel\.app$/;

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const escapar = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function comTempo(promessa, ms = 8000) {
  return Promise.race([promessa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const origin = req.headers.origin || '';
  if (origin && !ORIGEM_PERMITIDA.test(origin)) return res.status(403).json({ erro: 'Origem não permitida' });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ erro: 'Formulário ainda não configurado' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // Honeypot: robô preencheu o campo invisível. Responde OK e descarta.
  if (texto(b.site, 200)) return res.status(200).json({ ok: true });

  const lead = {
    nome: texto(b.nome, 120),
    whatsapp: texto(b.whatsapp, 20).replace(/\D/g, ''),
    servico: texto(b.servico, 80),
    mensagem: texto(b.mensagem, 1000) || null,
    origem: texto(b.origem, 40) || null,
    pagina: texto(b.pagina, 200) || null,
    utm_source: texto(b.utm_source, 100) || null,
    utm_medium: texto(b.utm_medium, 100) || null,
    utm_campaign: texto(b.utm_campaign, 100) || null,
    gclid: texto(b.gclid, 200) || null,
    consentimento: b.consentimento === true,
  };
  if (!lead.nome || lead.whatsapp.length < 10 || lead.whatsapp.length > 13 || !lead.servico || !lead.consentimento) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  lead.ip_hash = createHash('sha256').update(`${process.env.LEAD_IP_SALT || 'lm'}:${ip}`).digest('hex');

  const supabase = (caminho, init = {}) =>
    fetch(`${SUPABASE_URL}${caminho}`, {
      ...init,
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', ...init.headers },
    });

  // Limite de envios por IP
  try {
    const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const r = await comTempo(supabase(`/rest/v1/site_leads?select=id&ip_hash=eq.${lead.ip_hash}&criado_em=gte.${desde}`, { headers: { Prefer: 'count=exact', Range: '0-0' } }));
    const total = Number((r.headers.get('content-range') || '').split('/')[1] || 0);
    if (total >= LIMITE_POR_IP) return res.status(429).json({ erro: 'Muitos envios. Tente pelo WhatsApp.' });
  } catch { /* se a checagem falhar, segue */ }

  const [gravou, enviou] = await Promise.allSettled([
    comTempo(supabase('/rest/v1/site_leads', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(lead) })).then((r) => {
      if (!r.ok) throw new Error(`supabase ${r.status}`);
    }),
    comTempo(
      supabase('/functions/v1/send-email', {
        method: 'POST',
        body: JSON.stringify({
          to: process.env.LEAD_EMAIL_TO || 'lmcontabilidade@lmcontab.com.br',
          subject: `Novo contato pelo site: ${lead.servico} (${lead.nome})`,
          html: emailHtml(lead),
        }),
      }),
    ).then((r) => {
      if (!r.ok) throw new Error(`email ${r.status}`);
    }),
  ]);

  if (process.env.APICE_WEBHOOK_URL) {
    try {
      const { ip_hash, ...publico } = lead;
      await comTempo(fetch(process.env.APICE_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(publico) }), 5000);
    } catch (e) {
      console.error('Ápice:', e);
    }
  }

  if (gravou.status === 'rejected') console.error('Falha ao gravar lead:', gravou.reason);
  if (enviou.status === 'rejected') console.error('Falha ao enviar e-mail:', enviou.reason);
  if (gravou.status === 'rejected' && enviou.status === 'rejected') return res.status(502).json({ erro: 'Não foi possível registrar' });
  return res.status(200).json({ ok: true });
}

function emailHtml(l) {
  const linha = (rotulo, valor) => (valor ? `<tr><td style="padding:4px 12px 4px 0;color:#55615b">${rotulo}</td><td style="padding:4px 0"><strong>${escapar(valor)}</strong></td></tr>` : '');
  const wa = `https://wa.me/55${l.whatsapp.replace(/^55/, '')}`;
  return `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#202a26">
      <p>Novo contato recebido pelo site.</p>
      <table>
        ${linha('Nome', l.nome)}
        ${linha('WhatsApp', l.whatsapp)}
        ${linha('Assunto', l.servico)}
        ${linha('Mensagem', l.mensagem)}
        ${linha('Página', l.pagina)}
        ${linha('Origem', [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / '))}
        ${linha('Google Ads (gclid)', l.gclid ? 'sim' : '')}
      </table>
      <p><a href="${wa}" style="display:inline-block;padding:10px 16px;background:#1f7a4d;color:#fff;border-radius:6px;text-decoration:none">Chamar no WhatsApp</a></p>
    </div>`;
}
