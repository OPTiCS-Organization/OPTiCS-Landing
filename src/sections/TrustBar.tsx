import { ArrowUpRight } from 'lucide-react'
import Container from '../components/ui/Container'
import LiveMetrics from './LiveMetrics'

/**
 * Hero 바로 뒤의 신뢰 층.
 *
 * 고객사 로고를 만들지 않는다. 없는 고객을 그려 넣는 순간 이 페이지의 다른
 * 모든 숫자도 같이 의심받는다. 대신 지금 확인할 수 있는 것만 세운다.
 *
 * 원래 이 자리에는 코드에 박아 둔 사실 넷이 있었다.
 *   0개 / 내 서버에서 열어야 할 포트, ₩0 / 월 요금, 내 서버 / 데이터가 있는 곳,
 *   1줄 / 설치 명령
 * 넷 다 참이었지만 전부 '이 제품이 그렇게 만들어졌다'는 설계 진술이었고,
 * 아래 섹션들이 같은 말을 훨씬 자세히 되풀이한다(포트는 역방향 터널, 요금은
 * 요금 배너, 설치 한 줄은 설치 섹션). 그 자리를 실측값에 넘겼다 — 같은
 * "믿을 만한가"에 답하되, 되풀이가 아니라 지금 이 순간의 상태로 답한다.
 *
 * 구성 요소 이름(Agent·Hub·Console)은 여기서 쓰지 않는다. 아직 정의되기 전이다 —
 * 뜻을 모르는 고유명사는 신뢰를 세우는 게 아니라 진입 장벽이 된다. LiveMetrics 의
 * 라벨 넷이 전부 용어 없이 읽히는 것도 이 자리에 놓을 수 있었던 이유다.
 * (예외로 'Agent 설치 수'의 Agent 는 남는데, 그건 설치 대상의 이름이라
 *  뜻을 몰라도 '뭔가를 설치한 수'로 읽힌다.)
 *
 * 마지막 줄에서 범위를 좁힌다. '외부 의존 없음'이라고 넓게 쓰면 과장이 된다 —
 * 터널은 자체 구현이 맞지만 DNS 와 인증서는 Cloudflare 를 쓴다. 이 줄과 GitHub
 * 링크는 LiveMetrics 가 사라져도 남는다. 둘 다 API 상태와 무관한 사실이고,
 * 띠가 통째로 비면 Hero 다음 화면에 구멍이 뚫린다.
 */
export default function TrustBar() {
  return (
    <section aria-label="제품 요약" className="border-b border-border-color bg-background-gradation-color">
      <Container width="wide" className="py-10 sm:py-12">
        <LiveMetrics />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <p className="max-w-2xl text-xs leading-relaxed text-tertiary-text-color">
            터널은 Cloudflare Tunnel이나 ngrok 같은 외부 서비스에 의존하지 않고 직접 구현했습니다.
            도메인 발급과 인증서에는 Cloudflare를 사용합니다.
          </p>

          <a
            href="https://github.com/OPTiCS-Organization"
            className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
          >
            GitHub에서 코드 확인하기
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </Container>
    </section>
  )
}
