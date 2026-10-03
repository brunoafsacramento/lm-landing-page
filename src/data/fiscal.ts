// Carrega os valores fiscais do Supabase na hora do build (só no servidor; nunca vai para o navegador).
// Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (build local), usa fiscal-padrao.ts.
// Na Vercel, se as variáveis existirem e a leitura falhar, o build falha de propósito:
// o site publicado continua no ar, sem risco de sair com valores desatualizados.
import { fiscalPadrao, type Faixa, type Fiscal } from './fiscal-padrao';

export type { Fiscal };

type Linha = { chave: string; valor: number; atualizado_em: string };
type LinhaFaixa = { tabela: string; ordem: number; ate: number | null; aliquota: number; deducao: number };

async function carregar(): Promise<Fiscal> {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    console.warn('[fiscal] Supabase não configurado: usando valores padrão de fiscal-padrao.ts');
    return fiscalPadrao;
  }

  try {
    const get = async <T>(caminho: string): Promise<T> => {
      const r = await fetch(`${url}/rest/v1/${caminho}`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } });
      if (!r.ok) throw new Error(`${caminho}: HTTP ${r.status}`);
      return r.json() as Promise<T>;
    };
    const [linhas, faixas] = await Promise.all([
      get<Linha[]>('parametros_fiscais?select=chave,valor,atualizado_em'),
      get<LinhaFaixa[]>('faixas_tributarias?select=tabela,ordem,ate,aliquota,deducao&order=tabela,ordem'),
    ]);

    const mapa = new Map(linhas.map((l) => [l.chave, Number(l.valor)]));
    const p = (k: string) => {
      const v = mapa.get(k);
      if (v === undefined || Number.isNaN(v)) throw new Error(`Parâmetro ausente: ${k}`);
      return v;
    };
    const tabela = (nome: string): Faixa[] => {
      const t = faixas.filter((f) => f.tabela === nome).map((f) => ({ ate: f.ate === null ? Infinity : Number(f.ate), aliquota: Number(f.aliquota), deducao: Number(f.deducao) }));
      if (!t.length) throw new Error(`Tabela ausente: ${nome}`);
      return t;
    };
    const ultima = [...linhas.map((l) => l.atualizado_em)].sort().at(-1);

    const fiscal: Fiscal = {
      vigencia: ultima ? new Date(ultima).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }) : fiscalPadrao.vigencia,
      mei: {
        limiteAnual: p('mei.limite_anual'),
        limiteMensalProporcional: p('mei.limite_mensal_proporcional'),
        tolerancia: p('mei.tolerancia'),
        parcelaMinima: p('mei.parcela_minima'),
        multaMinimaDasn: p('mei.multa_minima_dasn'),
      },
      salarioMinimo: p('salario_minimo'),
      tetoInss: p('inss.teto'),
      irpf: {
        faixas: tabela('irpf_mensal'),
        reducao: {
          isentoAte: p('irpf.reducao_isento_ate'),
          parcialAte: p('irpf.reducao_parcial_ate'),
          constante: p('irpf.reducao_constante'),
          fator: p('irpf.reducao_fator'),
        },
        multaMinimaAtraso: p('irpf.multa_minima_atraso'),
        quotaMinima: p('irpf.quota_minima'),
        isencaoUnicoImovel: p('irpf.isencao_unico_imovel'),
        isencaoLucrosMensal: p('irpf.isencao_lucros_mensal'),
      },
      inss: {
        contribuinteIndividual: p('inss.contribuinte_individual'),
        socioProLabore: p('inss.socio_pro_labore'),
      },
      simples: {
        anexoIII: tabela('simples_anexo_iii'),
        anexoV: tabela('simples_anexo_v'),
        fatorR: p('simples.fator_r'),
      },
      honorarioPj: p('simulador.honorario_pj'),
    };
    console.log(`[fiscal] valores carregados do Supabase (vigência: ${fiscal.vigencia})`);
    return fiscal;
  } catch (e) {
    if (process.env.VERCEL) throw new Error(`[fiscal] Falha ao ler os parâmetros no Supabase: ${(e as Error).message}`);
    console.warn(`[fiscal] ${(e as Error).message}. Usando valores padrão.`);
    return fiscalPadrao;
  }
}

export const fiscal = await carregar();

/** Valores para as ferramentas no navegador (JSON sem Infinity). */
export const fiscalJson = JSON.stringify(fiscal, (_, v) => (v === Infinity ? null : v));
