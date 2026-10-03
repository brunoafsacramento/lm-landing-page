// Tabelas enviadas pelo Lucas em 03/10/2026 (Honorários Mensal 2026 e serviços avulsos).

export type Avulso = { codigo: string; nome: string; preco: number; descricao: string };

export const avulsos: Record<string, Avulso> = {
  IR: { codigo: 'IR', nome: 'Declaração de Imposto de Renda', preco: 200, descricao: 'Declaração completa, revisão de deduções e análise de malha.' },
  IRA: { codigo: 'IRA', nome: 'IR atrasado ou retificação', preco: 250, descricao: 'Entrega de anos em atraso, retificação e saída da malha fina.' },
  MEI: { codigo: 'MEI', nome: 'Abertura de MEI', preco: 200, descricao: 'Formalização, CNAE certo e orientação do DAS.' },
  MEIR: { codigo: 'MEIR', nome: 'Regularização ou baixa de MEI', preco: 200, descricao: 'DAS e DASN em atraso, parcelamento, baixa sem pendência.' },
  ABR: { codigo: 'ABR', nome: 'Abertura de empresa (ME/Ltda)', preco: 1200, descricao: 'Contrato social, CNPJ, emissão de nota fiscal, inscrições e enquadramento.' },
  ALT: { codigo: 'ALT', nome: 'Alteração ou baixa de empresa', preco: 900, descricao: 'Alteração contratual, transformação (EI → Ltda) e encerramento.' },
  ITC: { codigo: 'ITC', nome: 'Doação, herança e ITCMD', preco: 1200, descricao: 'Cálculo, declaração e emissão da guia.' },
  RGI: { codigo: 'RGI', nome: 'Registro de imóveis, compra e venda', preco: 1200, descricao: 'Elaboração de compromissos, processo de escritura e atualização de matrícula.' },
  PF: { codigo: 'PF', nome: 'Consultoria financeira pessoal', preco: 250, descricao: 'Diagnóstico e plano financeiro pessoal.' },
};

export type Plano = {
  id: string;
  nome: string;
  para: string;
  preco: number;
  limite: string;
  adicionais: string[];
  exibir: boolean;
};

export const planos: Plano[] = [
  { id: 'pf-start', nome: 'PF Financeiro', para: 'Pessoa física', preco: 160, limite: 'Faturamento até R$ 81 mil', adicionais: ['+ R$ 15 por extrato adicional'], exibir: true },
  { id: 'mei-essencial', nome: 'MEI Essencial', para: 'MEI', preco: 190, limite: 'Faturamento até R$ 81 mil', adicionais: ['+ R$ 15 por extrato adicional', '+ R$ 15 por nota fiscal adicional', '+ R$ 100 por folha de pagamento'], exibir: true },
  // Oculto até o Lucas confirmar: a especialidade de transportadoras foi retirada do site.
  { id: 'mei-transportador', nome: 'MEI Transportador', para: 'MEI caminhoneiro', preco: 210, limite: 'Faturamento até R$ 251,6 mil', adicionais: ['+ R$ 15 por extrato adicional', '+ R$ 15 por nota fiscal adicional', '+ R$ 100 por folha de pagamento'], exibir: false },
  { id: 'me-growth', nome: 'ME/EPP Growth', para: 'Microempresa e EPP', preco: 500, limite: 'Faturamento até R$ 360 mil', adicionais: ['+ R$ 50 por funcionário adicional', '+ R$ 50 por sócio adicional'], exibir: true },
  { id: 'me-consultivo', nome: 'ME/EPP Consultivo', para: 'Microempresa e EPP', preco: 900, limite: 'Faturamento até R$ 1 milhão', adicionais: ['+ R$ 50 por funcionário adicional', '+ R$ 15 por extrato adicional'], exibir: true },
];

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
