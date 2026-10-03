// Dados gerais da LM. Campos com `null` ainda dependem de confirmação do Lucas:
// enquanto estiverem vazios, o bloco correspondente simplesmente não aparece no site.

export const site = {
  nome: 'LM Contabilidade',
  url: 'https://www.lmcontab.com.br',
  responsavel: 'Lucas Marcelino',
  crc: 'CRC-1SP358328',
  email: 'lmcontabilidade@lmcontab.com.br',
  whatsapp: '5511987867389',
  telefoneExibicao: '(11) 98786-7389',
  portal: 'https://portal.lmcontab.com.br',
  cidade: 'São Paulo',
  uf: 'SP',

  // Pendentes com o Lucas
  razaoSocial: null as string | null,
  cnpj: null as string | null,
  endereco: null as null | { rua: string; bairro: string; cep: string },
  horario: null as string | null, // ex.: 'Segunda a sexta, das 9h às 18h'
  respostaWhatsApp: null as string | null, // ex.: 'Respondemos em até 1 hora, de segunda a sexta, das 9h às 18h.'
  aceitaLigacao: false, // libera o botão "Ligar" na barra do celular
  instagram: null as string | null, // ex.: 'https://www.instagram.com/lmcontab'
  perfilGoogle: null as string | null,
  anoInicio: null as number | null,
  fotoResponsavel: null as string | null, // caminho em /public, ex.: '/fotos/lucas.webp'
  bioResponsavel: null as string | null,
  provas: [] as { valor: string; rotulo: string }[], // ex.: { valor: '4,9 ★', rotulo: '37 avaliações no Google' }
  depoimentos: [] as { nome: string; texto: string; servico?: string; foto?: string }[],
};

// Medição. Vazio = nada é carregado e o aviso de cookies não aparece.
export const medicao = {
  ga4: '', // ex.: 'G-XXXXXXXXXX'
  googleAds: '', // ID da tag de conversão, ex.: 'AW-123456789' (não é o número da conta 566-009-2692)
  metaPixel: '',
};
