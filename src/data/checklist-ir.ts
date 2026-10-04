// Checklist de documentos do IR. Editável no portal (Configurações → Site → Checklist do IR),
// chave checklist_ir de site_conteudo. A lista abaixo é o padrão local, usado sem acesso ao Supabase.
import { conteudo } from './cms';

export type GrupoChecklist = { grupo: string; itens: string[] };

const padrao: GrupoChecklist[] = [
  {
    grupo: 'Dados pessoais',
    itens: [
      'CPF e título de eleitor',
      'Comprovante de endereço atualizado',
      'CPF e data de nascimento dos dependentes',
      'Dados bancários para restituição (conta em seu nome)',
      'Cópia da última declaração entregue e do recibo',
    ],
  },
  {
    grupo: 'Rendimentos',
    itens: [
      'Informe de rendimentos do empregador (salário, 13º, férias, PLR)',
      'Informe de aposentadoria ou pensão do INSS',
      'Recibos de trabalho autônomo e carnê-leão pago',
      'Comprovantes de aluguéis recebidos',
      'Informes de bancos, corretoras e fintechs (aplicações, poupança, saldo em 31/12)',
      'Notas de corretagem e controle de ganhos em bolsa, se tiver',
      'Pensão alimentícia recebida',
    ],
  },
  {
    grupo: 'Despesas que podem ser deduzidas',
    itens: [
      'Recibos e notas de médicos, dentistas, psicólogos, fisioterapeutas e hospitais',
      'Extrato anual do plano de saúde, separado por beneficiário',
      'Comprovantes de mensalidade escolar e faculdade',
      'Informe da previdência privada PGBL',
      'Pensão alimentícia paga por decisão judicial ou escritura',
      'Recibos de doações a fundos incentivados',
    ],
  },
  {
    grupo: 'Bens, dívidas e operações',
    itens: [
      'Escritura, contrato ou recibo de compra e venda de imóveis',
      'Documento de veículos comprados ou vendidos no ano',
      'Extrato de financiamentos e empréstimos (saldo em 31/12)',
      'Documentos de herança ou doação recebida ou feita',
      'Comprovantes de consórcio',
      'Contas e investimentos no exterior',
    ],
  },
];

const banco = conteudo('checklist_ir');
const valido = (v: unknown): v is GrupoChecklist[] =>
  Array.isArray(v) && v.length > 0 && v.every((g) => g && typeof g.grupo === 'string' && Array.isArray(g.itens));

export const checklistIr: GrupoChecklist[] = valido(banco)
  ? banco.map((g) => ({ grupo: g.grupo, itens: g.itens.filter((i) => typeof i === 'string' && i.trim()) })).filter((g) => g.itens.length)
  : padrao;
