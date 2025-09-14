# My Blog & Portfolio (Astro 5 + Tailwind v4 + Notion Cache)

이 저장소는 공개 템플릿을 **개인 블로그 & 포트폴리오** 용도로 커스터마이즈한 프로젝트입니다.
콘텐츠는 MDX/Notion에서 관리하고, 커버 이미지는 로컬로 캐시해 최적화 렌더링합니다.

> ℹ️ **Template-based**: 원본 템플릿을 참고해 나만의 콘텐츠/스타일을 더했습니다.
> 크레딧은 아래 **License & Credits** 섹션을 확인하세요.

---

## ✨ Features

* **Astro 5** 정적 사이트 (output: `static`)
* **Tailwind CSS v4** (`@tailwindcss/vite`)
* **MDX + Notion 캐시** 파이프라인

  * `scripts/notion-cache.mjs`로 Notion → MDX & 이미지 동기화
  * 커버: `/src/assets/notion/**`, (선택) 본문: `/public/assets/notion/**`
* **이미지 최적화**: `astro:assets` + `<Image>`
* **i18n**: 기본 `ko`(루트), 영어 `/en/*`
* **SEO**: `astro-seo`, `@astrojs/sitemap`, `@astrojs/rss`
* **Shiki/KaTeX/Mermaid** 코드/수식/다이어그램 지원

**Node**: `>=18.17 <21 || >=22` · **Package Manager**: `npm@10`

---

## 🧭 Project Structure (요지)

```
src/
  assets/
    notion/**              # Notion 커버(빌드 타임)
    projects/placeholder.png
    tools/** styles/app.css avatar.png ...
  components/              # home/projects/about 등 컴포넌트
  content/
    blog/                  # 기본(ko) 블로그
    projects/              # 기본(ko) 프로젝트 ← Notion에서 주로 생성
    en/{blog,projects}/    # 영어 콘텐츠
  data/                    # 참고용 JSON 스냅샷
  layouts/                 # 레이아웃
  pages/                   # 라우트(홈/프로젝트/블로그/검색/프로필 등)
plugins/                   # rehype/shiki
scripts/
  notion-cache.mjs         # Notion → MDX + 이미지 캐시
content.config.ts  site.config.ts  type.d.ts
```

---

## 🚀 Quick Start

```bash
npm ci
npm run dev      # http://localhost:4321
```

Build & Preview:

```bash
npm run build
npm run preview
```

품질 체크:

```bash
npm run check     # astro check
npm run lint      # eslint --fix
npm run format    # prettier
```

---

## 🧩 Customize (개인 블로그용 체크리스트)

* `site.config.ts`: 사이트 타이틀/설명/저자/소셜 링크
* `src/assets/avatar.png`: 프로필 이미지 교체
* `src/assets/tools/*.svg`: About > Tool 아이콘 수정
* `src/components/BaseHead.astro`: favicon/OG 이미지/메타
* `src/components/Giscus.astro`: 코멘트(리포/카테고리) 설정
* Tailwind: `src/assets/styles/app.css`(유틸/레이어 커스텀)
* 내 프로필 링크: `pages/profile/*` (GitHub/LinkedIn/Velog 등)

---

## ✍️ Writing Content

### 1) MDX로 직접 작성 (Blog/Projects)

`src/content/blog/*.mdx`, `src/content/projects/*.mdx`에 작성:

```mdx
---
title: "제목"
description: "설명"
pubDate: "yyyy-mm-dd"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
slug: "pathname"
locale: "ko"
category: "카테고리"
heroImage:
  src: "../../assets/notion/26a10.../bc8f7278-cover.jpg" # 또는 /src/... 절대경로
  alt: "heroImage 이미지 설명"
updatedDate: "YYYY-MM-DDTHH:mm:ss.SSSZ"
---
본문…
```

### 2) Notion에서 가져오기(선택)

`.env` 설정 후 스크립트 실행:

```env
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```bash
npm run sync:notion:env   # .env 로드하여 동기화
# 또는 환경변수 export 후
npm run sync:notion
```

* 커버는 `/src/assets/notion/<pageId>/<file>`로 저장
* 생성된 MDX는 `src/content/projects/*`에 배치됩니다.

---

## 🖼️ ProjectCard & 이미지 규칙 (중요)

`src/components/home/ProjectCard.astro`는 **세 가지** 중 하나로 이미지를 받습니다.

1. `image`: `ImageMetadata` (Astro `<Image>` 최적화 O)
2. `imagePath`: 로컬 경로(`/src/...` 또는 `../../assets/...`)
3. `imageUrl`: 원격 URL(`https://...`)

동작:

* 글롭: `/src/assets/**/*.{jpeg,jpg,png,gif,avif,webp}` (재귀 로드)
* `imagePath`는 `../../assets/...`, `assets/...`, `src\assets\...`를 **정규화**해 `/src/assets/...` 키로 매칭
* 우선순위: **`image` > `imagePath(glob)` > `imageUrl`**

> ⚠️ `/src` 자산은 **URL이 아니기 때문에** `imageUrl="../../assets/...“`로 넘기면 404가 납니다.
> 로컬 자산은 \*\*`image` 또는 `imagePath`\*\*로 전달하세요.

**index.astro에서 안전하게 넘기는 유틸**

```ts
const toCardImageProps = (hero?: { src?: unknown; alt?: string }) => {
  const raw = hero?.src
  const altText = hero?.alt
  const isMeta = raw && typeof raw === 'object'
    && 'src' in (raw as any) && 'width' in (raw as any) && 'height' in (raw as any)

  if (isMeta) return { image: raw as any, altText }
  if (typeof raw === 'string') {
    if (/^https?:\/\//i.test(raw)) return { imageUrl: raw, altText }
    return { imagePath: raw, altText }   // /src 또는 상대경로
  }
  return { imagePath: '/src/assets/projects/placeholder.png', altText }
}
```

사용 예:

```astro
<ProjectCard
  heading={entry.data.title}
  subheading={entry.data.description}
  {...toCardImageProps(entry.data.heroImage)}
  href={`/projects/${entry.slug}`}
/>
```

---

## 🌐 i18n

* 기본 언어 **ko**: 루트(`/`)
* 영어 **en**: `/en/*`
  콘텐츠는 `src/content/en/{blog,projects}`에 작성하면 자동으로 분기됩니다.

---

## 📦 Deploy (GitHub Pages)

### astro.config.ts

* **사용자/조직 페이지** (`<username>.github.io`):

```ts
export default defineConfig({
  output: 'static',
  site: 'https://<username>.github.io',
  base: '/',
})
```

* **프로젝트 페이지** (예: `my-blog`):

```ts
export default defineConfig({
  output: 'static',
  site: 'https://<username>.github.io/my-blog/',
  base: '/my-blog/',
})
```

### GitHub Actions (추천)

`.github/workflows/deploy.yml`:

```yml
name: Deploy Astro to GitHub Pages
on:
  push: { branches: [ main ] }
  workflow_dispatch:

permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run sync:notion:env
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

> **Settings → Pages**: Source = **GitHub Actions**
> **Settings → Secrets → Actions**: `NOTION_TOKEN`, `NOTION_DATABASE_ID` 등록

(대안) 로컬 빌드 → `gh-pages` 브랜치:

```bash
npm run sync:notion
npm run build
git worktree add dist gh-pages
(cd dist && git add . && git commit -m "deploy" && git push origin gh-pages)
git worktree remove dist
```

---

## 🛠️ Troubleshooting

* **카드에 커버가 안 보임**

  * `imageUrl="../../assets/notion/..."`로 넘기지 않았는지 확인
  * 확장자 패턴(webp/jpg/png/avif/gif) 포함 여부
  * Windows 경로(`\`)는 자동 정규화됨
* **Pages에서 경로 깨짐**

  * 프로젝트 페이지인데 `base: '/'`로 설정됐을 가능성 → `site/base`를 리포 이름에 맞추기
* **CI Node 버전 오류**

  * `actions/setup-node@v4`에서 `node-version: 22` 사용

---

## 📜 Scripts

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,md,mdx,astro}\"",
  "lint": "eslint --fix \"src/**/*.{js,ts,jsx,tsx,astro}\"",
  "sync:notion": "node scripts/notion-cache.mjs",
  "sync:notion:env": "node --env-file=.env scripts/notion-cache.mjs"
}
```

---

## 🧾 License & Credits

* **Code**: MIT — `LICENSE` 파일에 명시
* **Content**(포스트, 이미지 등): All Rights Reserved (개인 저작물 보호)
* **Template Credit**: 본 저장소는 공개 템플릿을 기반으로 합니다.

```
Template: <Pure/[URL](https://github.com/cworld1/astro-theme-pure)>
```