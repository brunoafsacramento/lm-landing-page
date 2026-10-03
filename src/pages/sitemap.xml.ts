import { site } from '../data/site';
import { servicos } from '../data/servicos';

const paginas = [
  '/',
  ...servicos.map((s) => `/${s.slug}`),
  '/contabilidade-mensal',
  '/limite-mei',
  '/checklist-imposto-de-renda',
  '/calendario-de-prazos',
  '/sobre',
  '/privacidade',
];

export function GET() {
  const hoje = new Date().toISOString().slice(0, 10);
  const urls = paginas
    .map((p) => `  <url>\n    <loc>${site.url}${p}</loc>\n    <lastmod>${hoje}</lastmod>\n  </url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
