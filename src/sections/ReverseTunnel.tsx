import Mark from '../components/ui/Mark'
import { ChevronDown } from 'lucide-react'
import TunnelComparison from '../diagrams/TunnelComparison'
import RequestFlow from '../diagrams/RequestFlow'
import PlainSummary from '../components/PlainSummary'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'
import DiagramFrame from '../components/ui/DiagramFrame'

/**
 * 페이지의 핵심 섹션.
 * 이 제품의 유일한 진짜 차별점이므로 다이어그램 두 개를 쓴다.
 *
 * id 는 tunnel 이다. architecture 는 구성 요소를 다루는 아래 섹션이 가져갔다 —
 * 내비게이션에서 '구조'를 눌렀을 때 부품 목록이 나와야지, 원리 설명이 나오면
 * 찾던 것을 지나쳤다고 느낀다.
 */

/*
 * 여기 세 줄은 검증 가능한 것만 쓴다.
 *
 * '외부 의존 없음' 이라고 쓰면 안 된다. 터널은 자체 구현이 맞지만
 * DNS 와 앞단은 Cloudflare 를 쓴다. 자체 구현인 대상을 정확히 좁힌다.
 *
 * 'Hub 를 거치지 않는다' 도 사실이 아니다. 공개 프록시는 Hub 의 일부이고
 * (Architecture 섹션에도 그렇게 적혀 있다) proxy/server.ts 가 클라이언트
 * 소켓과 터널 소켓을 직접 릴레이한다. 요청 바이트는 분명히 지나간다.
 * 정확한 사실은 'Hub API 와 DB 가 이 경로에 없다' 는 것이다.
 */
const FACTS = [
  { term: '터널 구현', desc: 'Cloudflare Tunnel 및 ngrok에 의존하지 않는 자체 구현' },
  { term: '개방할 포트', desc: '사용자 서버에서 0개' },
  { term: '요청 경로', desc: '공개 프록시가 Host만 읽어 중계하며, Hub API와 DB는 이 경로에 포함되지 않음' },
]

export default function ReverseTunnel() {
  return (
    <Section id="tunnel" space="roomy" labelledBy="tunnel-title">
      <SectionHeading id="tunnel-title" eyebrow="연결 방식" title="역방향 연결로 외부 접근을 지원합니다">
        <p>
          일반적으로 방화벽은 <strong className="font-semibold text-primary-text-color">수신</strong> 연결을 차단하지만,{' '}
          <strong className="font-semibold text-primary-text-color"><Mark>발신</Mark></strong> 연결은 허용합니다.
          이에 따라 Hub가 Agent에 연결하는 대신 Agent가 Hub로 먼저 연결합니다.
          명령은 이미 수립된 연결을 역방향으로 전달합니다.
        </p>
      </SectionHeading>

      <div className="mt-12">
        <DiagramFrame>
          <TunnelComparison />
        </DiagramFrame>
      </div>

      {/*
        '남의 인프라 없이' 라고 넓게 쓰지 않는다. DNS 레코드와 앞단은 Cloudflare 를
        쓴다. 자체 구현인 것은 터널이지 인프라 전부가 아니다.
      */}
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-tertiary-text-color">
        터널 자체는 Cloudflare Tunnel이나 ngrok 같은 외부 서비스에 의존하지 않고 직접 구현했습니다.
        연결이 외부 서비스에 종속되면 셀프호스팅의 의미가 훼손되기 때문입니다.
        도메인 발급과 인증서는 Cloudflare를 사용합니다.
      </p>

      {/*
        여기까지가 기본 상태다 — 방향 비교 그림 하나와 사실 세 줄.
        첫 독해에 필요한 것은 '서버가 먼저 연결하므로 포트를 열지 않는다' 하나뿐이고,
        그 이상은 궁금해진 사람만 열어 보면 된다.
      */}
      <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border-color bg-border-color sm:grid-cols-3">
        {FACTS.map(item => (
          <div key={item.term} className="bg-background-color p-6">
            <dt className="text-xs font-semibold tracking-wide text-tertiary-text-color">{item.term}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-secondary-text-color">{item.desc}</dd>
          </div>
        ))}
      </dl>

      {/*
        상세는 접어 둔다.
        유휴 소켓 풀과 폴백 경로까지 한 번에 펼치면, 포트포워딩을 없애러 온 사람이
        읽어야 할 분량이 두 배가 되고 섹션이 설계 문서처럼 읽힌다. 접는 순간
        이 섹션의 기본 상태는 '주장 하나 + 근거 하나'로 줄어든다.

        details/summary 를 쓰는 이유는 FAQ 와 같다 — 키보드 조작과 상태 안내를
        브라우저가 처리하고, JS 없이도 열린다.
      */}
      <details className="group mt-10 rounded-lg border border-border-color bg-modal-background-color/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-primary-text-color transition-colors hover:text-service-color [&::-webkit-details-marker]:hidden">
          연결 구조 자세히 보기
          <ChevronDown
            className="h-4 w-4 shrink-0 text-tertiary-text-color transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>

        <div className="border-t border-border-color px-6 pb-6 pt-5">
          <h3 className="text-lg font-bold tracking-tight text-primary-text-color">
            요청 하나가 지나가는 길
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-[1.75] text-secondary-text-color">
            Agent는 유휴 소켓을 미리 열어 풀에 확보해 둡니다. 요청이 도착하면 Hub는 라우팅 정보만 제공하고,
            프록시는 풀에서 소켓 하나를 꺼내 요청 바이트를 그대로 전달합니다.
            <strong className="font-semibold text-primary-text-color"> 이 경로에서는 Agent에게 명령이 전달되지 않습니다.</strong>
          </p>

          <div className="mt-6">
            <DiagramFrame>
              <RequestFlow />
            </DiagramFrame>
          </div>
        </div>
      </details>

      <PlainSummary>
        공유기 설정을 변경하지 않아도 서비스가 외부에 공개됩니다.
        서버는 계속 여러분의 소유로 남습니다.
      </PlainSummary>
    </Section>
  )
}
