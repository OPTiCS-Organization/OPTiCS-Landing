import { Check, Circle, ArrowUpRight } from 'lucide-react'
import { usePlatformVersion } from '../hooks/usePlatformStats'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'

/**
 * 현재 상태.
 *
 * 이 섹션을 빼지 않는다. 준비 중인 것을 적어 두면 잃는 것은 '완성된 제품'이라는
 * 인상 하나지만, 얻는 것은 나머지 목록 전부에 대한 신뢰다. 다 됐다고 적힌
 * 페이지에서 안 되는 기능을 하나 발견하면 그때부터는 전부 의심하게 된다.
 */
const DONE = [
  'Agent 설치와 코드 기반 페어링',
  '서비스 배포 · 시작 · 중지 · 재배포 · 삭제',
  '컨테이너 단위 시작 · 중지 · 재시작',
  '실시간 배포/런타임 로그 스트리밍',
  'CPU · 메모리 모니터링 (7일 보존)',
  '워크스페이스 · 서비스 서브도메인',
  'SSH 웹 터미널',
  'Agent 원격 업데이트',
  '2단계 인증(TOTP) · 이메일 인증',
]

/**
 * 준비 중인 것들을 성격별로 묶는다. "언제"는 이 저장소 어디에도 정해진 값이
 * 없으므로 지어내지 않는다 — 대신 무엇이 남았는지를 더 또렷하게 나눠서
 * 기대치를 세운다.
 */
const PENDING_GROUPS = [
  {
    label: 'Console 화면',
    items: ['Dashboard · Overview 페이지', 'Users · Activity 페이지'],
  },
  {
    label: '명령·스크립트',
    items: ['배포 중단(ABORT) 명령', 'Windows용 제거 스크립트'],
  },
  {
    label: '팀 기능',
    items: ['팀 구성원 초대 · 권한'],
  },
]
const PENDING_COUNT = PENDING_GROUPS.reduce((sum, group) => sum + group.items.length, 0)

export default function Status() {
  const versionLabel = usePlatformVersion()

  return (
    <Section id="status" tone="sunken" labelledBy="status-title">
      <SectionHeading id="status-title" eyebrow="현재 상태" title="어디까지 구현했고, 무엇이 남았는지">
        {/*
          버전을 Hub 에서 받는다. 못 받았으면 이 문장 자체를 내린다 — 아래 두 목록(동작합니다 /
          준비 중입니다)이 이 섹션의 본체라 버전 한 줄이 빠져도 섹션은 그대로 성립한다.
          예전 값을 폴백으로 두지 않는 이유는, 그 폴백이 낡은 채 남아 페이지가 틀린 버전을
          주장하게 되는 것이 바로 이번에 없앤 문제이기 때문이다.
        */}
        {versionLabel !== null && (
          <p>
            현재 OPTiCS 버전은 <span className="font-mono text-primary-text-color">{versionLabel}</span> 입니다.
          </p>
        )}
      </SectionHeading>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border-color bg-modal-background-color p-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-border-color pb-3">
            <h3 className="text-sm font-bold tracking-tight text-primary-text-color">동작합니다</h3>
            <span className="font-mono text-2xs text-success-color">{DONE.length}</span>
          </div>

          <ul className="mt-4 space-y-2.5">
            {DONE.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-secondary-text-color">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-color" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border-color bg-modal-background-color/40 p-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-border-color pb-3">
            <h3 className="text-sm font-bold tracking-tight text-primary-text-color">준비 중입니다</h3>
            <span className="font-mono text-2xs text-tertiary-text-color">{PENDING_COUNT}</span>
          </div>

          <div className="mt-4 space-y-5">
            {PENDING_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold tracking-wide text-tertiary-text-color">{group.label}</p>
                <ul className="mt-2 space-y-2.5">
                  {group.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-tertiary-text-color">
                      <Circle className="mt-1 h-3 w-3 shrink-0" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-tertiary-text-color">
        완료 시기는 약속하지 않습니다. 진행 상황은{' '}
        <a
          href="https://github.com/OPTiCS-Organization"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
        >
          GitHub에서
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>{' '}
        확인할 수 있습니다.
      </p>
    </Section>
  )
}
