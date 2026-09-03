// @ts-check
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES } from '../dist-ssr/entry-server.js'

/**
 * 빌드된 HTML 에 크롤러가 읽을 본문을 채워 넣는다.
 *
 *   vite build          → dist/*.html (본문은 빈 #root) + dist/assets/*
 *   vite build --ssr    → dist-ssr/entry-server.js
 *   이 스크립트          → dist/*.html 의 #root 안을 채우고 head 에 JSON-LD 를 넣는다
 *
 * 왜 이 순서인가: 클라이언트 빌드가 만든 HTML 에는 해시가 붙은 스크립트·스타일 링크가
 * 이미 들어 있다. 그 결과물을 고치는 편이, 프리렌더가 HTML 을 처음부터 만들면서
 * 자산 경로를 스스로 알아내게 하는 것보다 틀릴 여지가 적다.
 *
 * 실패하면 빌드를 세운다. 조용히 넘어가면 본문 없는 HTML 이 배포되는데, 그건 눈으로는
 * 멀쩡해 보이고(브라우저는 JS 로 그리니까) 검색 엔진에서만 비어 보인다 — 몇 주 뒤
 * 순위가 빠질 때까지 아무도 모른다.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')

/* 클라이언트 빌드가 낸 HTML 과 PAGES 의 목록이 어긋나면 멈춘다. */
const built = readdirSync(distDir).filter(name => name.endsWith('.html'))
const missing = built.filter(name => !(name in PAGES))
if (missing.length > 0) {
  throw new Error(
    `프리렌더 대상이 없는 페이지: ${missing.join(', ')}\n` +
    'src/entry-server.tsx 의 PAGES 에 추가하세요. 그대로 두면 본문이 빈 채로 배포됩니다.',
  )
}

const ROOT_PLACEHOLDER = '<div id="root"></div>'

for (const [name, render] of Object.entries(PAGES)) {
  const file = resolve(distDir, name)
  const html = readFileSync(file, 'utf8')

  if (!html.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`${name}: '${ROOT_PLACEHOLDER}' 를 찾지 못했습니다. 마운트 지점이 바뀌었는지 확인하세요.`)
  }
  if (!html.includes('</head>')) {
    throw new Error(`${name}: '</head>' 를 찾지 못했습니다.`)
  }

  const { head, body } = render()

  /*
   * 치환 문자열이 아니라 함수를 넘긴다. 렌더 결과에 '$&' 같은 조각이 있으면
   * 문자열 치환에서는 그게 특수 표기로 해석돼 마크업이 조용히 망가진다.
   */
  const filled = html
    .replace('</head>', () => `${head}</head>`)
    .replace(ROOT_PLACEHOLDER, () => `<div id="root">${body}</div>`)

  writeFileSync(file, filled)
  console.log(`prerendered ${name} (+${(body.length / 1024).toFixed(1)}KB)`)
}
