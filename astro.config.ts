;
// astro.config.ts
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// Integrations
import tailwind from '@tailwindcss/vite';
import AstroPureIntegration from 'astro-pure';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';


// Local plugins
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts';
import { addCopyButton, addLanguage, addTitle, transformerNotationDiff, transformerNotationHighlight, updateStyle } from './src/plugins/shiki-transformers.ts';
import config from './src/site.config.ts';


export default defineConfig({
  // ── Core ─────────────────────────────────────────────────────────────
  output: 'static',
  site: 'https://yonaa-dev.github.io',
  base: '/', // 프로젝트 페이지면 '/레포명/' 로 변경
  trailingSlash: 'never',

  // i18n: ko는 루트(/), en은 /en/ 접두사
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    routing: { prefixDefaultLocale: false }, // ko는 /, en은 /en/...
    fallback: { en: 'ko' } // en 문서 없으면 ko로 대체 노출(선택)
  },

  // ── Images ───────────────────────────────────────────────────────────
  image: {
    responsiveStyles: true,
    service: { entrypoint: 'astro/assets/services/sharp' }
  },

  // ── Integrations ─────────────────────────────────────────────────────
  integrations: [
    mdx(),
    AstroPureIntegration(config), // astro-pure 사용 시 필수(패키지에 astro-pure 존재해야 함)
    sitemap()
  ],

  // ── Server/Prefetch ──────────────────────────────────────────────────
  prefetch: true,
  server: { host: true },

  // ── Markdown / Shiki ─────────────────────────────────────────────────
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ]
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        updateStyle(),
        addTitle(),
        addLanguage(),
        addCopyButton(2000)
      ]
    }
  },

  // ── Experimental ─────────────────────────────────────────────────────
  experimental: { contentIntellisense: true },

  // ── Vite ─────────────────────────────────────────────────────────────
  vite: { plugins: [tailwind()] },
})