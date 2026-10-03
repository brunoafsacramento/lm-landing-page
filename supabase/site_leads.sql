-- Contatos recebidos pelo formulário do site (www.lmcontab.com.br).
-- Rodar uma vez no SQL Editor do Supabase do portal.
-- Só a função /api/lead (chave service_role) escreve e lê; o RLS sem políticas bloqueia o resto.

create table if not exists public.site_leads (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  nome          text not null,
  whatsapp      text not null,
  servico       text not null,
  mensagem      text,
  origem        text,          -- código da página, ex.: site-ir
  pagina        text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  gclid         text,
  consentimento boolean not null default false,
  ip_hash       text,
  status        text not null default 'novo'  -- novo, em_contato, orcamento, cliente, descartado
);

create index if not exists site_leads_criado_em_idx on public.site_leads (criado_em desc);
create index if not exists site_leads_ip_hash_idx on public.site_leads (ip_hash, criado_em);

alter table public.site_leads enable row level security;

-- Limpeza pela política de privacidade: contatos sem conversão por mais de 12 meses.
-- (rodar manualmente ou agendar com pg_cron)
-- delete from public.site_leads where criado_em < now() - interval '12 months' and status in ('novo', 'em_contato', 'descartado');
