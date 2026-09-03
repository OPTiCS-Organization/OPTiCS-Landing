import { Activity, KeyRound, RefreshCcw, ScrollText, ShieldCheck, TerminalSquare } from 'lucide-react'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'
import Eyebrow from '../components/ui/Eyebrow'
import Reveal from '../components/ui/Reveal'
import DeployFlow from '../visuals/DeployFlow'
import RoutingMap from '../visuals/RoutingMap'
import OpsPanel from '../visuals/OpsPanel'

/**
 * 기능.
 *
 * 같은 크기 카드 여섯 장이던 것을 이야기 셋으로 바꿨다. 카드 그리드는 훑기에는
 * 좋지만 "그래서 이게 무슨 뜻인데"에 답하지 못한다. 여섯 개가 나란히 있으면
 * 여섯 개 다 같은 무게로 읽히고, 결국 하나도 기억에 남지 않는다.
 *
 * 그래서 방문자가 실제로 겪는 순서대로 셋만 크게 세운다.
 *   ① 올린다  ② 주소가 붙는다  ③ 그 뒤를 지켜본다
 * 나머지는 아래 목록에 그대로 남긴다 — 기능을 지운 게 아니라 무게를 나눈 것이다.
 *
 * 전부 v0.7.1 에서 실제로 동작하는 것만 적는다. 코드에 없는 기능은 넣지 않는다.
 */
type Story = {
  eyebrow: string
  title: string
  body: string
  points: string[]
  visual: React.ReactNode
}

const STORIES: Story[] = [
  {
    eyebrow: '배포',
    title: '저장소 주소 하나로 배포',
    body: 'Git 저장소 URL과 환경변수를 입력하면 클론부터 이미지 빌드, 컨테이너 기동까지 Agent가 처리합니다. 별도의 빌드 서버가 필요하지 않습니다.',
    points: [
      'Dockerfile·docker-compose를 선택합니다.',
      '빌드는 사용자 서버에서 수행됩니다. 소스와 이미지가 외부로 전송되지 않습니다.',
      '재배포도 동일한 버튼 하나로 수행합니다.',
    ],
    visual: <DeployFlow />,
  },
  {
    eyebrow: '네트워크',
    title: '서비스 도메인 자동 생성 및 등록',
    body: '워크스페이스와 서비스마다 HTTPS 서브도메인이 발급됩니다. DNS 레코드는 서비스를 만들 때 생기고 지울 때 정리됩니다.',
    points: [
      '<서비스>.<워크스페이스>.optics.run 형태로 발급됩니다.',
      '인증서 발급과 갱신은 자동입니다.',
      '내 서버에서는 어떤 포트도 개방하지 않습니다.',
    ],
    visual: <RoutingMap />,
  },
  {
    eyebrow: '운영',
    title: '배포 이후의 운영 관리',
    body: 'Console에서 CPU와 메모리를 실시간으로 모니터링할 수 있으며, compose 프로젝트의 컨테이너를 개별적으로 시작하거나 재시작할 수 있습니다.',
    points: [
      '지표는 7일 동안 보관됩니다(Agent측 저장).',
      '빌드 로그와 런타임 로그를 Console에서 실시간으로 확인합니다.',
      '서비스/컨테이너 시작 · 중지 · 재배포 · 삭제를 모두 지원합니다.',
    ],
    visual: <OpsPanel />,
  },
]

/**
 * 이야기로 세우기에는 잘고, 빼기에는 실제로 쓰는 것들.
 * 카드로 감싸지 않고 선 하나로만 나눈다 — 위 세 이야기와 무게가 같아지면
 * 굳이 나눈 의미가 없어진다.
 */
const MORE = [
  { icon: ScrollText, title: '실시간 로그', body: '배포 로그와 런타임 로그를 스트리밍합니다.' },
  { icon: Activity, title: '생명주기 전체', body: '시작 · 중지 · 재배포 · 삭제를 모두 Console에서 수행합니다.' },
  { icon: TerminalSquare, title: 'SSH 웹 터미널', body: '브라우저에서 내 서버 셸에 즉시 접속합니다.' },
  { icon: RefreshCcw, title: 'Agent 원격 업데이트', body: 'Console에서 Agent를 최신 버전으로 갱신합니다.' },
  { icon: ShieldCheck, title: '계정 보호', body: 'JWT 쿠키 인증에 2단계 인증(TOTP)과 이메일 인증을 적용합니다.' },
  { icon: KeyRound, title: '명령 서명', body: 'Hub와 Agent가 주고받는 명령은 HMAC으로 서명합니다.' },
]

function FeatureStory({ story, index }: { story: Story; index: number }) {
  /* 짝수 번째 이야기에서 좌우를 바꾼다. 셋 다 같은 배치면 스크롤이 단조로워진다. */
  const flipped = index % 2 === 1

  return (
    /*
      텍스트 5 : 비주얼 7. 원래 반반(lg:grid-cols-2)이었는데, 이 섹션의 주인은
      다이어그램이지 설명문이 아니다 — 반반이면 글이 다이어그램만큼 넓어져
      다이어그램이 실제보다 작아 보인다. 12열로 쪼개 5:7 로 기운다.
      교차 배치(lg:order-1/2)는 열 번호가 바뀌어도 그대로 유지한다.
    */
    <Reveal className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <div className={`lg:col-span-5 ${flipped ? 'lg:order-2' : ''}`}>
        <Eyebrow>{story.eyebrow}</Eyebrow>

        <h3 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-primary-text-color sm:text-[1.75rem]">
          {story.title}
        </h3>

        <p className="mt-4 max-w-lg text-base leading-[1.75] text-secondary-text-color">
          {story.body}
        </p>

        <ul className="mt-6 space-y-2.5 border-t border-border-color pt-5">
          {story.points.map(point => (
            <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-secondary-text-color">
              <span className="mt-[9px] inline-block h-1 w-1 shrink-0 rounded-full bg-service-color" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className={`lg:col-span-7 ${flipped ? 'lg:order-1' : ''}`}>{story.visual}</div>
    </Reveal>
  )
}

export default function Features() {
  return (
    <Section id="features" space="roomy" labelledBy="features-title">
      <SectionHeading id="features-title" eyebrow="주요 기능" title="배포부터 운영 관리까지 지원합니다">
        <p>
          아래 세 가지는 서비스를 배포한 뒤 반복해서 사용하게 되는 화면입니다.
        </p>
      </SectionHeading>

      <div className="mt-16 space-y-20 sm:space-y-24">
        {STORIES.map((story, index) => (
          <FeatureStory key={story.title} story={story} index={index} />
        ))}
      </div>

      <div className="mt-20 border-t border-border-color pt-12">
        <h3 className="text-sm font-semibold tracking-tight text-primary-text-color">그 밖에</h3>

        <dl className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {MORE.map(item => (
            <div key={item.title}>
              <dt className="flex items-center gap-2 text-sm font-semibold text-primary-text-color">
                <item.icon className="h-4 w-4 shrink-0 text-service-color" aria-hidden />
                {item.title}
              </dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-secondary-text-color">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
