import { ArrowRight } from 'lucide-react'
import { WORKSPACE_DOMAIN_LIMIT } from '../constants/plan'
import Section from '../components/ui/Section'
import Button from '../components/ui/Button'

/**
 * 랜딩의 요금 자리.
 *
 * 상세 카드는 /pricing 한 곳에만 둔다. 같은 표를 두 군데 그려 두면 반드시 한쪽이 낡는다.
 * 여기서는 "얼마인가"에 대한 답 하나(무료)와 그 값을 믿게 하는 근거 한 줄만 남기고
 * 나머지는 페이지로 넘긴다.
 */
const HIGHLIGHTS = [
  `HTTPS 도메인 ${WORKSPACE_DOMAIN_LIMIT}개`,
  '서비스 배포 무제한',
  'Agent 무제한',
  '카드 등록 없음',
]

export default function PricingBanner() {
  return (
    <Section id="pricing" tone="sunken" space="compact" labelledBy="pricing-banner-title">
      <div className="flex flex-col gap-8 rounded-xl border border-service-color/35 bg-modal-background-color p-8 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="min-w-0">
          <h2 id="pricing-banner-title" className="mt-3 text-2xl font-bold tracking-tight text-primary-text-color sm:text-3xl">
            모든 기능을 무료로 이용할 수 있습니다
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary-text-color">
            연산과 저장은 사용자 서버에서 수행됩니다. OPTiCS는 해당 서버의 연결을 지원합니다.
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {HIGHLIGHTS.map(item => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-tertiary-text-color">
                <span className="inline-block h-1 w-1 rounded-full bg-service-color" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Button href="https://console.optics.run">
            시작하기
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/pricing" variant="secondary">
            요금 자세히 보기
          </Button>
        </div>
      </div>
    </Section>
  )
}
