import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  markdown: {
    shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark' } },
  },
  // The original public/ contains evidence under privacy review. Never serve it.
  publicDir: './static',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/public/**', '**/docs/**', '**/.agents/**', '**/.codex/**', '**/.cptr/**', '**/.impeccable/**'],
      },
    },
  },
});
