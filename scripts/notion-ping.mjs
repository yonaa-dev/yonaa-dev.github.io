import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03' // 최신 버전 헤더
})

const dbId = process.env.NOTION_DATABASE_ID ?? process.env.NOTION_DB_ID_PROJECTS

// 1) DB 조회 → data source ID 획득
const db = await notion.databases.retrieve({ database_id: dbId })
const dsId = db.data_sources?.[0]?.id
if (!dsId) throw new Error('No data_sources found. Check database or Manage data sources.')

// 2) data source 쿼리
const res = await notion.dataSources.query({
  data_source_id: dsId,
  page_size: 1
})
console.log('OK. results:', res.results.length)

// node --env-file=.env scripts/notion-ping.mjs
// OK. results: 1