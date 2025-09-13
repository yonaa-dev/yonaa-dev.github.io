/**
 * Notion DB → local Markdown(JSON) 캐시 (커버만 hero로 쓰는 최종본)
 * - 컬렉션: src/content/projects/<slug>.mdx
 * - 본문 이미지: /public/assets/notion/<pageId>/<hash>-<filename>
 * - heroImage  : /src/assets/notion/<pageId>/<hash>-<filename>  (Notion Page Cover만 사용)
 *
 * ENV (최소):
 *   NOTION_TOKEN=...
 *   NOTION_DATABASE_ID=...        # 또는 NOTION_DB_ID_PROJECTS
 *
 * ENV (선택, 속성명이 기본값과 다를 때 오버라이드):
 *   NOTION_TITLE_PROP=Name
 *   NOTION_SLUG_PROP=Slug
 *   NOTION_DATE_PROP=Date
 *   NOTION_UPDATED_PROP=Updated
 *   NOTION_TAGS_PROP=Tags
 *   NOTION_SUMMARY_PROP=Summary
 *   NOTION_CATEGORY_PROP=Category
 *   NOTION_LOCALE_PROP=Locale
 *   NOTION_PUBLISHED_PROP=Published
 *   NOTION_HERO_ALT_PROP=Hero Alt
 *   NOTION_HERO_COLOR_PROP=Hero Color
 *
 * 실행:
 *   node --env-file=.env scripts/notion-cache.mjs
 */
import 'dotenv/config'

import { createHash } from 'node:crypto'
import { constants as FS } from 'node:fs'
import { access, link, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/* ---------- ENV ---------- */
const { NOTION_TOKEN } = process.env
const NOTION_DB_ID_PROJECTS = process.env.NOTION_DB_ID_PROJECTS ?? process.env.NOTION_DATABASE_ID

if (!NOTION_TOKEN || !NOTION_DB_ID_PROJECTS) {
  console.error('[notion] Missing NOTION_TOKEN or DB ID')
  process.exit(1)
}

/** 속성명 매핑: .env로 덮어쓸 수 있음 */
const PROP = {
  TITLE: process.env.NOTION_TITLE_PROP ?? 'Name',
  SLUG: process.env.NOTION_SLUG_PROP ?? 'Slug',
  DATE: process.env.NOTION_DATE_PROP ?? 'Date',
  UPDATED: process.env.NOTION_UPDATED_PROP ?? 'Updated',
  TAGS: process.env.NOTION_TAGS_PROP ?? 'Tags',
  SUMMARY: process.env.NOTION_SUMMARY_PROP ?? 'Summary',
  CATEGORY: process.env.NOTION_CATEGORY_PROP ?? 'Category',
  LOCALE: process.env.NOTION_LOCALE_PROP ?? 'Locale',
  PUBLISHED: process.env.NOTION_PUBLISHED_PROP ?? 'Published',
  HERO_ALT: process.env.NOTION_HERO_ALT_PROP ?? 'Hero Alt',
  HERO_COLOR: process.env.NOTION_HERO_COLOR_PROP ?? 'Hero Color'
}

/* ---------- Notion Clients ---------- */
const notion = new Client({
  auth: NOTION_TOKEN,
  notionVersion: '2025-09-03' // 워크스페이스 호환성에 따라 조정 가능
})
const n2m = new NotionToMarkdown({ notionClient: notion })

/* ---------- fetch (Node18+ 전역, 폴백 node-fetch) ---------- */
const fetch = globalThis.fetch ?? (await import('node-fetch')).default

/* ---------- utils ---------- */
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function getProp(page, name) {
  return page.properties?.[name]
}
function asText(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map((t) => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map((t) => t.plain_text).join('')
  if (prop.type === 'multi_select') return prop.multi_select.map((s) => s.name)
  if (prop.type === 'select') return prop.select?.name || ''
  if (prop.type === 'url') return prop.url || ''
  if (prop.type === 'date') return prop.date?.start || ''
  if (prop.type === 'checkbox') return !!prop.checkbox
  return ''
}

function uniqueHttpImageUrls(md) {
  const set = new Set()
  const reMd = /!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/g
  const reHtml = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/g
  let m
  while ((m = reMd.exec(md))) set.add(m[1])
  while ((m = reHtml.exec(md))) set.add(m[1])
  return Array.from(set)
}

/* utils */
function stableKeyForHash(u) {
  const { pathname } = new URL(u) // 쿼리·서명 제외
  return decodeURIComponent(pathname) // 경로만을 해시의 기준으로
}

function sha1_8(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 8)
}

function safeNameFromUrl(u) {
  const raw = decodeURIComponent(new URL(u).pathname.split('/').pop() || 'image')
  return raw.slice(-80)
}

/* ---------- 이미지 캐시 & 하드링크 유틸 ---------- */
// key: sha1(pathname) / value: { fileAbs, localPath }
const downloadedImages = new Map()
// key: sha1(pathname) / value: Promise<{ fileAbs, localPath }>
const inFlight = new Map()

async function fileExists(p) {
  try {
    await access(p, FS.F_OK)
    return true
  } catch {
    return false
  }
}

async function ensureImageAt(url, outDirAbs, publicPrefix, maybeLinkFrom) {
  const key = sha1_8(stableKeyForHash(url))
  const safe = safeNameFromUrl(url)
  const hashed = `${key}-${safe}`
  const fileAbs = path.join(outDirAbs, hashed)
  const localPath = `${publicPrefix}/${hashed}`

  // 0) 메모리 캐시 히트
  const cached = downloadedImages.get(key)
  if (cached) {
    if (cached.fileAbs !== fileAbs && !(await fileExists(fileAbs))) {
      await mkdir(outDirAbs, { recursive: true })
      await link(cached.fileAbs, fileAbs) // 하드링크로 재사용
    }
    const val = { fileAbs, localPath }
    downloadedImages.set(key, val)
    return val
  }

  // 1) 디스크 히트
  if (await fileExists(fileAbs)) {
    const val = { fileAbs, localPath }
    downloadedImages.set(key, val)
    return val
  }

  // 2) 동시 중복 요청 억제
  if (inFlight.has(key)) return inFlight.get(key)

  const p = (async () => {
    // 2-1) 다른 위치에 이미 존재한다면 링크로 재사용
    if (maybeLinkFrom?.fileAbs && (await fileExists(maybeLinkFrom.fileAbs))) {
      await mkdir(outDirAbs, { recursive: true })
      await link(maybeLinkFrom.fileAbs, fileAbs)
      const val = { fileAbs, localPath }
      downloadedImages.set(key, val)
      return val
    }

    // 3) 실제 다운로드 (최후의 수단)
    const res = await fetch(url)
    if (!res?.ok) throw new Error(`[fetch fail] ${res?.status} ${url}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    await mkdir(outDirAbs, { recursive: true })
    await writeFile(fileAbs, buffer)
    const val = { fileAbs, localPath }
    downloadedImages.set(key, val)
    return val
  })().finally(() => inFlight.delete(key))

  inFlight.set(key, p)
  return p
}

/* 공개 API: 본문 이미지(= public/) */
async function downloadToPublic(url, outDirAbs, publicPrefix) {
  const { localPath } = await ensureImageAt(url, outDirAbs, publicPrefix)
  return localPath
}

/* 공개 API: 히어로 이미지(= src/assets/) — 이미 받아둔 게 있으면 링크로 재사용 */
async function downloadHeroImage(url, heroDirAbs, heroRelFromContent) {
  const key = sha1_8(stableKeyForHash(url))
  const cached = downloadedImages.get(key) || null
  const { localPath } = await ensureImageAt(
    url,
    heroDirAbs,
    heroRelFromContent,
    cached // 이미 다른 폴더에 있으면 하드링크
  )
  return localPath
}

/* ---------- Data source helpers (신규 스펙) ---------- */
async function getFirstDataSourceId(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const ds = db.data_sources?.[0]
  if (!ds) {
    throw new Error(
      '[notion] no data_sources on this database. Open the DB → "Manage data sources" and add your integration.'
    )
  }
  return ds.id
}

/* ---------- Notion fetch (dataSources.query 우선, 하위호환 폴백) ---------- */
async function fetchAll(dbId) {
  const pages = []
  let cursor

  let dataSourceId = null
  try {
    dataSourceId = await getFirstDataSourceId(dbId)
  } catch (e) {
    console.warn('[notion] data_sources not found. Fallback to databases.query:', e?.message || e)
  }

  do {
    const sortProp = PROP.DATE || null
    const filterProp = PROP.PUBLISHED || null

    const dsPayload = {
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 50,
      ...(sortProp ? { sorts: [{ property: sortProp, direction: 'descending' }] } : {}),
      ...(filterProp ? { filter: { property: filterProp, checkbox: { equals: true } } } : {})
    }

    let res
    if (dataSourceId && notion.dataSources?.query) {
      res = await notion.dataSources.query(dsPayload)
    } else if (notion.databases?.query) {
      const legacyPayload = {
        database_id: dbId,
        start_cursor: cursor,
        page_size: 50,
        ...(sortProp ? { sorts: [{ property: sortProp, direction: 'descending' }] } : {}),
        ...(filterProp ? { filter: { property: filterProp, checkbox: { equals: true } } } : {})
      }
      res = await notion.databases.query(legacyPayload)
    } else {
      if (!dataSourceId)
        throw new Error('[notion] cannot query: no dataSourceId and no databases.query')
      res = await notion.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'post',
        body: dsPayload
      })
    }

    pages.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
    await wait(150)
  } while (cursor)

  return pages
}

/* ---------- Page cover helper ---------- */
async function getPageCoverUrl(page) {
  // query 결과에 cover가 있을 수도 있으나, 안전하게 retrieve로 보강
  const candidate = page.cover
  if (candidate) {
    if (candidate.type === 'file') return candidate.file?.url ?? null
    if (candidate.type === 'external') return candidate.external?.url ?? null
  }
  try {
    const full = await notion.pages.retrieve({ page_id: page.id })
    const c = full.cover
    if (!c) return null
    if (c.type === 'file') return c.file?.url ?? null
    if (c.type === 'external') return c.external?.url ?? null
  } catch {
    // ignore
  }
  return null
}

/* ---------- 블록 재귀 순회 (모든 깊이) ---------- */
async function walkBlocks(block_id, visit) {
  let cursor
  do {
    const res = await notion.blocks.children.list({
      block_id,
      start_cursor: cursor,
      page_size: 100
    })
    for (const b of res.results ?? []) {
      await visit(b)
      if (b.has_children) {
        await walkBlocks(b.id, visit)
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined
    await wait(80)
  } while (cursor)
}

/* ---------- main ---------- */
async function main() {
  downloadedImages.clear()
  const pages = await fetchAll(NOTION_DB_ID_PROJECTS)

  const list = []
  for (const p of pages) {
    const id = p.id.replace(/-/g, '')
    // 본문 이미지(마크다운)용: public 유지
    const outDirAbs = path.join(__dirname, '../public/assets/notion', id)
    const publicPrefix = `/assets/notion/${id}`
    // 히어로 이미지만 정적 자산으로: src/assets
    const heroDirAbs = path.join(__dirname, '../src/assets/notion', id)
    const heroRelFromContent = `../../assets/notion/${id}` // ← src/content/projects/*.mdx 기준 상대경로

    const title = asText(getProp(p, PROP.TITLE))
    const slugRaw = asText(getProp(p, PROP.SLUG)) || id
    const slug = slugRaw
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')

    const date = asText(getProp(p, PROP.DATE)) || new Date().toISOString()
    const updated = asText(getProp(p, PROP.UPDATED)) || p.last_edited_time
    const tags = asText(getProp(p, PROP.TAGS)) || []
    const desc = asText(getProp(p, PROP.SUMMARY)) || ''
    const cat = asText(getProp(p, PROP.CATEGORY)) || 'projects'
    const loc = (asText(getProp(p, PROP.LOCALE)) || 'ko').toLowerCase()

    /* ----- hero image: Page Cover만 사용 (캐시/링크 재사용) ----- */
    let heroImage = null
    const heroUrl = await getPageCoverUrl(p)
    if (heroUrl) {
      try {
        const heroRel = await downloadHeroImage(heroUrl, heroDirAbs, heroRelFromContent)
        if (heroRel) {
          heroImage = {
            src: heroRel,
            alt: asText(getProp(p, PROP.HERO_ALT)) || title,
            color: asText(getProp(p, PROP.HERO_COLOR)) || undefined
          }
        }
      } catch (e) {
        console.warn('[notion hero] download fail:', heroUrl, e?.message)
      }
    }

    /* ----- 페이지 블록 재귀 순회: 이미지 선다운로드 & 상대파일명 매핑 ----- */
    const relativeMap = new Map() // key: 원래 파일명, value: 로컬 경로
    await walkBlocks(p.id, async (b) => {
      if (b.type === 'image') {
        const fileUrl = b.image.type === 'file' ? b.image.file?.url : b.image.external?.url
        if (!fileUrl) return
        try {
          const local = await downloadToPublic(fileUrl, outDirAbs, publicPrefix)
          if (local) {
            const base = decodeURIComponent(new URL(fileUrl).pathname.split('/').pop() || '')
            const filename = base.split('?')[0]
            if (filename) relativeMap.set(filename, local)
          }
        } catch (e) {
          console.warn('[notion img block] fail:', e?.message)
        }
        await wait(50)
      }
    })

    /* ----- 본문 → Markdown ----- */
    const mdBlocks = await n2m.pageToMarkdown(p.id)
    let md = (n2m.toMarkdownString(mdBlocks).parent || '').trim()

    /* ----- 본문 내 외부 이미지(HTTP) 로컬화 ----- */
    for (const u of uniqueHttpImageUrls(md)) {
      try {
        const local = await downloadToPublic(u, outDirAbs, publicPrefix)
        if (local) md = md.replaceAll(u, local)
      } catch (e) {
        console.warn('[notion img http] fail:', u, e?.message)
      }
      await wait(50)
    }

    /* ----- 본문 내 상대 이미지 → 로컬 경로로 재매핑 (Map 우선, 없으면 publicPrefix로) ----- */
    // Markdown 패턴
    md = md.replace(/!\[[^\]]*]\(((?!https?:\/\/|\/)[^)]+)\)/g, (_m, p1) => {
      const key = decodeURIComponent(p1)
      const local = relativeMap.get(key)
      if (local) return _m.replace(p1, local)
      const encoded = encodeURIComponent(p1).replace(/%2F/gi, '/')
      return _m.replace(p1, `${publicPrefix}/${encoded}`)
    })
    // HTML <img src="..."> 패턴
    md = md.replace(/<img[^>]+src=["'](?!https?:\/\/|\/)([^"']+)["']/g, (_m, p1) => {
      const key = decodeURIComponent(p1)
      const local = relativeMap.get(key)
      const target = local ?? `${publicPrefix}/${encodeURIComponent(p1).replace(/%2F/gi, '/')}`
      return _m.replace(p1, target)
    })

    /* ----- 빈 본문/헤딩 자동 보정 (TOC 플러그인 안전) ----- */
    if (!md) md = '_(내용 준비 중)_'
    const hasHeading = /(^|\n)#{1,6}\s/.test(md)
    if (!hasHeading) {
      md = `# ${title}\n\n${md}`
    }

    /* ----- 파일 쓰기 ----- */
    const contentDir = path.join(__dirname, `../src/content/projects`)
    await mkdir(contentDir, { recursive: true })

    const fm = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(desc)}`,
      `pubDate: ${JSON.stringify(date)}`,
      Array.isArray(tags)
        ? `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`
        : `tags: ${JSON.stringify(tags)}`,
      `slug: ${JSON.stringify(slug)}`,
      `locale: ${JSON.stringify(loc)}`,
      `category: ${JSON.stringify(cat)}`,
      heroImage
        ? `heroImage:\n  src: ${JSON.stringify(heroImage.src)}\n  alt: ${JSON.stringify(
            heroImage.alt
          )}${heroImage.color ? `\n  color: ${JSON.stringify(heroImage.color)}` : ''}`
        : null,
      `updatedDate: ${JSON.stringify(updated)}`,
      '---'
    ]
      .filter(Boolean)
      .join('\n')

    const out = fm + '\n\n' + md.trimEnd() + '\n'
    const filename = `${slug}.mdx`
    await writeFile(path.join(contentDir, filename), out, 'utf8')

    /* ----- 인덱스 작성용 수집 ----- */
    list.push({
      id,
      slug,
      locale: loc,
      title,
      date,
      tags,
      category: cat,
      summary: desc
    })
  }

  /* ----- 인덱스 파일 쓰기 ----- */
  await mkdir(path.join(__dirname, '../src/data'), { recursive: true })
  await writeFile(
    new URL('../src/data/projects.json', import.meta.url),
    JSON.stringify({ updatedAt: new Date().toISOString(), items: list }, null, 2),
    'utf8'
  )

  console.log(`[notion] cached ${list.length} items (single collection)`)
}

main().catch((e) => {
  console.error(e?.body ?? e)
  process.exit(1)
})
