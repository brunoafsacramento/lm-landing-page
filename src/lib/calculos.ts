// Cálculos das ferramentas. Valores legais vêm de data/fiscal.ts.
import type { Fiscal } from '../data/fiscal-padrao';

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Lê os valores que a página embute em <script type="application/json" id="lm-fiscal">. */
export function lerFiscal(): Fiscal {
  return JSON.parse(document.getElementById('lm-fiscal')!.textContent!, (k, v) => (k === 'ate' && v === null ? Infinity : v));
}

/** IRPF mensal com a redução da Lei 15.270/2025. `rendimentos` é o bruto; `base`, depois das deduções. */
export function irpfMensal(f: Fiscal, rendimentos: number, base: number) {
  const faixa = f.irpf.faixas.find((x) => base <= x.ate)!;
  const imposto = Math.max(0, base * faixa.aliquota - faixa.deducao);
  const { isentoAte, parcialAte, constante, fator } = f.irpf.reducao;
  const reducao = rendimentos <= isentoAte ? imposto : rendimentos <= parcialAte ? Math.max(0, constante - fator * rendimentos) : 0;
  return r2(Math.max(0, imposto - reducao));
}

export function aliquotaEfetivaSimples(tabela: Fiscal['simples']['anexoIII'], rbt12: number) {
  const faixa = tabela.find((x) => rbt12 <= x.ate);
  if (!faixa) return null; // acima do limite do Simples
  return (rbt12 * faixa.aliquota - faixa.deducao) / rbt12;
}

export function simularPfPj(f: Fiscal, renda: number) {
  // PF: autônomo que presta serviço a pessoa física (carnê-leão + INSS contribuinte individual)
  const inssPf = r2(Math.min(renda, f.tetoInss) * f.inss.contribuinteIndividual);
  const irPf = irpfMensal(f, renda, renda - inssPf);
  const totalPf = r2(inssPf + irPf);

  // PJ: Simples Nacional, Anexo III com fator R (pró-labore de 28% do faturamento)
  const efetiva = aliquotaEfetivaSimples(f.simples.anexoIII, renda * 12);
  if (efetiva === null) return null;
  const das = r2(renda * efetiva);
  const proLabore = r2(Math.min(renda, Math.max(renda * f.simples.fatorR, f.salarioMinimo)));
  const inssPj = r2(Math.min(proLabore, f.tetoInss) * f.inss.socioProLabore);
  const irPj = irpfMensal(f, proLabore, proLabore - inssPj);
  const totalPj = r2(das + inssPj + irPj + f.honorarioPj);

  return {
    pf: { inss: inssPf, ir: irPf, total: totalPf, liquido: r2(renda - totalPf) },
    pj: { das, aliquota: efetiva, proLabore, inss: inssPj, ir: irPj, honorario: f.honorarioPj, total: totalPj, liquido: r2(renda - totalPj) },
    economiaMensal: r2(totalPf - totalPj),
  };
}

/** Limite do MEI. `mesAbertura` (1–12) só quando o MEI foi aberto no ano atual. */
export function avaliarLimiteMei(f: Fiscal, faturamento: number, mesAbertura: number | null) {
  const meses = mesAbertura ? 13 - mesAbertura : 12;
  const limite = mesAbertura ? f.mei.limiteMensalProporcional * meses : f.mei.limiteAnual;
  const tolerancia = r2(limite * (1 + f.mei.tolerancia));
  const excesso = r2(faturamento - limite);
  const situacao = excesso <= 0 ? 'dentro' : faturamento <= tolerancia ? 'ate20' : 'acima20';
  return { limite, tolerancia, excesso, folga: r2(-excesso), situacao, meses } as const;
}
