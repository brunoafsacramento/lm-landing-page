// Preços avulsos e planos mensais. Editáveis no portal (Configurações → Serviços avulsos e Planos):
// o site mostra só os itens marcados "Exibir no site", na ordem definida lá.
// Os valores abaixo são o padrão local (tabelas enviadas pelo Lucas em 03/10/2026), usado sem acesso ao Supabase.
import { cms } from './cms';

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });

export type Avulso = { codigo: string; nome: string; preco: number; descricao: string; aPartirDe: boolean; prazo: string | null };

const avulso = (codigo: string, nome: string, preco: number, descricao: string): Avulso => ({ codigo, nome, preco, descricao, aPartirDe: true, prazo: null });

const avulsosPadrao: Record<string, Avulso> = {
  IR: avulso('IR', 'Declaração de Imposto de Renda', 200, 'Declaração completa, revisão de deduções e análise de malha.'),
  IRA: avulso('IRA', 'IR atrasado ou retificação', 250, 'Entrega de anos em atraso, retificação e saída da malha fina.'),
  MEI: avulso('MEI', 'Abertura de MEI', 200, 'Formalização, CNAE certo e orientação do DAS.'),
  MEIR: avulso('MEIR', 'Regularização ou baixa de MEI', 200, 'DAS e DASN em atraso, parcelamento, baixa sem pendência.'),
  ABR: avulso('ABR', 'Abertura de empresa (ME/Ltda)', 1200, 'Contrato social, CNPJ, emissão de nota fiscal, inscrições e enquadramento.'),
  ALT: avulso('ALT', 'Alteração ou baixa de empresa', 900, 'Alteração contratual, transformação (EI → Ltda) e encerramento.'),
  ITC: avulso('ITC', 'Doação, herança e ITCMD', 1200, 'Cálculo, declaração e emissão da guia.'),
  RGI: avulso('RGI', 'Registro de imóveis, compra e venda', 1200, 'Elaboração de compromissos, processo de escritura e atualização de matrícula.'),
  PF: avulso('PF', 'Consultoria financeira pessoal', 250, 'Diagnóstico e plano financeiro pessoal.'),
};

/** Avulsos por código. Um código ausente (oculto no portal) simplesmente não aparece nas páginas. */
export const avulsos: Record<string, Avulso> = cms
  ? Object.fromEntries(
      cms.avulsos
        .filter((a) => a.valor !== null)
        .map((a) => [
          a.codigo,
          {
            codigo: a.codigo,
            nome: a.nome_site?.trim() || a.nome,
            preco: Number(a.valor),
            descricao: a.descricao_site?.trim() || '',
            aPartirDe: a.preco_a_partir_de,
            prazo: a.prazo?.trim() || null,
          },
        ]),
    )
  : avulsosPadrao;

export type Plano = {
  id: string;
  nome: string;
  para: string;
  preco: number;
  limite: string;
  adicionais: string[];
  exibir: boolean;
};

const planosPadrao: Plano[] = [
  { id: 'pf-start', nome: 'PF Financeiro', para: 'Pessoa física', preco: 160, limite: 'Faturamento até R$ 81 mil', adicionais: ['+ R$ 15 por extrato adicional'], exibir: true },
  { id: 'mei-essencial', nome: 'MEI Essencial', para: 'MEI', preco: 190, limite: 'Faturamento até R$ 81 mil', adicionais: ['+ R$ 15 por extrato adicional', '+ R$ 15 por nota fiscal adicional', '+ R$ 100 por folha de pagamento'], exibir: true },
  // Oculto até o Lucas confirmar: a especialidade de transportadoras foi retirada do site.
  { id: 'mei-transportador', nome: 'MEI Transportador', para: 'MEI caminhoneiro', preco: 210, limite: 'Faturamento até R$ 251,6 mil', adicionais: ['+ R$ 15 por extrato adicional', '+ R$ 15 por nota fiscal adicional', '+ R$ 100 por folha de pagamento'], exibir: false },
  { id: 'me-growth', nome: 'ME/EPP Growth', para: 'Microempresa e EPP', preco: 500, limite: 'Faturamento até R$ 360 mil', adicionais: ['+ R$ 50 por funcionário adicional', '+ R$ 50 por sócio adicional'], exibir: true },
  { id: 'me-consultivo', nome: 'ME/EPP Consultivo', para: 'Microempresa e EPP', preco: 900, limite: 'Faturamento até R$ 1 milhão', adicionais: ['+ R$ 50 por funcionário adicional', '+ R$ 15 por extrato adicional'], exibir: true },
];

export const planos: Plano[] = cms
  ? cms.planos.map((p) => ({
      id: p.id,
      nome: p.nome_site?.trim() || p.nome,
      para: p.publico_alvo?.trim() || p.porte_empresarial || '',
      preco: Number(p.valor_mensal),
      limite: p.limite_texto?.trim() || p.faturamento_limite || '',
      adicionais: [...(p.planos_adicionais ?? [])].sort((a, b) => a.ordem - b.ordem).map((a) => `+ ${brl(Number(a.valor))} ${a.descricao}`),
      exibir: p.exibir_site,
    }))
  : planosPadrao;
