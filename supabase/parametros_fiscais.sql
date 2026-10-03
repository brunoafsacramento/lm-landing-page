-- Parâmetros fiscais usados pelo site (calculadoras e textos). Rodar uma vez no SQL Editor do Supabase do portal.
-- O Lucas atualiza os valores em Table Editor → parametros_fiscais / faixas_tributarias (futuramente, por uma tela no portal).
-- O site lê estas tabelas a cada publicação. "valores vigentes em …" usa a data da última alteração.
-- Percentuais em decimal: 20% = 0.20.

create table if not exists public.parametros_fiscais (
  chave         text primary key,
  valor         numeric not null,
  descricao     text not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.faixas_tributarias (
  tabela        text not null,     -- irpf_mensal, simples_anexo_iii, simples_anexo_v
  ordem         int  not null,
  ate           numeric,           -- vazio = sem limite (última faixa)
  aliquota      numeric not null,  -- decimal: 7,5% = 0.075
  deducao       numeric not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (tabela, ordem)
);

create or replace function public.tocar_atualizado_em() returns trigger language plpgsql as $$
begin new.atualizado_em := now(); return new; end $$;

drop trigger if exists parametros_fiscais_atualizado on public.parametros_fiscais;
create trigger parametros_fiscais_atualizado before update on public.parametros_fiscais for each row execute function public.tocar_atualizado_em();
drop trigger if exists faixas_tributarias_atualizado on public.faixas_tributarias;
create trigger faixas_tributarias_atualizado before update on public.faixas_tributarias for each row execute function public.tocar_atualizado_em();

alter table public.parametros_fiscais enable row level security;
alter table public.faixas_tributarias enable row level security;
-- Leitura pública (são valores de lei); escrita só pelo painel do Supabase ou pelo portal com service_role.
drop policy if exists "leitura publica" on public.parametros_fiscais;
create policy "leitura publica" on public.parametros_fiscais for select using (true);
drop policy if exists "leitura publica" on public.faixas_tributarias;
create policy "leitura publica" on public.faixas_tributarias for select using (true);

insert into public.parametros_fiscais (chave, valor, descricao) values
  ('mei.limite_anual',              81000,    'MEI: limite de faturamento anual (R$)'),
  ('mei.limite_mensal_proporcional', 6750,    'MEI: limite por mês de atividade no ano de abertura (R$)'),
  ('mei.tolerancia',                0.20,     'MEI: excesso tolerado sobre o limite antes do desenquadramento retroativo (0.20 = 20%)'),
  ('mei.parcela_minima',            50,       'MEI: parcela mínima do parcelamento de débitos (R$)'),
  ('mei.multa_minima_dasn',         50,       'MEI: multa mínima por atraso da DASN-SIMEI (R$)'),
  ('salario_minimo',                1621,     'Salário mínimo nacional (R$)'),
  ('inss.teto',                     8475.55,  'Teto do salário de contribuição do INSS (R$)'),
  ('inss.contribuinte_individual',  0.20,     'INSS do autônomo que presta serviço a pessoa física (0.20 = 20%)'),
  ('inss.socio_pro_labore',         0.11,     'INSS do sócio sobre o pró-labore (0.11 = 11%)'),
  ('irpf.reducao_isento_ate',       5000,     'IRPF: rendimento mensal até o qual o imposto é zerado pela redução (R$)'),
  ('irpf.reducao_parcial_ate',      7350,     'IRPF: rendimento mensal até o qual há redução parcial (R$)'),
  ('irpf.reducao_constante',        978.62,   'IRPF: constante da fórmula de redução parcial (R$)'),
  ('irpf.reducao_fator',            0.133145, 'IRPF: fator da fórmula de redução parcial'),
  ('irpf.multa_minima_atraso',      165.74,   'IRPF: multa mínima por entrega em atraso (R$)'),
  ('irpf.quota_minima',             50,       'IRPF: valor mínimo de cada quota do imposto a pagar (R$)'),
  ('irpf.isencao_unico_imovel',     440000,   'Ganho de capital: valor máximo de venda do único imóvel com isenção (R$)'),
  ('irpf.isencao_lucros_mensal',    50000,    'Lucros e dividendos: valor mensal isento por empresa (R$)'),
  ('simples.fator_r',               0.28,     'Simples Nacional: fator R mínimo para o Anexo III (0.28 = 28%)'),
  ('simulador.honorario_pj',        500,      'Simulador PF x PJ: honorário mensal considerado para a PJ (R$)')
on conflict (chave) do nothing;

insert into public.faixas_tributarias (tabela, ordem, ate, aliquota, deducao) values
  ('irpf_mensal', 1, 2428.80, 0,     0),
  ('irpf_mensal', 2, 2826.65, 0.075, 182.16),
  ('irpf_mensal', 3, 3751.05, 0.15,  394.16),
  ('irpf_mensal', 4, 4664.68, 0.225, 675.49),
  ('irpf_mensal', 5, null,    0.275, 908.73),
  ('simples_anexo_iii', 1, 180000,  0.06,  0),
  ('simples_anexo_iii', 2, 360000,  0.112, 9360),
  ('simples_anexo_iii', 3, 720000,  0.135, 17640),
  ('simples_anexo_iii', 4, 1800000, 0.16,  35640),
  ('simples_anexo_iii', 5, 3600000, 0.21,  125640),
  ('simples_anexo_iii', 6, 4800000, 0.33,  648000),
  ('simples_anexo_v', 1, 180000,  0.155, 0),
  ('simples_anexo_v', 2, 360000,  0.18,  4500),
  ('simples_anexo_v', 3, 720000,  0.195, 9900),
  ('simples_anexo_v', 4, 1800000, 0.205, 17100),
  ('simples_anexo_v', 5, 3600000, 0.23,  62100),
  ('simples_anexo_v', 6, 4800000, 0.305, 540000)
on conflict (tabela, ordem) do nothing;
