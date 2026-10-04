// Carrega o conteúdo editável pelo portal (Supabase) na hora do build, no mesmo padrão de fiscal.ts.
// Tabelas: site_conteudo (chave → valor), site_paginas_servico, servicos_catalogo (exibir_site) e planos (+ planos_adicionais).
// Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (build local), `cms` fica null e cada arquivo usa os valores locais.
// Na Vercel, se as variáveis existirem e a leitura falhar, o build falha de propósito (o site publicado continua no ar).
import { fiscal, type Fiscal } from './fiscal';

export type PaginaBanco = {
  slug: string;
  ordem: number;
  menu: string;
  titulo: string;
  descricao: string;
  h1: string;
  subtitulo: string;
  prazo: string | null;
  mensagem: string;
  servico_form: string;
  para_quem: string[];
  como_funciona: string[];
  documentos: { titulo: string; itens: string[] } | null;
  precos: string[];
  perguntas: { p: string; r: string }[];
};

export type AvulsoBanco = {
  codigo: string;
  nome: string;
  nome_site: string | null;
  valor: number | null;
  descricao_site: string | null;
  preco_a_partir_de: boolean;
  prazo: string | null;
};

export type PlanoBanco = {
  id: string;
  nome: string;
  nome_site: string | null;
  porte_empresarial: string | null;
  publico_alvo: string | null;
  limite_texto: string | null;
  faturamento_limite: string | null;
  valor_mensal: number;
  exibir_site: boolean;
  planos_adicionais: { descricao: string; valor: number; ordem: number }[];
};

export type Cms = {
  conteudo: Map<string, unknown>;
  paginas: PaginaBanco[];
  avulsos: AvulsoBanco[];
  planos: PlanoBanco[];
};

const naVercel = Boolean(process.env.VERCEL);

/** Erro de conteúdo: na Vercel interrompe o build; localmente só avisa. */
export function problema(msg: string) {
  if (naVercel) throw new Error(`[cms] ${msg}`);
  console.warn(`[cms] ${msg}`);
}

async function carregar(): Promise<Cms | null> {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    console.warn('[cms] Supabase não configurado: usando o conteúdo local de src/data');
    return null;
  }

  try {
    const get = async <T>(caminho: string): Promise<T> => {
      const r = await fetch(`${url}/rest/v1/${caminho}`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } });
      if (!r.ok) throw new Error(`${caminho.split('?')[0]}: HTTP ${r.status} ${await r.text()}`);
      return r.json() as Promise<T>;
    };
    const [linhas, paginas, avulsos, planos] = await Promise.all([
      get<{ chave: string; valor: unknown }[]>('site_conteudo?select=chave,valor'),
      get<PaginaBanco[]>('site_paginas_servico?select=*&order=ordem,slug'),
      get<AvulsoBanco[]>(
        'servicos_catalogo?select=codigo,nome,nome_site,valor,descricao_site,preco_a_partir_de,prazo' +
          '&exibir_site=eq.true&ativo=eq.true&codigo=not.is.null&order=ordem_site,nome',
      ),
      get<PlanoBanco[]>(
        'planos?select=id,nome,nome_site,porte_empresarial,publico_alvo,limite_texto,faturamento_limite,valor_mensal,exibir_site,planos_adicionais(descricao,valor,ordem)' +
          '&ativo=eq.true&order=ordem_site,valor_mensal',
      ),
    ]);
    console.log(`[cms] conteúdo carregado do Supabase (${linhas.length} chaves, ${paginas.length} páginas, ${avulsos.length} avulsos, ${planos.length} planos)`);
    return { conteudo: new Map(linhas.map((l) => [l.chave, l.valor])), paginas, avulsos, planos };
  } catch (e) {
    if (naVercel) throw new Error(`[cms] Falha ao ler o conteúdo no Supabase: ${(e as Error).message}`);
    console.warn(`[cms] ${(e as Error).message}. Usando o conteúdo local.`);
    return null;
  }
}

export const cms = await carregar();

/** Valor de site_conteudo, ou undefined se a chave não existe (aí vale o padrão local). */
export const conteudo = (chave: string): unknown => cms?.conteudo.get(chave);

// ---------- Marcadores de valores fiscais nos textos ----------
// Formato: {chave} (moeda), {chave:mil} (R$ 81 mil), {chave:pct} (20%), {chave:num}.
// Chaves: as de parametros_fiscais (ex.: mei.limite_anual) e faixas como simples_anexo_iii.1.aliquota.

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });

function valoresFiscais(f: Fiscal): Record<string, number> {
  const v: Record<string, number> = {
    'mei.limite_anual': f.mei.limiteAnual,
    'mei.limite_mensal_proporcional': f.mei.limiteMensalProporcional,
    'mei.tolerancia': f.mei.tolerancia,
    'mei.parcela_minima': f.mei.parcelaMinima,
    'mei.multa_minima_dasn': f.mei.multaMinimaDasn,
    salario_minimo: f.salarioMinimo,
    'inss.teto': f.tetoInss,
    'inss.contribuinte_individual': f.inss.contribuinteIndividual,
    'inss.socio_pro_labore': f.inss.socioProLabore,
    'irpf.reducao_isento_ate': f.irpf.reducao.isentoAte,
    'irpf.reducao_parcial_ate': f.irpf.reducao.parcialAte,
    'irpf.reducao_constante': f.irpf.reducao.constante,
    'irpf.reducao_fator': f.irpf.reducao.fator,
    'irpf.multa_minima_atraso': f.irpf.multaMinimaAtraso,
    'irpf.quota_minima': f.irpf.quotaMinima,
    'irpf.isencao_unico_imovel': f.irpf.isencaoUnicoImovel,
    'irpf.isencao_lucros_mensal': f.irpf.isencaoLucrosMensal,
    'simples.fator_r': f.simples.fatorR,
    'simulador.honorario_pj': f.honorarioPj,
  };
  const tabelas = { irpf_mensal: f.irpf.faixas, simples_anexo_iii: f.simples.anexoIII, simples_anexo_v: f.simples.anexoV };
  for (const [nome, faixas] of Object.entries(tabelas)) {
    faixas.forEach((x, i) => {
      v[`${nome}.${i + 1}.aliquota`] = x.aliquota;
      v[`${nome}.${i + 1}.deducao`] = x.deducao;
      if (Number.isFinite(x.ate)) v[`${nome}.${i + 1}.ate`] = x.ate;
    });
  }
  return v;
}

const valores = valoresFiscais(fiscal);
const formatos: Record<string, (v: number) => string> = {
  brl,
  mil: (v) => `R$ ${(v / 1000).toLocaleString('pt-BR')} mil`,
  pct: (v) => `${(v * 100).toLocaleString('pt-BR')}%`,
  num: (v) => v.toLocaleString('pt-BR'),
};

/** Troca {chave:formato} pelo valor fiscal formatado. */
export function aplicarMarcadores(texto: string): string {
  return texto.replace(/\{([a-z0-9_.]+)(?::([a-z]+))?\}/g, (marcador, chave: string, formato = 'brl') => {
    const v = valores[chave];
    const fmt = formatos[formato];
    if (v === undefined || !fmt) {
      problema(`Marcador desconhecido no texto: ${marcador}`);
      return marcador;
    }
    return fmt(v);
  });
}
