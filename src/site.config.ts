import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // === 기본 설정 ===
  /** 웹사이트의 제목. 메타데이터와 브라우저 탭 제목으로 사용 */
  title: "YONA's Log",
  /** 인덱스 페이지 및 저작권 선언에 사용 */
  author: 'YONA',
  /** 웹사이트의 설명 메타데이터. 페이지 메타데이터에 사용 */
  description: "yonaa-dev's Log",
  /** 사이트의 기본 파비콘. `public/` 디렉토리 안의 이미지 경로 */
  favicon: '/favicon/favicon.ico',
  /** 사이트의 기본 언어를 지정 */
  locale: {
    lang: 'ko-KR',
    attrs: 'ko-KR',
    // Date locale
    dateLocale: 'ko-KR',
    dateOptions: { day: 'numeric', month: 'short', year: 'numeric' }
  },
  /** 홈페이지에 표시할 로고 이미지 설정 */
  logo: { src: 'src/assets/avatar.png', alt: 'YONA Avatar' },

  // === 전역 설정 ===
  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  // 아직 테스트 중
  head: [
    /* 텔레그램 채널 */
    // {
    //   tag: 'meta',
    //   attrs: { name: 'telegram:channel', content: '@cworld0_cn' },
    //   content: ''
    // }
  ],
  customCss: [],

  /** 사이트의 헤더를 설정 */
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      // { title: 'Docs', link: '/docs' },
      { title: 'Projects', link: '/projects' },
      // { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  },

  /** 사이트의 푸터 설정 */
  footer: {
    // Year format
    year: `© ${new Date().getFullYear()}`,
    // year: `© 2019 - ${new Date().getFullYear()}`,
    links: [
      // 정책 페이지를 만들면 여기에 연결
      // { title: 'Privacy Policy', link: '/terms/privacy-policy', pos: 2 }
    ],
    /** 사이트 푸터에 “Astro & Pure theme powered” 링크를 표시할지 여부 */
    credits: true,
    /** 이 사이트의 소셜 미디어 계정 정보 (선택 사항). */
    social: {
      github: 'https://github.com/yonaa-dev'
      // x: 'https://x.com/your_id',
      // linkedin: 'https://www.linkedin.com/in/your_id/',
      // email: 'mailto:you@example.com',
      // velog: 'https://velog.io/@your_id'
    }
  },

  content: {
    /** 외부 링크 설정 */
    externalLinks: {
      content: ' ↗',
      /** 외부 링크 요소의 속성 */
      properties: {
        style: 'user-select:none',
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    },
    /** 블로그 페이지네이션에 사용될 페이지 크기 (선택 사항) */
    blogPageSize: 8,
    // 현재 지원: x, bluesky
    share: ['x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  // 링크 관리
  // 참고: https://astro-pure.js.org/docs/integrations/links
  links: {
    // Friend logbook
    logbook: [
      // 참고:
      // { date: '2025-03-16', content: 'Is there a leakage?' },
      // { date: '2025-03-16', content: 'A leakage of what?' },
      // { date: '2025-03-16', content: 'I have a full seat of water, like, full of water!' },
      // { date: '2025-03-16', content: 'Must be the water.' },
      // { date: '2025-03-16', content: "Let's add that to the words of wisdom." }
    ] as any[],
    // 본인 링크 정보
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://yoursite.example.com/' },
      { name: 'Avatar', val: '/images/avatar.png' }
    ]
  },
  // 페이지 검색 기능 활성화
  pagefind: true,
  // 푸터에 랜덤 인용문 추가 (기본값은 홈페이지 푸터)
  // 참고: https://astro-pure.js.org/docs/integrations/advanced#web-content-render
  quote: {
    // https://developer.hitokoto.cn/sentence/#%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80
    // server: 'https://v1.hitokoto.cn/?c=i',
    // target: (data) => (data as { hitokoto: string }).hitokoto || 'Error'
    // https://github.com/lukePeavey/quotable
    server: 'https://api.quotable.io/quotes/random?maxLength=60',
    target: `(data) => data[0].content || 'Error'`
  },
  // UnoCSS typography
  // See: https://unocss.dev/presets/typography
  typography: {
    class: 'prose text-base text-muted-foreground',
    // 블록 인용구 글꼴 스타일: normal 또는 italic (기본값 italic)
    blockquoteStyle: 'italic',
    // 인라인 코드 블록 스타일: code 또는 modern (기본값 code)
    inlineCodeBlockStyle: 'modern'
  },
  // 확대(줌) 효과를 추가할 수 있는 라이트박스 라이브러리
  // See: https://astro-pure.js.org/docs/integrations/others#medium-zoom
  mediumZoom: {
    enable: true, // false로 설정하면 라이브러리가 로드되지 않음
    selector: '.prose .zoomable', // 전역 확대 원하면 '.prose img
    options: { className: 'zoomable' }
  },
  // 댓글 시스템
  waline: {
    // 자체 서버가 없으면 잠시 꺼두기
    enable: false,
    // 서버 서비스 링크
    server: 'https://your-waline-server.example.com/',
    // Refer https://waline.js.org/en/guide/features/emoji.html
    emoji: ['bmoji'],
    // Refer https://waline.js.org/en/reference/client/props.html
    additionalConfigs: {
      // search: false,
      pageview: true,
      comment: true,
      locale: {
        reaction0: 'Like',
        placeholder: '댓글을 남겨주세요. (답장을 받으려면 이메일 입력 필요, 로그인 불필요)'
      },
      imageUploader: false
    }
  }
}

export const terms: CardListData = {
  // title: 'Terms content',
  // list: [
  //   {
  //     title: 'Privacy Policy',
  //     link: '/terms/privacy-policy'
  //   },
  //   {
  //     title: 'Terms and Conditions',
  //     link: '/terms/terms-and-conditions'
  //   },
  //   {
  //     title: 'Copyright',
  //     link: '/terms/copyright'
  //   },
  //   {
  //     title: 'Disclaimer',
  //     link: '/terms/disclaimer'
  //   }
  // ]
  // title: 'Internal Navigation',
  // list: [
  //   {
  //     title: 'About',
  //     link: '/about',
  //   },
  //   {
  //     title: 'Projects',
  //     link: '/projects',
  //   },
  //   {
  //     title: 'Archive',
  //     link: '/archive',
  //   },
  // ],
  title: 'External Profile',
  list: [
    {
      title: 'GitHub',
      link: '/profile/git-hub'
    },
    {
      title: 'LinkedIn',
      link: '/profile/linked-in'
    },
    {
      title: 'Velog',
      link: '/profile/velog'
    }
  ]
}

const config = { ...theme, integ } as Config
export default config