import NavBar from './components/NavBar'
import Statement from './components/ui/Statement'
import Hero from './sections/Hero'
import TrustBar from './sections/TrustBar'
import Situations from './sections/Situations'
import Problem from './sections/Problem'
import Comparison from './sections/Comparison'
import HowItWorks from './sections/HowItWorks'
import ReverseTunnel from './sections/ReverseTunnel'
import Features from './sections/Features'
import Architecture from './sections/Architecture'
import PricingBanner from './sections/PricingBanner'
import Install from './sections/Install'
import Faq from './sections/Faq'
import Status from './sections/Status'
import Closing from './sections/Closing'
import Footer from './sections/Footer'

/**
 * 섹션 순서는 방문자의 질문 순서다.
 *
 *   Hero         이게 뭔가
 *   TrustBar     믿을 만한가 (Hub API가 지금 돌려주는 실측값 넷 + 범위 고지)
 *   Situations   이게 내 얘기인가 (상황별 바로가기)
 *   Problem      왜 필요한가
 *   HowItWorks   쓰기 어렵지 않나
 *   Tunnel       정말 되는 게 맞나 (원리)
 *   Comparison   이미 쓰는 것들과 뭐가 다른가
 *   Features     무엇까지 되나
 *   Statement    ↑ 여기까지의 결론 한 문장
 *   Architecture 어떻게 생겼나
 *   Pricing      얼마인가
 *   Install      그래서 뭘 하면 되나
 *   Faq          걸리는 게 남았는데
 *   Status       아직 안 되는 건 뭔가
 *   Closing      다시 한 번
 *
 * 순서를 바꿀 때는 답이 나오기 전에 질문이 먼저 오는지 확인한다.
 * 예컨대 Features 를 Tunnel 앞으로 올리면 "그게 어떻게 가능한데"가 해소되지 않은
 * 채로 기능 목록을 읽게 되고, 목록 전체가 주장으로만 남는다.
 *
 * Comparison 이 Tunnel 뒤인 이유:
 * 한 번 Problem 바로 뒤(네 번째)에 뒀다가 옮겼다. "ngrok 쓰면 되지 않나"는 문제를
 * 인식한 직후에 떠오르는 반문이라 빨리 답하고 싶었는데, 정작 그 표의 칸들이
 * '역방향', 'Hub 공개 프록시', 'Agent 컨테이너' 같은 말로 쓰여 있다. 전부 Tunnel
 * 섹션에서야 설명되는 용어다. 정의되지 않은 단어로 짠 9행 3열 표를 네 번째 화면에
 * 들이미는 셈이었다.
 *
 * 반문에 늦게 답하는 손해보다, 읽을 수 없는 표를 먼저 보여주는 손해가 크다.
 * 메커니즘을 이해한 뒤에 비교해야 표의 각 칸이 판단 재료가 된다.
 *
 * 배경 톤은 base / sunken / raised 가 이웃끼리 겹치지 않게 짠다(Section.tsx 참조).
 * 긴 페이지에서 '지금 어디쯤인가'를 만드는 것이 이 교차다. HowItWorks 한 곳만
 * raised 로 띄워 페이지 앞부분의 고비를 표시한다.
 *
 * LiveMetrics 는 별도 섹션이 아니라 TrustBar 띠 안에 있다(sections/TrustBar.tsx).
 * 원래 그 자리에 있던 정적 사실 넷(0개 · ₩0 · 내 서버 · 1줄)을 실측값으로 갈아
 * 끼운 것이라, 순서상으로도 톤 배치상으로도 새로 낀 블록이 없다.
 *
 * 섹션이 아니라 띠로 둔 이유: 아직 값이 작다. 제목을 세우고 그 아래 5개·9개를
 * 놓으면 제목이 그 작음까지 같이 키운다. 지나가는 띠 한 줄이면 같은 숫자가
 * 자랑이 아니라 확인 가능한 사실로 읽힌다. 값이 커진 뒤 제목을 붙일 수는
 * 있지만 그 반대는 안 된다.
 *
 * API가 죽으면 숫자 줄만 빠지고 띠는 남는다 — 범위 고지와 GitHub 링크는
 * API 상태와 무관한 사실이라, 그 둘이 띠를 지탱해 Hero 다음 화면에 구멍이
 * 생기지 않는다.
 */
export default function App() {
  return (
    <>
      {/*
        건너뛰기 링크. 키보드로 들어온 사람이 헤더의 링크 여덟 개를 매번
        지나지 않게 한다. 평소에는 화면 밖에 있다가 포커스를 받으면 나타난다.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-service-color focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent-color"
      >
        본문으로 건너뛰기
      </a>

      <NavBar />

      <main id="main">
        <Hero />
        <TrustBar />
        <Situations />
        <Problem />
        <HowItWorks />
        <ReverseTunnel />
        <Comparison />
        <Features />

        {/*
          기능 셋을 다 보여준 뒤, 그 셋이 공통으로 증명한 것을 한 문장으로 받는다. 새 사실을 꺼내지 않는다 —
          읽는 사람이 이미 아는 말이어야 힘이 실린다.

          전에는 '열어야 할 포트는 0개'였는데, 바로 위 Tunnel 섹션이 방금 다이어그램
          둘로 한 말이라 즉시 반복이 됐다. 포트 이야기는 이 페이지에서 이미 여러 번
          나온다. 대신 아직 한 문장으로 말한 적 없는 쪽을 고른다.

          note 로 예외를 같이 적는 이유: 바깥 요청은 실제로 Hub 의 공개 프록시를
          지난다. 문장을 강하게 만들자고 그 사실을 빼면 바로 아래 FAQ 와 어긋난다.
        */}
        <Statement note="외부에서 들어온 요청만 Hub의 공개 프록시를 경유합니다.">
          소스도, 이미지도, 데이터베이스도 내 서버를 떠나지 않습니다.
        </Statement>
        <Architecture />

        <PricingBanner />
        <Install />
        <Faq />
        <Status />
        <Closing />
      </main>

      <Footer />
    </>
  )
}
