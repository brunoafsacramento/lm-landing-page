import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.lmcontab.com.br',
  trailingSlash: 'never',
  build: { format: 'file' },
});
