import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import PricingPage from './pages/PricingPage'
import { FAQ as LANDING_FAQ } from './sections/Faq'
import { FAQ as PRICING_FAQ } from './sections/PricingFaq'

/**
 * 빌드 때 한 번 도는 서버 엔트리. 브라우저에서는 절대 실행되지 않는다.
 *
 * 왜 필요한가:
 * 이 사이트는 클라이언트 렌더링 MPA 라, 배포되는 HTML 의 본문이 `<div id="root"></div>`
 * 한 줄뿐이었다. Googlebot 은 JS 를 실행해 주지만 네이버 Yeti·다음 등 국내 검색 엔진의
 * 크롤러는 그렇지 않다. 한국어로 쓰인 페이지가 국내 검색에서 '내용이 없는 문서'로
 * 남는다는 뜻이라, 빌드 때 같은 트리를 문자열로 한 번 그려 HTML 안에 박아 둔다.
 *
 * hydrate 하지 않는다:
 * main.tsx 는 그대로 createRoot 다. hydrateRoot 로 바꾸면 서버가 그린 것과 브라우저가
 * 그린 것이 완전히 같아야 하는데, 이 페이지에는 첫 렌더에서 prefers-reduced-motion 을
 * 읽는 곳이 있어(ProductVisual) 모션을 줄인 방문자에게만 불일치가 난다. React 는 그
 * 경우 콘솔에 오류를 남기고 어차피 전부 다시 그린다. 그럴 바에는 처음부터 다시 그리게
 * 두는 편이 낫다 — 여기서 뽑는 HTML 의 임무는 크롤러가 읽을 본문과 첫 페인트까지고,
 * 마크업이 같으니 교체는 눈에 띄지 않는다.
 *
 * 여기서 렌더할 때 Hub 통계는 아직 'loading' 이다(구독이 effect 에서 일어나므로 Node
 * 에서는 요청이 나가지 않는다). 그래서 크롤러가 받는 HTML 에는 실시간 숫자와 버전
 * 문자열이 빠진다 — 맞는 결과다. 빌드 시점의 값을 굳혀 두면 검색 결과에 낡은 숫자가
 * 남는다. index.html 의 JSON-LD 에서 softwareVersion 을 뺀 것과 같은 판단이다.
 */

/** JSON-LD 를 `<script>` 안에 안전하게 넣는다. */
function jsonLdScript(data: unknown): string {
  /*
   * `<` 를 그대로 두면 안 된다. FAQ 답변에 '<서비스>.<워크스페이스>.optics.run' 처럼
   * 꺾쇠가 들어 있어서, 이스케이프하지 않으면 `</script` 는 아니더라도 파서가 태그로
   * 볼 여지가 생긴다. < 는 JSON 문자열 안에서 동일한 값이라 의미는 바뀌지 않는다.
   */
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">${json}</script>`
}

type QnA = { question: string; answer: string }

/**
 * FAQPage 구조화 데이터.
 *
 * 화면에 그리는 것과 같은 배열에서 만든다. 구글은 구조화 데이터의 답이 페이지에
 * 실제로 보이는 답과 같기를 요구하고, 두 벌로 관리하면 반드시 갈라진다.
 */
function faqPage(items: readonly QnA[]): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** 프리렌더 결과. `head` 는 `</head>` 앞에, `body` 는 `#root` 안에 들어간다. */
export type Rendered = { head: string; body: string }

/**
 * 키는 dist 안의 파일 이름이다. HTML 엔트리를 추가하면 vite.config.ts 의 input 과
 * 이 표 둘 다에 넣어야 프리렌더 대상이 된다. 한쪽만 넣으면 조용히 빈 페이지가 배포된다 —
 * scripts/prerender.mjs 가 그 어긋남을 빌드 실패로 잡는다.
 */
export const PAGES: Record<string, () => Rendered> = {
  'index.html': () => ({
    head: jsonLdScript(faqPage(LANDING_FAQ)),
    body: renderToStaticMarkup(<App />),
  }),
  'pricing.html': () => ({
    head: jsonLdScript(faqPage(PRICING_FAQ)),
    body: renderToStaticMarkup(<PricingPage />),
  }),
}
