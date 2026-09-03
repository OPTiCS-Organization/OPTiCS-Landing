import Mark from '../components/ui/Mark'
import { ArrowRight, Check, X } from 'lucide-react'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'

/**
 * 문제 → 해법.
 *
 * 목록 두 개를 나란히 놓는 것만으로 이 섹션의 논증이 끝난다. 왼쪽 네 줄은
 * 전부 '서버 바깥'을 고치는 방법이고, 오른쪽 네 줄에는 서버 바깥이 없다.
 *
 * 두 열의 무게를 일부러 다르게 준다. 왼쪽은 가라앉은 배경에 흐린 글씨,
 * 오른쪽은 한 단계 뜬 표면에 액센트 테두리다. 같은 카드 두 장으로 그리면
 * '선택지 여덟 개'로 읽히고, 어느 쪽이 답인지 방문자가 판단해야 한다.
 */

/** 기존 선택지와 각각이 요구하는 대가. 전부 '서버 밖'을 건드려야 한다는 공통점이 있다. */
const OLD_OPTIONS = [
  { name: '공인 IP 구매', cost: '매달 발생하는 비용' },
  { name: '포트포워딩', cost: '공유기 설정과 열린 포트' },
  { name: 'VPN 구축', cost: '또 하나의 운영 대상' },
  { name: '외부 터널 서비스', cost: '외부 인프라에 대한 의존' },
]

/**
 * 네 줄 모두 v0.7.1 에서 실제로 일어나는 일이다.
 * 아래 섹션들이 각각을 증명한다 — 연결은 역방향 터널, 배포는 동작 흐름,
 * 주소는 기능 섹션의 라우팅, 실행은 구조 섹션.
 */
const NEW_STEPS = [
  { name: '연결', body: '사용자 서버가 외부로 먼저 연결합니다. 공유기 설정은 변경하지 않습니다.' },
  { name: '배포', body: 'Git 저장소 URL을 입력하면 클론·빌드·기동까지 진행합니다.' },
  { name: '주소', body: '서비스마다 HTTPS 서브도메인이 자동으로 발급됩니다.' },
  { name: '실행', body: '컨테이너와 데이터는 사용자 서버에 유지됩니다.' },
]

export default function Problem() {
  return (
    <Section id="problem" labelledBy="problem-title">
      <SectionHeading id="problem-title" eyebrow="왜 필요한가" title="서버는 있지만 외부에서 접근할 수 없습니다">
        <p>
          가정에 유휴 상태로 있는 컴퓨터, 사내망 안의 장비. 성능은 충분하지만 배포하려면
          매번 서버 외부의 무언가를 변경해야 했습니다.
        </p>
      </SectionHeading>

      <div className="relative mt-14 grid gap-6 md:grid-cols-2 md:gap-10">
        {/* 왼쪽 — 지금까지 */}
        <div className="rounded-lg border border-border-color bg-background-gradation-color p-6 sm:p-7">
          <p className="text-xs font-semibold tracking-wide text-tertiary-text-color">지금까지</p>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-secondary-text-color">
            서버 외부 설정 변경
          </h3>

          <ul className="mt-6 space-y-px overflow-hidden rounded-md">
            {OLD_OPTIONS.map(option => (
              <li key={option.name} className="flex items-start gap-3 bg-background-color/60 px-4 py-3.5">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-danger-color/80" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-secondary-text-color">{option.name}</p>
                  <p className="mt-0.5 text-xs text-tertiary-text-color">{option.cost}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/*
          가운데 화살표. 두 열 사이에 겹쳐 둔다.
          좁은 화면에서는 열이 위아래로 쌓이므로 감춘다 — 옆을 가리키는 화살표가
          아래로 쌓인 흐름 위에 남으면 방향이 거짓말이 된다.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong-color bg-background-color text-service-color">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        {/* 오른쪽 — OPTiCS */}
        <div className="rounded-lg border border-service-color/35 bg-modal-background-color p-6 sm:p-7">
          <p className="text-xs font-semibold tracking-wide text-service-color">OPTiCS</p>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-primary-text-color">
            서버 내부에서 처리
          </h3>

          <ul className="mt-6 space-y-4">
            {NEW_STEPS.map(step => (
              <li key={step.name} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-service-color" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary-text-color">{step.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-secondary-text-color">{step.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-base leading-[1.75] text-secondary-text-color">
        {/* '왼쪽'이라고 쓰지 않는다. 좁은 화면에서는 두 열이 위아래로 쌓여 방향이 틀린 말이 된다. */}
        기존의 네 가지 방식은 모두 <strong className="font-semibold text-primary-text-color"><Mark>서버 외부</Mark></strong> 설정을 변경하여
        문제를 해결합니다. OPTiCS는 이러한 외부 설정 변경 없이 서비스를 운영할 수 있도록 지원합니다.
      </p>
    </Section>
  )
}
