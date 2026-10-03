// Valores padrão, usados só quando o site não consegue ler o Supabase (ex.: build local sem variáveis).
// A fonte oficial são as tabelas `parametros_fiscais` e `faixas_tributarias` (supabase/parametros_fiscais.sql),
// que o Lucas atualiza a cada ano.

export type Faixa = { ate: number; aliquota: number; deducao: number };

export const fiscalPadrao = {
  vigencia: 'outubro de 2026',

  mei: {
    limiteAnual: 81_000,
    limiteMensalProporcional: 6_750,
    tolerancia: 0.2,
    parcelaMinima: 50,
    multaMinimaDasn: 50,
  },

  salarioMinimo: 1_621,
  tetoInss: 8_475.55,

  irpf: {
    faixas: [
      { ate: 2_428.8, aliquota: 0, deducao: 0 },
      { ate: 2_826.65, aliquota: 0.075, deducao: 182.16 },
      { ate: 3_751.05, aliquota: 0.15, deducao: 394.16 },
      { ate: 4_664.68, aliquota: 0.225, deducao: 675.49 },
      { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
    ] as Faixa[],
    reducao: { isentoAte: 5_000, parcialAte: 7_350, constante: 978.62, fator: 0.133145 },
    multaMinimaAtraso: 165.74,
    quotaMinima: 50,
    isencaoUnicoImovel: 440_000,
    isencaoLucrosMensal: 50_000,
  },

  inss: {
    contribuinteIndividual: 0.2,
    socioProLabore: 0.11,
  },

  simples: {
    anexoIII: [
      { ate: 180_000, aliquota: 0.06, deducao: 0 },
      { ate: 360_000, aliquota: 0.112, deducao: 9_360 },
      { ate: 720_000, aliquota: 0.135, deducao: 17_640 },
      { ate: 1_800_000, aliquota: 0.16, deducao: 35_640 },
      { ate: 3_600_000, aliquota: 0.21, deducao: 125_640 },
      { ate: 4_800_000, aliquota: 0.33, deducao: 648_000 },
    ] as Faixa[],
    anexoV: [
      { ate: 180_000, aliquota: 0.155, deducao: 0 },
      { ate: 360_000, aliquota: 0.18, deducao: 4_500 },
      { ate: 720_000, aliquota: 0.195, deducao: 9_900 },
      { ate: 1_800_000, aliquota: 0.205, deducao: 17_100 },
      { ate: 3_600_000, aliquota: 0.23, deducao: 62_100 },
      { ate: 4_800_000, aliquota: 0.305, deducao: 540_000 },
    ] as Faixa[],
    fatorR: 0.28,
  },

  honorarioPj: 500,
};

export type Fiscal = typeof fiscalPadrao;
