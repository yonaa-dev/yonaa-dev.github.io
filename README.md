## 1️. 프로젝트 소개 & 주요 기능

# my-blog

Astro 5 기반의 **개인 블로그 & 포트폴리오 사이트**입니다.
마크다운/MDX 콘텐츠 관리, 정적 검색, 코드 하이라이트, Notion 프로젝트 동기화 등
개발자 포트폴리오와 기술 블로그에 최적화된 기능을 제공합니다.

### ✨ 주요 기능

* **정적 블로그 & 포트폴리오**

  * `src/content/blog`과 `src/content/projects`의 MD/MDX 파일을 컬렉션으로 관리
  * 태그·아카이브·검색·RSS 지원
* **Notion 동기화 (선택)**

  * `scripts/notion-cache.mjs` 실행만으로 Notion DB → 로컬 MDX 자동 변환
* **Pagefind 기반 정적 검색**

  * `/search` 페이지에서 즉시 검색
* **Shiki + rehype-auto-link-headings**

  * 라인 하이라이트, 코드 복사 버튼, 자동 헤딩 앵커
* **UnoCSS 스타일 시스템**

  * Tailwind 호환 유틸리티 퍼스트, 온디맨드 빌드로 초경량 CSS
* **Giscus 댓글**

  * GitHub Discussions 연동으로 각 포스트별 댓글 지원
* **100/100/100/100 Lighthouse 점수**

  * 성능·접근성·베스트프랙티스·SEO 모두 최고 등급

## 2️. 기술 스택 & 빠른 시작

### 🛠 기술 스택

| 분야                | 사용                                                    |
| ----------------- | ----------------------------------------------------- |
| **프레임워크**         | [Astro 5](https://astro.build/)                       |
| **언어**            | TypeScript, MD/MDX                                    |
| **스타일**           | [UnoCSS](https://unocss.dev/) + Tailwind 호환           |
| **코드 하이라이트**      | [Shiki](https://shiki.style/) (커스텀 트랜스포머)             |
| **Markdown 플러그인** | `rehype-auto-link-headings` (자동 앵커)                   |
| **검색**            | [Pagefind](https://pagefind.app/) (정적 검색)             |
| **댓글 시스템**        | [Giscus](https://giscus.app/) (GitHub Discussions 기반) |
| **데이터 동기화(선택)**   | Notion API (`scripts/notion-cache.mjs`)               |
| **품질 관리**         | ESLint + Prettier (import 정렬 포함)                      |

---

### ⚡ 빠른 시작

1️⃣ **설치**

```bash
pnpm install     # 또는 npm install / yarn
```

2️⃣ **개발 서버 실행**

```bash
pnpm dev
# http://localhost:4321
```

3️⃣ **빌드**

```bash
pnpm build
pnpm preview     # 빌드 결과 미리보기
```

4️⃣ **배포**

* 정적 사이트이므로 `dist/` 폴더를 Vercel·Netlify·Cloudflare Pages 등
  **정적 호스팅 서비스**에 업로드하면 끝.
* GitHub Pages의 경우 `.github/workflows/gh-pages.yml`을 그대로 사용 가능.

---

#### Notion 연동 (선택)

1. `.env` 파일에 다음을 설정

   ```properties
   NOTION_TOKEN=your_integration_token
   NOTION_DB_ID_PROJECTS=your_database_id
   ```
2. 동기화 실행

   ```bash
   node --env-file=.env scripts/notion-cache.mjs
   ```

## 3️. 라우트 개요

이 프로젝트는 **Astro 5의 파일 기반 라우팅**을 사용합니다.
`src/pages` 폴더 구조가 곧 URL이 되며, 대부분 **정적 프리렌더링(prerender: true)** 으로 빌드 시 완전히 생성됩니다.

| 경로            | 설명                             | 관련 파일                   |
| ------------- | ------------------------------ | ----------------------- |
| `/`           | 홈. 최신 블로그 10편, 최신 프로젝트 4개 미리보기 | `src/pages/index.astro` |
| `/about`      | 소개 페이지                         | `about/index.astro`     |
| `/links`      | 친구·링크 모음                       | `links/index.astro`     |
| `/profile`    | 프로필 및 외부 링크                    | `profile/index.astro` 등 |
| `/search`     | Pagefind 기반 전역 검색              | `search/index.astro`    |
| `/404`        | 404 에러 페이지                     | `404.astro`             |
| `/rss.xml`    | RSS 피드                         | `rss.xml.ts`            |
| `/robots.txt` | robots.txt 생성                  | `robots.txt.ts`         |

### 블로그

| 경로                           | 설명         | 관련 파일                             |
| ---------------------------- | ---------- | --------------------------------- |
| `/blog`                      | 블로그 메인     | `blog/index.astro`                |
| `/blog/[...page]`            | 페이지네이션     | `blog/[...page].astro`            |
| `/blog/[...id]`              | 단일 글 상세    | `blog/[...id].astro`              |
| `/blog/tags/[tag]/[...page]` | 태그별 글      | `blog/tags/[tag]/[...page].astro` |
| `/blog/archives`             | 연도/월별 아카이브 | `blog/archives.astro`             |

* `getStaticPaths()`로 모든 글을 불러와 URL을 생성
* `render(post)`로 MD/MDX 본문, 헤딩, frontmatter를 파싱해 `<BlogPost.astro>` 레이아웃으로 전달

### 프로젝트

| 경로                               | 설명         | 관련 파일                                 |
| -------------------------------- | ---------- | ------------------------------------- |
| `/projects`                      | 프로젝트 목록    | `projects/index.astro`                |
| `/projects/[...page]`            | 페이지네이션     | `projects/[...page].astro`            |
| `/projects/[...id]`              | 프로젝트 상세    | `projects/[...id].astro`              |
| `/projects/tags/[tag]/[...page]` | 태그별 프로젝트   | `projects/tags/[tag]/[...page].astro` |
| `/projects/archives`             | 연도/월별 아카이브 | `projects/archives.astro`             |

* `getCollection('projects')`를 사용해 Notion 캐시/MDX 기반 데이터 로드
* `pubDate` 기준 정렬 후 정적 페이지로 빌드

## 4️. 데이터 동기화 (Notion)

이 블로그는 **Notion 데이터베이스를 로컬 MDX로 동기화**하는 스크립트를 포함합니다.
이 기능은 선택 사항이지만, 프로젝트 정보를 Notion에서 직접 관리하고 사이트와 자동으로 맞추는 데 유용합니다.

### 주요 스크립트

| 파일                                 | 설명                                            |
| ---------------------------------- | --------------------------------------------- |
| `scripts/notion-cache.mjs`         | 핵심 스크립트. Notion DB의 프로젝트 페이지를 MDX와 정적 에셋으로 캐싱 |
| `scripts/notion-ping.mjs`          | Notion API 연결 및 데이터소스 상태 점검                   |
| `scripts/sync-notion-projects.mjs` | (WIP) 히어로 이미지 등 메타데이터 가공 보조                   |

---

### 환경 변수 (.env)

```properties
NOTION_TOKEN=<Notion 통합 토큰>
NOTION_DB_ID_PROJECTS=<Database ID>   # 또는 NOTION_DATABASE_ID

# DB 속성명을 커스텀한 경우 오버라이드 가능
NOTION_TITLE_PROP=Name
NOTION_SLUG_PROP=Slug
NOTION_DATE_PROP=Date
NOTION_UPDATED_PROP=Updated
NOTION_TAGS_PROP=Tags
NOTION_SUMMARY_PROP=Summary
NOTION_CATEGORY_PROP=Category
NOTION_LOCALE_PROP=Locale
NOTION_PUBLISHED_PROP=Published
NOTION_HERO_FILES_PROP=HeroImage
NOTION_HERO_ALT_PROP=Hero Alt
NOTION_HERO_COLOR_PROP=Hero Color
```

> DB의 속성명이 한글이라면 위 변수로 매핑하면 됩니다.
> 예: `NOTION_TITLE_PROP=제목`

---

### 동작 흐름

1. **데이터 조회**

   * `databases.retrieve`를 통해 `data_sources[0].id` 확인 후
     가능하면 `dataSources.query`(신규 API) 사용, 실패 시 `databases.query`로 폴백.

2. **필터 & 정렬**

   * `Published` 속성이 `true`인 페이지만 포함.
   * `Date` 기준 내림차순 정렬.

3. **MDX 변환**

   * `notion-to-md`로 본문을 마크다운으로 변환.
   * 본문 내 외부 이미지 URL은 `/public/assets/notion/<pageId>/`에 다운로드 후 경로 치환.

4. **히어로 이미지**

   * `HeroImage` 속성의 첫 번째 파일을 `/src/assets/notion/<pageId>/`에 저장.
   * frontmatter에 `heroImage` 블록 생성:

     ```yaml
     heroImage:
       src: ../../assets/notion/<pageId>/<file>
       alt: <Hero Alt or title>
       color: <Hero Color?>
     ```

5. **출력 결과**

   * `src/content/projects/<slug>.mdx` 파일과
     `src/data/projects.json` 인덱스 생성.

---

### 실행

```bash
# 1) 연결 점검
node --env-file=.env scripts/notion-ping.mjs

# 2) 데이터 캐시
node --env-file=.env scripts/notion-cache.mjs
```

* 성공 시 콘솔에

  ```
  [notion] cached 8 items (single collection)
  ```

  처럼 캐싱 결과가 표시됩니다.

## 5️. 컴포넌트 & 사용법

이 프로젝트는 Astro 컴포넌트 기반으로 구성되며, 주요 UI/기능 컴포넌트는 `src/components`에 있습니다. 대표 2개를 예제로 소개합니다.

---

### 5.1 Giscus.astro — 댓글 시스템

* **위치**: `src/components/Giscus.astro`
* **용도**: GitHub Discussions 기반 댓글([https://giscus.app/](https://giscus.app/)) 임베드
* **특징**: `pathname` 매핑, 시스템 테마 연동(`preferred_color_scheme`), 한국어 UI

**중요 데이터 속성**

* `data-repo`, `data-repo-id`: 댓글 저장소/ID
* `data-category`, `data-category-id`: Giscus 카테고리/ID
* `data-mapping="pathname"`: 페이지 경로별 스레드
* `data-theme="preferred_color_scheme"`: 라이트/다크 자동
* `data-lang="ko"`: UI 언어
* `data-input-position="top"`, `data-reactions-enabled="1"`

> ⚠️ 한 페이지에 **Giscus 스크립트는 1개만** 넣어야 합니다.

**사용 예**

```astro
---
import Giscus from '@/components/Giscus.astro'
---
<article>
  <!-- 글 본문 -->
  <Giscus />
</article>
```

---

### 5.2 ProjectSection.astro — 프로젝트 카드 그리드

* **위치**: `src/components/projects/ProjectSection.astro`
* **용도**: 프로젝트 목록을 2열 그리드 카드로 렌더링
* **의존성**: `astro:assets/Image`, `astro-pure/user/Icon`, `astro-pure/utils/cn`

**Props**

```ts
interface Project {
  image?: string                       // src/assets/projects 안의 파일명
  name: string
  description: string
  links: { type: 'github'|'site'|'doc'|'release'; href: string }[]
}
interface Props {
  class?: string
  projects: Project[]
}
```

**동작 요약**

* `import.meta.glob`으로 `/src/assets/projects/*.{jpeg,jpg,png,gif,avif.webp,webp}` 이미지를 정적 import
* 잘못된 파일명을 주면 **빌드 단계에서 에러로 검출**
* `links[].type`에 따라 자동 아이콘(`github-circle`, `earth`, `document`, `package`)

**사용 예**

```astro
---
import ProjectSection from '@/components/projects/ProjectSection.astro'

const projects = [
  {
    name: 'My App',
    description: 'Next.js + Tailwind 프로젝트',
    image: 'my-app.jpg',
    links: [
      { type: 'github', href: 'https://github.com/me/my-app' },
      { type: 'site', href: 'https://my-app.example.com' }
    ]
  },
  {
    name: 'Docs Generator',
    description: 'MDX 문서 자동화 도구',
    links: [{ type: 'doc', href: '/docs/generator' }]
  }
]
---
<ProjectSection projects={projects} class="mt-10" />
```

---

### 5.3 그 외 자주 쓰는 컴포넌트

* `BaseHead.astro` — 페이지 공통 `<head>`/메타
* `home/Section.astro` — 제목/본문이 있는 섹션 래퍼
* `home/ProjectCard.astro` — 단일 프로젝트 카드
* `home/SkillLayout.astro` — 기술 스택 나열
* `projects/ProjectPreview.astro` — 목록에서 프로젝트 미리보기
* `projects/Sponsorship.astro` / `projects/Sponsors.astro` — 후원 섹션

## 6️. 플러그인 & 마크다운 처리

이 프로젝트는 MD/MDX 렌더링을 강화하기 위해 **Rehype**와 **Shiki** 기반의 커스텀 플러그인을 사용합니다.
코드 하이라이트·자동 앵커·복사 버튼 등 문서 친화 기능을 손쉽게 제공합니다.

---

### 6.1 rehype-auto-link-headings

* **위치**: `src/plugins/rehype-auto-link-headings.ts`
* **역할**: 모든 마크다운 헤딩(`<h2>`\~`<h6>`)에 **고유 ID**와 **자동 앵커 링크** 추가
* **효과**

  * `<h2 id="intro">`처럼 고유 slug 생성
  * 헤딩 클릭 시 URL 복사 또는 목차 스크롤 이동 가능
  * 사이드바 목차·TOC 플러그인과 자연스럽게 연동

Astro 설정(`astro.config.mjs`) 예:

```ts
markdown: {
  rehypePlugins: [
    rehypeHeadingIds,
    [rehypeAutoLinkHeadings, { /* 옵션 */ }]
  ]
}
```

---

### 6.2 shiki-transformers

* **위치**: `src/plugins/shiki-transformers.ts`
* **역할**: [Shiki](https://shiki.style/) 코드 하이라이터 확장
* **주요 기능**

  * 라인 하이라이트 (\` `js {1,3-5}` )
  * 라인 넘버 자동 추가
  * diff 강조(추가/삭제 줄 색상 처리)
  * 코드 블록 상단에 **복사 버튼** 삽입

`astro.config.mjs`에서 `markdown.shikiConfig.transformers`로 적용:

```ts
markdown: {
  syntaxHighlight: 'shiki',
  shikiConfig: {
    theme: 'github-dark',
    transformers: [shikiTransformers]
  }
}
```

---

### 6.3 shiki-official-transformers

* **위치**: `src/plugins/shiki-official-transformers.ts`
* **용도**: 필요 시 Shiki 공식 트랜스포머 모음을 가져와 사용할 수 있는 엔트리 포인트
* **상황**: `shiki-transformers.ts` 대신 공식 플러그인(예: copy-to-clipboard, transformerNotationDiff 등)으로 교체하거나 병합할 때 유용

---

### 6.4 사용 흐름 요약

1. 마크다운/MDX에 코드 작성 시 `{1,4-5}` 같은 줄 지정 하이라이트를 추가.
2. 빌드 시 `rehype-auto-link-headings`가 헤딩에 앵커와 ID 부여.
3. `shiki-transformers`가 코드 블록을 파싱해 라인 넘버, 하이라이트, 복사 버튼까지 자동 반영.

결과적으로 **SEO·가독성·복사 편의성이 크게 향상**됩니다.

## 7️. 스타일 시스템 (UnoCSS)

이 프로젝트는 **UnoCSS** 기반의 유틸리티-퍼스트 스타일을 사용합니다. Tailwind와 유사한 문법을 그대로 쓰면서, **사용된 클래스만** 추출해 CSS가 매우 가벼워집니다.

### 구성 요약

* **프리셋**: `presetUno`(기본 유틸), `presetAttributify`(속성 모드), `presetIcons`(아이콘), `presetTypography`(문서용 타이포그래피), 필요 시 웹폰트 프리셋
* **테마**: 컬러 팔레트/폰트/간격 단위 등을 커스텀
* **단축(shortcuts)**: 자주 쓰는 조합을 별칭으로 등록 (예: `btn`, `btn-primary`)
* **safelist**: 동적으로 생성될 가능성이 있는 클래스(예: CMS 태그 색상)를 미리 포함

> 설정 파일: `uno.config.ts`

### 사용 예

**클래스 모드**

```astro
<div class="p-4 rounded-xl bg-primary text-white hover:bg-primary-600">
  Hello UnoCSS
</div>
```

**속성(Attributify) 모드**

```astro
<div p="4" rounded="xl" bg="primary hover:primary-600" text="white">
  Hello UnoCSS
</div>
```

### 팁

* 페이지/컴포넌트에 클래스를 적는 즉시, **빌드 시 해당 유틸만 생성**되어 번들이 작아집니다.
* 아이콘은 `i-<collection>-<name>` 형태로 바로 사용 가능 (예: `i-tabler-external-link`).
* 마크다운 본문은 `presetTypography` 덕분에 기본 가독성이 좋습니다. 필요하면 전역 CSS에서 세부를 오버라이드하세요.

## 8️. 코딩 컨벤션 & 품질 관리

이 프로젝트는 **ESLint + Prettier**를 사용해 코드 품질과 스타일을 일관되게 유지합니다.

---

### 8.1 ESLint

* **설정 파일**: `eslint.config.mjs`
* **주요 구성**

  ```js
  export default [
    eslint.configs.recommended,           // JS 권장 규칙
    ...tseslint.configs.recommended,      // TypeScript 권장 규칙
    ...eslintPluginAstro.configs.recommended, // Astro 권장 규칙
    {
      ignores: ['public/scripts/*', 'scripts/*', '.astro/', 'src/env.d.ts']
    }
  ]
  ```
* **적용 범위**: JS / TS / Astro 파일
* **명령어**

  ```bash
  pnpm lint
  ```

---

### 8.2 Prettier

* **설정 파일**: `prettier.config.mjs`

* **주요 옵션**

  * `printWidth: 100`, `tabWidth: 2`
  * `semi: false` (세미콜론 생략), `singleQuote: true`
  * `trailingComma: 'none'`
  * `plugins`:

    * `prettier-plugin-astro` : Astro 파일 지원
    * `@ianvs/prettier-plugin-sort-imports` : import 순서 자동 정렬
  * `importOrder`: Astro → @astrojs → 써드파티 → `@/…` 별칭 → 상대 경로 순
  * `overrides`: `*.astro` 파일에 `parser: 'astro'` 적용

* **무시 설정**

  * `.prettierignore` : 빌드 산출물(`dist/`), `.astro/`, `node_modules/` 등 포맷 제외

* **명령어**

  ```bash
  pnpm format
  ```

---

### 8.3 .gitignore

* Git 추적에서 제외되는 파일 및 폴더

  * `node_modules/`, `dist/`, `.astro/`
  * 환경파일 `.env*`
  * 캐시·로그 등 불필요 자원

---

### 8.4 개발 팁

* VS Code에서는 `.vscode/settings.json`에 저장 시 자동 포맷 옵션을 활성화해 두면,
  **저장만 해도 ESLint 점검 & Prettier 포맷팅이 적용**됩니다.
* CI/CD에 `pnpm lint`와 `pnpm format --check`를 넣으면 PR 단계에서 스타일 일관성을 자동으로 검증할 수 있습니다.

## 9️. 개발 환경 (TypeScript 설정 & 전역 타입)

이 프로젝트는 **Astro + TypeScript**를 엄격 모드로 사용하여 안정적이고 유지보수하기 쉬운 개발 환경을 제공합니다.

---

### 9.1 TypeScript 설정

* **설정 파일**: `tsconfig.json`

* **주요 특징**

  * `extends: "astro/tsconfigs/strict"`
    → Astro 전용 TS 설정을 엄격 모드로 확장
  * `lib`: `es2022`, `dom`, `dom.iterable`
    → 최신 JS 기능과 브라우저 API를 모두 사용 가능
  * `allowJs: true`
    → 점진적으로 TypeScript를 도입할 수 있도록 JS 허용
  * `declaration: true`
    → 타입 선언 파일을 생성해 IDE 자동완성에 활용
  * `strictNullChecks: true`, `verbatimModuleSyntax: true`
    → null 안전성 및 타입 전용 import 유지 강화

* **경로 별칭**

  ```jsonc
  {
    "paths": {
      "@/assets/*": ["src/assets/*"],
      "@/components/*": ["src/components/*"],
      "@/layouts/*": ["src/layouts/*"],
      "@/utils": ["src/utils/index.ts"],
      "@/utils/*": ["src/utils/*"],
      "@/plugins/*": ["src/plugins/*"],
      "@/pages/*": ["src/pages/*"],
      "@/types": ["src/types/index.ts"],
      "@/site-config": ["src/site.config.ts"]
    }
  }
  ```

  → 긴 상대 경로 대신 `@/components/...` 식으로 깔끔하게 import

* **포함/제외 경로**

  * 포함: `.astro/types.d.ts`, `src/**/*`
  * 제외: `node_modules`, `dist`, `public/scripts/*`, `.vscode`, `test/*` 등

---

### 9.2 전역 타입 선언

* **위치**: `src/type.d.ts`
* **역할**:

  * 전역 타입 보강 (예: `ImportMetaEnv`에 `.env` 키 추가)
  * 이미지·MDX 모듈 선언 (예: `declare module '*.mdx'`)
  * 전역 유틸 타입 및 인터페이스

TypeScript는 `include: ["**/*"]` 설정 덕분에 `src/type.d.ts`를 자동으로 인식하므로
별도 import 없이 전역 타입이 프로젝트 전반에 적용됩니다.

---

### 9.3 IDE/빌드 팁

* **VS Code**: `TypeScript: Enable Project Auto Imports` 옵션을 켜 두면
  `@/` 별칭 import가 자동 제안됩니다.
* **빌드**: `pnpm build` 시 타입 검사가 함께 이루어져 오류를 사전에 방지합니다.

## 10. 라이선스 & 거버넌스

### 10.1 라이선스 (MIT)

이 프로젝트는 **MIT License**로 배포됩니다.
상업적 이용·수정·재배포가 가능하며, **저작권 및 라이선스 고지**를 유지해야 합니다.
자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

배지 예시:

```md
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
```

---

### 10.2 기여자 행동강령 (Contributor Covenant v2.0)

모든 기여자는 [CODE\_OF\_CONDUCT.md](./CODE_OF_CONDUCT.md)를 준수해야 합니다.

핵심 원칙

* 환영·포용·건설적 피드백·책임 인정
* 성적 언사/괴롭힘/사생활 침해/인신공격 금지
* 위반 시 단계별 조치: 경고 → 제한 → 일시 차단 → 영구 차단

**신고**: `cworld0@qq.com` 으로 메일을 보내주세요.
모든 신고는 신속·공정하게 처리되며 신고자의 프라이버시는 보호됩니다.

## 1️1️. 배포 (GitHub Pages 등)

이 블로그는 완전한 **정적 사이트**이므로, 빌드된 `dist/` 폴더만 업로드하면 어떤 정적 호스팅 서비스에서도 동작합니다.
특히 **GitHub Pages**용 워크플로가 기본으로 포함돼 있어 바로 사용할 수 있습니다.

---

### 11.1 GitHub Pages 배포

* **워크플로 파일**: `.github/workflows/gh-pages.yml`
* **구성 요약**

  * 트리거: `push` 시 `main` 브랜치
  * 실행: `pnpm install` → `pnpm build`
  * 아티팩트 업로드: `dist/` 디렉터리
  * `actions/deploy-pages`를 사용해 `gh-pages` 브랜치로 자동 배포

> GitHub 저장소의 **Settings → Pages**에서
> 배포 브랜치를 `gh-pages`로 설정하면 완료됩니다.

---

### 11.2 기타 호스팅 서비스

| 서비스                           | 방식                                 |
| ----------------------------- | ---------------------------------- |
| **Vercel**                    | 저장소 연결 후 빌드 명령을 `pnpm build`로 지정   |
| **Netlify**                   | 빌드 명령 `pnpm build`, 출력 디렉터리 `dist` |
| **Cloudflare Pages**          | 빌드 명령 `pnpm build`, 빌드 출력 `dist`   |
| **AWS S3 / Firebase Hosting** | `dist` 폴더를 업로드                     |

> `.env`(Notion 토큰 등)를 사용하는 경우 서비스의 **환경 변수 설정**에서 동일하게 등록해야 합니다.

---

### 11.3 도메인 및 SEO

* `site.config.ts`의 `site`·`title`·`description`을 자신의 블로그 정보로 변경하세요.
* 필요하다면 `robots.txt.ts`, `rss.xml.ts`를 수정해 검색엔진 색인/피드 구성을 커스터마이징 할 수 있습니다.
* `public/images/social-card.png`는 OG 이미지(소셜 미리보기)로 사용됩니다.
  → 새로 제작한 이미지로 교체 후 `site.config.ts`의 `openGraph.image`를 수정하세요.

