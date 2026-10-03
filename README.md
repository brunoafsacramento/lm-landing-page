# Site da LM Contabilidade

Site em [Astro](https://astro.build), publicado na Vercel em www.lmcontab.com.br.

```bash
npm install
npm run dev      # http://localhost:4321 (o formulário não funciona aqui: /api só roda na Vercel)
npm run build    # gera dist/
```

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Contato, CRC, foto, bio, provas, depoimentos, horário | `src/data/site.ts` |
| IDs do GA4, Google Ads e pixel da Meta | `src/data/site.ts` → `medicao` |
| Preços avulsos e planos mensais | `src/data/precos.ts` |
| Conteúdo das páginas de serviço (textos, FAQ, documentos) | `src/data/servicos.ts` |
| Limites, alíquotas e tabelas (revisar todo janeiro) | Supabase: tabelas `parametros_fiscais` e `faixas_tributarias` (ver abaixo) |
| Checklist do IR | `src/data/checklist-ir.ts` |
| Visual | `src/styles/global.css` |

Campos `null` ou vazios em `site.ts` escondem o bloco correspondente. Preencher é suficiente para o bloco aparecer.

## Valores fiscais

Limite do MEI, tabelas do IR e do Simples, teto do INSS etc. ficam no Supabase do portal, para o Lucas atualizar sem mexer em código:

1. Rodar `supabase/parametros_fiscais.sql` uma vez (cria as tabelas já preenchidas).
2. Para atualizar: Supabase → Table Editor → `parametros_fiscais` / `faixas_tributarias`. Cada parâmetro tem uma descrição; percentuais em decimal (20% = 0.20).
3. O site lê os valores a cada publicação. Depois de alterar, é preciso publicar de novo (Vercel → Deployments → Redeploy, ou um Deploy Hook).

"Valores vigentes em …" usa a data da última alteração. Sem acesso ao Supabase (build local), o site usa `src/data/fiscal-padrao.ts`.
Na Vercel, se a leitura falhar, o build falha de propósito e o site publicado continua no ar.
Futuro: tela no portal para editar esses valores e publicar o site com um clique.

## Formulário de contato

`api/lead.js` grava na tabela `site_leads` do Supabase do portal e manda e-mail pela função `send-email`.

1. Rodar `supabase/site_leads.sql` no SQL Editor do Supabase.
2. Na Vercel (Settings → Environment Variables): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEAD_IP_SALT` (texto aleatório) e, se quiser, `LEAD_EMAIL_TO`.
3. Fase 2: `APICE_WEBHOOK_URL` repassa cada contato ao Ápice.

Sem as variáveis, o formulário mostra o link do WhatsApp como alternativa.

## Medição

Preencher `medicao.ga4` (e `googleAds`/`metaPixel`, se houver) em `site.ts`. O aviso de cookies passa a aparecer sozinho, e nada é carregado antes do aceite.

Eventos enviados: `clique_whatsapp` (servico, pagina), `clique_telefone`, `envio_formulario`, `download_checklist`, `uso_simulador`.
No Google Ads (conta 566-009-2692), importar `clique_whatsapp` e `envio_formulario` do GA4 como conversões.

Cada link de WhatsApp termina com um código de origem, ex.: `(site-ir)`, para saber de onde veio a conversa.
