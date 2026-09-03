import { Check } from 'lucide-react'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'

/**
 * signal 은 그 단계가 끝났을 때 화면에 실제로 나타나는 문구다.
 * 설명을 읽는 것과 "다 되면 이게 보인다"를 아는 것은 다르다. 후자가 있어야
 * 단계가 절차가 아니라 도달점으로 읽힌다.
 *
 * 지어내지 않는다. 셋 다 제품이 실제로 내놓는 문자열이다.
 *   온라인          AgentCard.tsx  STATUS_LABEL.online
 *   Running (3/3)   ServiceDetail  상태 + 컨테이너 수
 *   Dashboard URL   install-agent.sh 가 마지막에 출력한다
 *
 * 세 단계를 같은 크기 카드 세 장으로 두지 않는다. 카드 셋은 '선택지 셋'으로
 * 읽히지만 이건 순서다. 번호를 레일 위에 꿰어 두면 왼쪽에서 오른쪽으로
 * 흘러야 한다는 것이 형태만으로 전달된다.
 */
/**
 * 용어는 이 목록 한 곳에서만 설명한다.
 *
 * 페이지 전체에서 같은 것을 '에이전트', '대상 서버', '콘솔'처럼 매번 다르게 부르면
 * 방문자는 그것들이 서로 다른 무언가라고 읽는다. 이름을 넷으로 고정하고, 뜻은
 * 여기서 한 번만 밝힌다. 이 섹션이 제품을 처음으로 절차와 함께 소개하는 자리라
 * 정의가 필요한 지점도 여기다 — 이 앞의 섹션들은 구성요소 이름 없이 쓰여 있다.
 */
const TERMS = [
  { name: 'Agent', body: '사용자 서버에 설치되어 Docker를 관리하는 컨테이너입니다.' },
  { name: 'Agent Dashboard', body: '사용자 서버에서 열 수 있는 모니터링 화면입니다.' },
  { name: 'Console', body: '웹에서 사용할 수 있는 관리 화면입니다.' },
  { name: 'Hub', body: 'OPTiCS가 운영하는 중계 서버입니다.' },
]

const STEPS = [
  {
    no: '01',
    title: '설치',
    body: 'Agent를 설치할 호스트에서 스크립트를 실행합니다. Docker가 설치되어 있지 않으면 자동으로 설치됩니다.',
    detail: 'sh install-agent.sh',
    signal: 'Agent Dashboard가 열립니다',
  },
  {
    no: '02',
    title: '페어링',
    body: 'Agent Dashboard에 표시된 코드를 Console의 Workspace/Agent 화면에 입력합니다.',
    detail: 'WORD-WORD 형식의 코드',
    signal: '워크스페이스에 “연결 대기중”으로 표시',
  },
  {
    no: '03',
    title: 'Service 배포',
    body: 'Git 저장소 URL과 환경변수를 입력하고 배포를 실행합니다. 클론·빌드·컨테이너 시작은 Agent가 자동으로 처리합니다.',
    detail: 'Dockerfile 또는 docker-compose 모드',
    signal: 'Running (3/3)',
  },
]

export default function HowItWorks() {
  return (
    <Section id="how-it-works" tone="raised" labelledBy="how-it-works-title">
      <SectionHeading id="how-it-works-title" eyebrow="이용 방법" title="세 단계로 서비스를 배포할 수 있습니다">
        <p>
          설치부터 첫 서비스 실행까지, 서버 외부 설정을 준비할 필요가 없습니다.
        </p>
      </SectionHeading>

      {/*
        절차보다 앞에 둔다. 이름을 모르는 채로 단계를 읽으면 매 문장에서 멈추게 된다.
        네 항목뿐이라 상자 하나로 충분하고, 카드로 키우면 이 섹션의 주인공인
        세 단계보다 무거워진다.
      */}
      <dl className="mt-10 grid gap-x-8 gap-y-4 rounded-lg border border-border-color bg-modal-box-color px-6 py-5 sm:grid-cols-2">
        {TERMS.map(term => (
          <div key={term.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-mono text-2xs font-semibold text-service-color sm:w-36 sm:pt-px">
              {term.name}
            </dt>
            <dd className="text-sm text-secondary-text-color">{term.body}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          /*
            본문 길이가 단계마다 달라서, 그냥 두면 아래 신호 상자가 세 열에서
            제각각의 높이에 걸린다. 열을 늘려 잡고(flex) 상자를 바닥으로 밀어
            (mt-auto) 세 개의 밑변을 맞춘다.
          */
          <li key={step.no} className="relative flex flex-col">
            {/*
              단계를 잇는 레일. 열 사이 간격(gap-8 = 2rem)까지 건너가도록
              오른쪽을 음수로 뺀다. 마지막 단계 뒤에는 그리지 않는다 —
              선이 허공으로 이어지면 아직 뭔가 더 있는 것처럼 읽힌다.
            */}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-11 -right-8 top-[18px] hidden h-px bg-border-color md:block"
              />
            )}

            <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-strong-color bg-modal-box-color font-mono text-2xs font-semibold text-service-color">
              {step.no}
            </span>

            {/* 글 블록이 남는 높이를 흡수한다. 그래야 아래 상자의 윗변이 세 열에서 맞는다. */}
            <div className="flex-1">
              <h3 className="mt-5 text-lg font-bold tracking-tight text-primary-text-color">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-secondary-text-color">{step.body}</p>
            </div>

            {/*
              성공 신호를 명령어보다 위, 더 밝게 둔다. 명령어는 '무엇을 치는가'라
              아직 시작도 안 한 방문자에게는 부담이고, 신호는 '어디에 도착하는가'다.
              다만 명령어를 지우지는 않는다 — 구체성이 이 섹션의 신뢰를 지탱한다.
            */}
            <div className="mt-5 rounded-md border border-border-color bg-modal-box-color px-4 py-3.5">
              <p className="flex items-start gap-1.5 text-sm font-medium text-success-color">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {step.signal}
              </p>
              <p className="mt-2 font-mono text-2xs text-tertiary-text-color">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-tertiary-text-color">
        코드를 입력해도 즉시 연결되지 않습니다. Agent Dashboard에 연결 요청이 표시되고, 이를 수락해야 연결이 성립합니다.
      </p>
    </Section>
  )
}
