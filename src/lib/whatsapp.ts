import { site } from '../data/site';

export const MENSAGEM_HOME = 'Olá! Vim pelo site e gostaria de um orçamento.';

// Toda mensagem termina com o código de origem, ex.: "(site-ir)", para saber de onde veio a conversa.
export function linkWhatsApp(mensagem: string, origem: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`${mensagem} (${origem})`)}`;
}
