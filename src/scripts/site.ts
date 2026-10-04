// Comportamento comum a todas as páginas: menu, consentimento, medição, UTMs e formulários.

type Config = { ga4: string; googleAds: string; metaPixel: string };
type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void };
    _fbq?: unknown;
    lmEvento: (nome: string, params?: Params) => void;
  }
}

const config: Config = JSON.parse(document.getElementById('lm-config')?.textContent || '{}');
const temMedicao = Boolean(config.ga4 || config.googleAds || config.metaPixel);
const CHAVE_CONSENTIMENTO = 'lm_cookies';

const ler = (store: Storage, chave: string) => { try { return store.getItem(chave); } catch { return null; } };
const gravar = (store: Storage, chave: string, valor: string) => { try { store.setItem(chave, valor); } catch { /* modo privado */ } };

// ---------- Menu do celular ----------
const menuBotao = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');
function alternarMenu(abrir?: boolean) {
  if (!menu || !menuBotao) return;
  const aberto = menu.classList.toggle('open', abrir);
  menuBotao.setAttribute('aria-expanded', String(aberto));
  menuBotao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}
menuBotao?.addEventListener('click', () => alternarMenu());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('open')) { alternarMenu(false); menuBotao?.focus(); }
});

// ---------- Máscaras ----------
// Telefone: (11) 98786-7389 ou (11) 3456-7890, só dígitos nacionais.
function formatarTelefone(digitos: string) {
  const d = digitos.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
document.querySelectorAll<HTMLInputElement>('[data-telefone]').forEach((campo) => {
  campo.addEventListener('input', () => { campo.value = formatarTelefone(campo.value); });
});
// Dinheiro: só inteiros, com separador de milhar enquanto digita (75000 → 75.000).
document.querySelectorAll<HTMLInputElement>('[data-moeda]').forEach((campo) => {
  campo.addEventListener('input', () => {
    const d = campo.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 10);
    campo.value = d ? Number(d).toLocaleString('pt-BR') : '';
  });
});

// ---------- Medição (só depois do aceite) ----------
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() { window.dataLayer.push(arguments); };
window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

let carregado = false;
function carregarMedicao() {
  if (carregado || !temMedicao) return;
  carregado = true;
  window.gtag!('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
  const tagPrincipal = config.ga4 || config.googleAds;
  if (tagPrincipal) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${tagPrincipal}`;
    document.head.appendChild(s);
    window.gtag!('js', new Date());
    if (config.ga4) window.gtag!('config', config.ga4);
    if (config.googleAds) window.gtag!('config', config.googleAds);
  }
  if (config.metaPixel) {
    const f: any = function (...args: unknown[]) { f.callMethod ? f.callMethod(...args) : f.queue.push(args); };
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    window.fbq = window._fbq = f;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq!('init', config.metaPixel);
    window.fbq!('track', 'PageView');
  }
}

const eventosMeta: Record<string, string> = { clique_whatsapp: 'Contact', clique_telefone: 'Contact', envio_formulario: 'Lead', download_checklist: 'Lead' };

window.lmEvento = (nome, params = {}) => {
  const dados = { pagina: location.pathname, ...params };
  window.gtag?.('event', nome, dados);
  if (window.fbq && eventosMeta[nome]) window.fbq('track', eventosMeta[nome], dados);
};

// ---------- Aviso de cookies ----------
const banner = document.getElementById('cookie-banner');
const escolha = ler(localStorage, CHAVE_CONSENTIMENTO);
if (temMedicao) {
  if (escolha === 'aceito') carregarMedicao();
  else if (!escolha && banner) banner.hidden = false;
}
banner?.querySelectorAll<HTMLButtonElement>('[data-cookie]').forEach((b) =>
  b.addEventListener('click', () => {
    const aceitou = b.dataset.cookie === 'aceitar';
    gravar(localStorage, CHAVE_CONSENTIMENTO, aceitou ? 'aceito' : 'recusado');
    banner.hidden = true;
    if (aceitou) carregarMedicao();
    else if (carregado) location.reload(); // revoga: recarrega sem as tags
  }),
);
document.querySelectorAll('[data-abrir-cookies]').forEach((b) => b.addEventListener('click', () => { if (banner) banner.hidden = false; }));

// ---------- Cliques no WhatsApp e no telefone ----------
document.addEventListener('click', (e) => {
  const link = (e.target as Element).closest?.('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('https://wa.me/')) {
    const texto = decodeURIComponent(new URL(href).searchParams.get('text') || '');
    const servico = texto.match(/\(([^)]+)\)\s*$/)?.[1] || 'site';
    window.lmEvento('clique_whatsapp', { servico });
  } else if (href.startsWith('tel:')) {
    window.lmEvento('clique_telefone');
  }
});

// ---------- UTMs e gclid (primeiro contato da sessão) ----------
const CHAVE_UTM = 'lm_utm';
const busca = new URLSearchParams(location.search);
const campos = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'];
if (campos.some((c) => busca.get(c))) {
  gravar(sessionStorage, CHAVE_UTM, JSON.stringify(Object.fromEntries(campos.map((c) => [c, busca.get(c) || '']))));
}
const utm: Record<string, string> = JSON.parse(ler(sessionStorage, CHAVE_UTM) || '{}');

// ---------- Formulários de contato ----------
document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const botao = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  (form.elements.namedItem('pagina') as HTMLInputElement).value = location.pathname;
  for (const c of campos) (form.elements.namedItem(c) as HTMLInputElement).value = utm[c] || '';

  // Erro inline por campo: mensagem abaixo do campo, aria-invalid e foco no primeiro com problema.
  const mostrarErro = (nome: string, msg: string) => {
    const campo = form.elements.namedItem(nome) as HTMLElement | null;
    const alvo = form.querySelector<HTMLElement>(`[data-erro="${nome}"]`);
    if (alvo) alvo.textContent = msg;
    if (campo) { if (msg) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid'); }
  };
  const validar = (dados: Record<string, string>) => {
    const digitos = (dados.whatsapp || '').replace(/\D/g, '');
    const erros: Record<string, string> = {
      nome: !dados.nome?.trim() ? 'Escreva o seu nome.' : '',
      whatsapp: !digitos ? 'Informe o número do WhatsApp com DDD.' : digitos.length < 10 || digitos.length > 11 ? 'O número precisa ter DDD e 8 ou 9 dígitos, ex.: (11) 90000-0000.' : '',
      servico: !dados.servico ? 'Escolha o assunto da conversa.' : '',
      consentimento: !dados.consentimento ? 'Para enviar, autorize o contato pelo WhatsApp.' : '',
    };
    for (const [nome, msg] of Object.entries(erros)) mostrarErro(nome, msg);
    return Object.keys(erros).find((n) => erros[n]) ?? null;
  };
  // Ao corrigir o campo, o erro some na hora.
  for (const nome of ['nome', 'whatsapp', 'servico', 'consentimento']) {
    (form.elements.namedItem(nome) as HTMLElement | null)?.addEventListener('input', () => mostrarErro(nome, ''));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    const dados = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const primeiroErro = validar(dados);
    if (primeiroErro) {
      (form.elements.namedItem(primeiroErro) as HTMLElement | null)?.focus();
      status.textContent = 'Confira os campos destacados.';
      status.classList.add('erro');
      return;
    }

    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando…';
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dados, consentimento: true }) });
      if (!r.ok) throw new Error(String(r.status));
      gravar(sessionStorage, 'lm_lead', JSON.stringify({ servico: dados.servico }));
      location.href = form.dataset.destino || '/obrigado';
    } catch {
      botao.disabled = false;
      botao.removeAttribute('aria-busy');
      status.classList.add('erro');
      status.innerHTML = `Não conseguimos enviar agora. <a class="text-link" target="_blank" rel="noopener" href="${form.dataset.fallback}">Fale direto pelo WhatsApp</a>.`;
    }
  });
});

export {};
