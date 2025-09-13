// src/content/config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/** 태그 정리: 소문자 + 중복 제거 */
function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

/** 문자열/배열 모두 허용 후 배열로 통일 */
const tagsUnionToArray = z
  .union([z.array(z.string()), z.string()])
  .default([])
  .transform((v) => {
    const arr = Array.isArray(v)
      ? v.map(String)
      : String(v)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
    return removeDupsAndLowerCase(arr)
  })

/** helper: heroImage.src는 image() | string 모두 허용 */
const heroImageSchema = (image: any) =>
  z
    .object({
      src: z.union([image(), z.string()]), // 🔑 핵심: 유니온
      alt: z.string().optional(),
      inferSize: z.boolean().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      color: z.string().optional()
    })
    .optional()

// 블로그: 단일 컬렉션 + locale/slug 추가
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // 필수
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date(),
      // i18n
      locale: z.enum(['ko', 'en']).default('ko'),
      // 라우팅 충돌 방지용 고유 slug
      slug: z.string().min(1),

      updatedDate: z.coerce.date().optional(),
      heroImage: heroImageSchema(image),
      tags: tagsUnionToArray,

      // 기존 language는 optional로 유지
      language: z.string().optional(),
      draft: z.boolean().default(false),
      comment: z.boolean().default(true)
    })
})

// projects: 단일 컬렉션 + locale/slug
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      description: z.string().max(200).optional(),
      pubDate: z.coerce.date(), // Notion 캐시에서 pubDate로 씀
      updatedDate: z.coerce.date().optional(),
      href: z.string().url().optional(),
      locale: z.enum(['ko', 'en']).default('ko'),
      slug: z.string().min(1),
      category: z.string().default('projects'),
      tags: tagsUnionToArray,

      heroImage: heroImageSchema(image),

      draft: z.boolean().default(false),
      comment: z.boolean().default(false)
    })
})

// // 문서 컬렉션
// const docs = defineCollection({
//   loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
//   schema: () =>
//     z.object({
//       title: z.string().max(60),
//       description: z.string().max(160),
//       publishDate: z.coerce.date().optional(),
//       updatedDate: z.coerce.date().optional(),
//       tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
//       draft: z.boolean().default(false),
//       // Special
//       order: z.number().default(999)
//     })
// })

// export const collections = { blog, projects, docs }
export const collections = { blog, projects }
