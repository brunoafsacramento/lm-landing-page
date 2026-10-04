// Dados gerais da LM. Editáveis no portal (Configurações → Site), tabela site_conteudo do Supabase.
// Os valores abaixo são o padrão local, usado quando o build roda sem acesso ao Supabase.
// Campos `null` ou vazios escondem o bloco correspondente no site.
import { conteudo } from './cms';

const padrao = {
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
  fotoResponsavel: null as string | null, // URL (bucket público "site" do Supabase) ou caminho em /public
  bioResponsavel: null as string | null,
  provas: [] as { valor: string; rotulo: string }[], // ex.: { valor: '4,9 ★', rotulo: '37 avaliações no Google' }
  depoimentos: [] as { nome: string; texto: string; servico?: string; foto?: string }[],
};

type Site = typeof padrao;

// Propriedade do site → chave em site_conteudo
const chaves: Record<keyof Site, string> = {
  nome: 'nome',
  url: 'url',
  responsavel: 'responsavel',
  crc: 'crc',
  email: 'email',
  whatsapp: 'whatsapp',
  telefoneExibicao: 'telefone_exibicao',
  portal: 'portal',
  cidade: 'cidade',
  uf: 'uf',
  razaoSocial: 'razao_social',
  cnpj: 'cnpj',
  endereco: 'endereco',
  horario: 'horario',
  respostaWhatsApp: 'resposta_whatsapp',
  aceitaLigacao: 'aceita_ligacao',
  instagram: 'instagram',
  perfilGoogle: 'perfil_google',
  anoInicio: 'ano_inicio',
  fotoResponsavel: 'foto_responsavel',
  bioResponsavel: 'bio_responsavel',
  provas: 'provas',
  depoimentos: 'depoimentos',
};

/** Valor do banco, se tiver o mesmo formato do padrão; texto vazio vira null. */
function ler<K extends keyof Site>(prop: K): Site[K] {
  const base = padrao[prop];
  let v = conteudo(chaves[prop]);
  if (v === undefined) return base;
  if (typeof v === 'string') v = v.trim() || null;
  if (v === null) return (typeof base === 'string' ? base : Array.isArray(base) ? [] : typeof base === 'boolean' ? false : null) as Site[K];
  if (Array.isArray(base)) return (Array.isArray(v) ? v : base) as Site[K];
  if (typeof base === 'string' || typeof base === 'boolean') return (typeof v === typeof base ? v : base) as Site[K];
  if (prop === 'anoInicio') return (Number.isInteger(Number(v)) ? Number(v) : null) as Site[K];
  if (prop === 'endereco') return (typeof v === 'object' && (v as { rua?: string }).rua ? v : null) as Site[K];
  return (typeof v === 'string' ? v : null) as Site[K];
}

export const site: Site = Object.fromEntries(Object.keys(padrao).map((k) => [k, ler(k as keyof Site)])) as Site;

// Medição. Vazio = nada é carregado e o aviso de cookies não aparece.
const medicaoBanco = (conteudo('medicao') ?? {}) as Partial<Record<'ga4' | 'googleAds' | 'metaPixel', string>>;
export const medicao = {
  ga4: medicaoBanco.ga4 ?? '', // ex.: 'G-XXXXXXXXXX'
  googleAds: medicaoBanco.googleAds ?? '', // ID da tag de conversão, ex.: 'AW-123456789' (não é o número da conta 566-009-2692)
  metaPixel: medicaoBanco.metaPixel ?? '',
};
