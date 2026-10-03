// Conteúdo das páginas de serviço (modelo único, seção 4.3 da revisão).
// Textos em rascunho: o Lucas deve revisar, principalmente as perguntas frequentes.
// Prazos ficam vazios até ele confirmar; sem prazo, o site não promete nenhum.
// Valores legais vêm de fiscal.ts (Supabase): não escrever número de lei direto no texto.
import { fiscal } from './fiscal';
import { brl } from './precos';

const mil = (v: number) => `R$ ${(v / 1000).toLocaleString('pt-BR')} mil`;
const pct = (v: number) => `${(v * 100).toLocaleString('pt-BR')}%`;
const f = fiscal;

export type Pergunta = { p: string; r: string };

export type Servico = {
  slug: string;
  origem: string; // código no fim da mensagem do WhatsApp
  menu: string;
  titulo: string; // <title>
  descricao: string; // meta description
  h1: string;
  subtitulo: string;
  prazo: string | null;
  mensagem: string;
  servicoForm: string;
  paraQuem: string[];
  comoFunciona: string[];
  documentos?: { titulo: string; itens: string[] };
  precos: string[]; // códigos de precos.ts → avulsos
  perguntas: Pergunta[];
};

export const opcoesServico = [
  'Imposto de Renda',
  'MEI: limite, abertura ou baixa',
  'MEI com débitos em atraso',
  'Abertura de empresa',
  'Alteração ou baixa de empresa',
  'PF ou PJ',
  'Imóvel, doação ou herança',
  'Contabilidade mensal / trocar de contador',
  'Consultoria financeira pessoal',
  'Outro assunto',
];

export const servicos: Servico[] = [
  {
    slug: 'imposto-de-renda',
    origem: 'site-ir',
    menu: 'Imposto de Renda',
    titulo: 'Imposto de Renda em São Paulo: declaração, atraso e malha fina | LM Contabilidade',
    descricao: 'Declaração de Imposto de Renda, IR atrasado, retificação e saída da malha fina com contador em São Paulo. A partir de R$ 200. Atendimento pelo WhatsApp.',
    h1: 'Imposto de Renda atrasado, na malha fina ou para declarar este ano?',
    subtitulo: 'A gente faz a declaração, revisa as deduções e resolve as pendências com a Receita. Você manda os documentos pelo WhatsApp.',
    prazo: null,
    mensagem: 'Olá! Preciso de ajuda com meu Imposto de Renda.',
    servicoForm: 'Imposto de Renda',
    paraQuem: [
      'Não declarou em 2024 ou 2025 e quer regularizar',
      'Recebeu carta ou aviso de malha fina da Receita',
      'Vendeu um imóvel, recebeu herança ou doação',
      'Tem aluguel, investimentos ou renda no exterior',
    ],
    comoFunciona: [
      'Você manda o informe de rendimentos e os comprovantes pelo WhatsApp.',
      'Conferimos tudo e enviamos a prévia com o valor a pagar ou a restituir.',
      'Com o seu OK, transmitimos a declaração e mandamos o recibo e as guias.',
    ],
    documentos: {
      titulo: 'O que separar',
      itens: [
        'Informes de rendimentos (empregador, bancos, corretoras, INSS)',
        'Recibos médicos, de dentista, plano de saúde e escola',
        'Documentos de compra e venda de imóveis e veículos',
        'Recibos de aluguel recebido ou pago',
        'Última declaração entregue, se tiver',
      ],
    },
    precos: ['IR', 'IRA'],
    perguntas: [
      { p: 'Qual a multa por entregar atrasado?', r: `1% ao mês sobre o imposto devido, limitada a 20%. Se não houver imposto a pagar, a multa mínima é de ${brl(f.irpf.multaMinimaAtraso)}. Quanto antes regularizar, menor a multa.` },
      { p: 'Posso parcelar o imposto a pagar?', r: `Sim. Na declaração do ano, o imposto pode ser dividido em até 8 quotas, cada uma de no mínimo ${brl(f.irpf.quotaMinima)}. As quotas a partir da segunda têm juros pela Selic.` },
      { p: 'Caí na malha fina. E agora?', r: 'Primeiro consultamos no e-CAC qual é a pendência. Se foi erro na declaração, fazemos a retificação. Se a declaração está certa, separamos os comprovantes para apresentar à Receita.' },
      { p: 'Até quando posso retificar uma declaração?', r: 'Em até 5 anos, desde que você não esteja sob fiscalização da Receita sobre aquela declaração.' },
      { p: 'Sou obrigado a declarar?', r: 'Depende da renda, dos bens e das operações do ano, e as regras mudam todo ano. No primeiro contato, conferimos se você é obrigado e se vale a pena declarar mesmo sem obrigação (por exemplo, para receber restituição).' },
      { p: 'Como mando os documentos?', r: 'Pelo WhatsApp ou por e-mail, como for mais fácil para você. Clientes da LM também podem usar o portal do cliente.' },
    ],
  },
  {
    slug: 'mei',
    origem: 'site-mei',
    menu: 'MEI',
    titulo: 'MEI: abertura, limite de faturamento, desenquadramento e baixa | LM Contabilidade',
    descricao: `Abrir MEI, passou do limite de ${mil(f.mei.limiteAnual)}, virar ME ou dar baixa no MEI. Orientação de contador em São Paulo, a partir de R$ 200.`,
    h1: 'Passou do limite do MEI, quer virar ME ou encerrar?',
    subtitulo: 'A gente mostra o caminho certo para o seu caso, sem multa surpresa: abertura, desenquadramento ou baixa do MEI.',
    prazo: null,
    mensagem: 'Olá! Tenho um MEI e preciso de orientação sobre limite/baixa.',
    servicoForm: 'MEI: limite, abertura ou baixa',
    paraQuem: [
      `Faturou mais de ${mil(f.mei.limiteAnual)} no ano (ou está perto disso)`,
      'Quer contratar mais de um funcionário ou ter sócio',
      'Vai encerrar a atividade e quer baixar o CNPJ sem pendência',
      'Vai abrir o MEI e quer escolher a atividade (CNAE) certa',
    ],
    comoFunciona: [
      'Você conta pelo WhatsApp o faturamento do ano e o que pretende fazer.',
      'Conferimos a situação do CNPJ, das guias DAS e das declarações.',
      'Fazemos a abertura, o desenquadramento ou a baixa e explicamos os próximos pagamentos.',
    ],
    documentos: {
      titulo: 'O que ter em mãos',
      itens: ['CPF e acesso gov.br (nível prata ou ouro)', 'Número do CNPJ, se já tiver MEI', 'Faturamento de cada mês do ano'],
    },
    precos: ['MEI', 'MEIR'],
    perguntas: [
      { p: 'Qual é o limite de faturamento do MEI?', r: `${mil(f.mei.limiteAnual)} por ano. No ano em que o MEI é aberto, o limite é proporcional: ${brl(f.mei.limiteMensalProporcional)} por mês de atividade.` },
      { p: `Passei do limite em até ${pct(f.mei.tolerancia)}. O que acontece?`, r: 'Você continua MEI até dezembro, paga um DAS complementar sobre o valor que passou e, a partir de janeiro, a empresa vira microempresa (ME).' },
      { p: `Passei mais de ${pct(f.mei.tolerancia)} do limite. E agora?`, r: 'O desenquadramento volta para janeiro do ano (ou para a data de abertura). Os impostos do período passam a ser calculados como microempresa. Quanto antes regularizar, menores os juros e multas.' },
      { p: 'Dar baixa no MEI apaga as dívidas?', r: 'Não. Os débitos continuam existindo e passam a ser cobrados no CPF do titular. Por isso vale regularizar antes ou junto com a baixa.' },
      { p: 'Posso ter MEI e trabalhar com carteira assinada?', r: 'Sim, desde que você não seja sócio ou administrador de outra empresa. Só o benefício do seguro-desemprego pode ser afetado.' },
    ],
  },
  {
    slug: 'mei-divida-ativa',
    origem: 'site-mei-divida',
    menu: 'MEI com dívida',
    titulo: 'MEI com DAS atrasado ou dívida ativa: como regularizar | LM Contabilidade',
    descricao: 'Regularize o MEI com DAS em atraso, DASN-SIMEI pendente ou dívida ativa. Parcelamento e baixa sem pendência, a partir de R$ 200.',
    h1: 'MEI com DAS atrasado ou dívida ativa?',
    subtitulo: 'Levantamos tudo o que está em aberto, mostramos o valor real da dívida e fazemos o parcelamento ou a negociação.',
    prazo: null,
    mensagem: 'Olá! Meu MEI tem débitos em atraso e quero regularizar.',
    servicoForm: 'MEI com débitos em atraso',
    paraQuem: [
      'Deixou de pagar o DAS por alguns meses',
      'Não entregou a declaração anual (DASN-SIMEI)',
      'Recebeu aviso de dívida ativa ou de exclusão',
      'Quer encerrar o MEI, mas tem débitos em aberto',
    ],
    comoFunciona: [
      'Com seu acesso gov.br, consultamos as guias, as declarações e a dívida ativa.',
      'Mostramos o valor total e as opções: pagamento, parcelamento ou negociação.',
      'Entregamos as declarações pendentes e emitimos as guias ou o parcelamento.',
    ],
    documentos: {
      titulo: 'O que ter em mãos',
      itens: ['CPF e acesso gov.br (nível prata ou ouro)', 'Número do CNPJ do MEI', 'Faturamento aproximado dos anos em atraso'],
    },
    precos: ['MEIR'],
    perguntas: [
      { p: 'O que acontece se eu não pagar o DAS?', r: 'Cada guia atrasada acumula multa e juros. Depois de um tempo, a dívida pode ser inscrita em dívida ativa, e o período sem pagamento não conta para benefícios do INSS.' },
      { p: 'Dá para parcelar?', r: `Sim. Os débitos do MEI podem ser parcelados em até 60 vezes, com parcela mínima de ${brl(f.mei.parcelaMinima)}. Dívidas já inscritas em dívida ativa são negociadas com a Procuradoria (PGFN), às vezes com desconto.` },
      { p: 'Qual a multa por não entregar a DASN-SIMEI?', r: `2% ao mês sobre os impostos declarados, limitada a 20%, com mínimo de ${brl(f.mei.multaMinimaDasn)}. Se a entrega for feita antes de qualquer notificação, a multa cai pela metade.` },
      { p: 'Posso dar baixa com dívida?', r: 'Pode, mas a dívida não some: passa para o CPF do titular. Na maioria dos casos, vale regularizar junto com a baixa.' },
    ],
  },
  {
    slug: 'abrir-empresa',
    origem: 'site-abertura',
    menu: 'Abrir empresa',
    titulo: 'Abrir empresa em São Paulo: ME, Ltda e saída do MEI | LM Contabilidade',
    descricao: 'Abertura de empresa em São Paulo: contrato social, CNPJ, inscrições, nota fiscal e escolha do regime tributário. Também transformamos MEI em ME/Ltda.',
    h1: 'Vai abrir empresa ou trocar o MEI por ME/Ltda?',
    subtitulo: 'Do contrato social à primeira nota fiscal, com o enquadramento tributário certo desde o começo.',
    prazo: null,
    mensagem: 'Olá! Quero abrir uma empresa e gostaria de um orçamento.',
    servicoForm: 'Abertura de empresa',
    paraQuem: [
      'Vai começar um negócio e quer abrir o CNPJ certo',
      'É profissional liberal e quer sair da pessoa física',
      'O MEI ficou pequeno e precisa virar ME ou Ltda',
      'Vai ter sócio e precisa de um contrato social bem feito',
    ],
    comoFunciona: [
      'Numa conversa, entendemos a atividade, o faturamento previsto e os sócios.',
      'Indicamos o tipo de empresa e o regime tributário, com a estimativa de impostos.',
      'Cuidamos do contrato social, CNPJ, inscrições e da liberação da nota fiscal.',
    ],
    documentos: {
      titulo: 'O que ter em mãos',
      itens: ['RG, CPF e comprovante de endereço dos sócios', 'Endereço onde a empresa vai funcionar (IPTU do imóvel)', 'Descrição das atividades e faturamento previsto'],
    },
    precos: ['ABR', 'ALT'],
    perguntas: [
      { p: 'Qual tipo de empresa devo abrir?', r: 'Depende da atividade, do faturamento e de ter ou não sócios. Na maioria dos casos, uma sociedade limitada (unipessoal ou com sócios) no Simples Nacional é o caminho. Fazemos a comparação antes de abrir.' },
      { p: 'Posso usar o endereço da minha casa?', r: 'Em muitos casos, sim: depende da atividade e das regras da prefeitura. Conferimos isso na consulta de viabilidade, antes de registrar a empresa.' },
      { p: 'Quando posso optar pelo Simples Nacional?', r: 'Empresa nova tem até 30 dias depois da última inscrição (municipal ou estadual) para pedir, dentro de 180 dias da abertura do CNPJ. Empresa que já existe só pode optar em janeiro.' },
      { p: 'Como funciona a passagem de MEI para ME?', r: 'O CNPJ continua o mesmo. Fazemos o desenquadramento do MEI, a alteração para empresário individual ou Ltda e o novo enquadramento tributário.' },
      { p: 'Quanto tempo leva?', r: 'Depende da prefeitura e da Junta Comercial. No orçamento, informamos o prazo esperado para o seu caso.' },
    ],
  },
  {
    slug: 'pf-ou-pj',
    origem: 'site-pfpj',
    menu: 'PF ou PJ',
    titulo: 'Simulador PF ou PJ para profissional liberal | LM Contabilidade',
    descricao: 'Médico, dentista, psicólogo, advogado ou consultor: simule quanto paga de imposto como pessoa física e como PJ no Simples Nacional.',
    h1: 'Profissional liberal: vale mais a pena PF ou PJ?',
    subtitulo: 'Informe quanto você recebe por mês e veja uma estimativa dos impostos nos dois cenários.',
    prazo: null,
    mensagem: 'Olá! Fiz a simulação PF x PJ no site e quero conversar.',
    servicoForm: 'PF ou PJ',
    paraQuem: [
      'Médicos, dentistas, psicólogos e fisioterapeutas',
      'Advogados, arquitetos e engenheiros',
      'Consultores, desenvolvedores e prestadores de serviço',
      'Quem recebe como autônomo (RPA ou carnê-leão)',
    ],
    comoFunciona: [
      'Faça a simulação abaixo com a sua renda mensal.',
      'Mande o resultado pelo WhatsApp e conte como você recebe hoje.',
      'Fazemos a conta completa para o seu caso, com o regime e o pró-labore ideais.',
    ],
    precos: ['ABR'],
    perguntas: [
      { p: 'A partir de quanto vale a pena abrir PJ?', r: 'Não existe um número único: depende da renda, da profissão, de quem paga você (pessoa física ou empresa) e das despesas. Em geral, a partir de rendas médias a PJ no Simples começa a compensar. O simulador mostra a tendência e a conversa confirma.' },
      { p: 'O que é o fator R?', r: `É a relação entre a folha de pagamento (incluindo o pró-labore) e o faturamento. Quando chega a ${pct(f.simples.fatorR)}, muitas atividades intelectuais pagam pelo Anexo III do Simples, a partir de ${pct(f.simples.anexoIII[0].aliquota)}, em vez do Anexo V, a partir de ${pct(f.simples.anexoV[0].aliquota)}.` },
      { p: 'Preciso pagar pró-labore?', r: 'Sim, o sócio que trabalha na empresa deve receber pró-labore, com INSS de 11%. Ele também é o que permite chegar ao fator R.' },
      { p: 'Os lucros são tributados?', r: `A distribuição de lucros é isenta até ${mil(f.irpf.isencaoLucrosMensal)} por mês por empresa. Acima disso, há retenção de 10%, regra que começou em 2026.` },
    ],
  },
  {
    slug: 'imovel-e-doacao',
    origem: 'site-imovel',
    menu: 'Imóvel e doação',
    titulo: 'ITCMD, doação, herança e venda de imóvel | LM Contabilidade',
    descricao: 'Cálculo e declaração de ITCMD em doação e herança, ganho de capital na venda de imóvel e registro de compra e venda. Contador em São Paulo.',
    h1: 'Doação, herança ou venda de imóvel?',
    subtitulo: 'Calculamos o imposto, fazemos a declaração e acompanhamos a escritura e o registro.',
    prazo: null,
    mensagem: 'Olá! Preciso de ajuda com imóvel, doação ou herança.',
    servicoForm: 'Imóvel, doação ou herança',
    paraQuem: [
      'Vai doar um imóvel ou dinheiro para filhos',
      'Recebeu herança e precisa declarar o ITCMD',
      'Vendeu um imóvel e precisa calcular o ganho de capital',
      'Está comprando ou vendendo e precisa regularizar a matrícula',
    ],
    comoFunciona: [
      'Você conta a operação e manda os documentos do imóvel ou do bem.',
      'Calculamos os impostos e mostramos o custo total antes de qualquer pagamento.',
      'Fazemos a declaração, emitimos as guias e acompanhamos escritura e registro.',
    ],
    documentos: {
      titulo: 'O que ter em mãos',
      itens: ['Matrícula atualizada do imóvel', 'IPTU ou valor venal de referência', 'Documentos de quem doa e de quem recebe (ou dos herdeiros)', 'Escritura ou contrato de compra anterior'],
    },
    precos: ['ITC', 'RGI'],
    perguntas: [
      { p: 'O que é o ITCMD?', r: 'É o imposto estadual cobrado sobre herança e doação. Em São Paulo, é declarado e pago à Secretaria da Fazenda do Estado, antes da escritura.' },
      { p: 'Pago imposto de renda ao vender um imóvel?', r: 'Se houver lucro, sim: 15% sobre o ganho de capital (até R$ 5 milhões), pago até o último dia útil do mês seguinte à venda.' },
      { p: 'Existe isenção na venda?', r: `Sim, em alguns casos: venda do único imóvel por até ${mil(f.irpf.isencaoUnicoImovel)}, sem outra venda nos últimos 5 anos, ou compra de outro imóvel residencial em até 180 dias com o dinheiro da venda.` },
      { p: 'Doação em vida ou inventário?', r: 'Depende da família, dos bens e dos custos de cada caminho. Fazemos a comparação de impostos e despesas antes da decisão.' },
    ],
  },
];

export const servicoPorSlug = (slug: string) => {
  const s = servicos.find((x) => x.slug === slug);
  if (!s) throw new Error(`Serviço não encontrado: ${slug}`);
  return s;
};
