import { ArrowRight, Github } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { usePlatformVersionLabel } from '../hooks/usePlatformStats'

/**
 * 마지막 섹션.
 *
 * 여기까지 읽은 사람은 이미 무엇인지 알고 있다. 그러니 설명을 되풀이하지 않고
 * 소유권 한 가지만 다시 말하고 끝낸다. 페이지 전체가 기술로 설득했으니
 * 마지막 한 번은 감각으로 닫는다.
 *
 * 헤드라인만 영어다. Hero 와 같은 규칙이고, 페이지의 처음과 끝을 같은 목소리로
 * 맞추는 편이 한 편의 글처럼 읽힌다.
 *
 * 세 줄은 새로운 주장이 아니라 위에서 이미 증명한 것의 요약이다.
 * 여기서 처음 꺼내는 사실이 있으면 근거 없는 문장이 된다.
 */
const OWNERSHIP = [
  { term: '빌린 서버', value: '없음' },
  { term: '공인 IP', value: '필요 없음' },
  { term: '하드웨어와 데이터', value: '전부 사용자 소유' },
]

export default function Closing() {
  const versionLabel = usePlatformVersionLabel()

  return (
    <section aria-labelledby="closing-title" className="relative overflow-hidden border-b border-border-color bg-background-color">
      {/*
        Hero 의 광원을 아래에서 한 번 더. 페이지의 처음과 끝에만 두어
        긴 스크롤의 양 끝을 같은 빛으로 묶는다. 중간에는 쓰지 않는다.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px] opacity-[0.13] [background:radial-gradient(55%_100%_at_50%_100%,var(--color-service-color),transparent_70%)]"
      />

      <Container width="narrow" className="relative py-24 text-center sm:py-32">
        <h2 id="closing-title" className="text-[2rem] font-bold leading-[1.15] tracking-tight text-primary-text-color sm:text-5xl">
          Your hardware is already
          <br />
          powerful enough.
        </h2>

        <p className="mt-6 text-lg font-medium text-service-color sm:text-xl">
          Turn it into your cloud.
        </p>

        {/*
          세 항목은 카드가 아니라 한 줄짜리 정의 목록이다.
          마지막 섹션에 카드를 또 깔면 여기가 끝이라는 신호가 사라진다.
        */}
        <dl className="mx-auto mt-12 flex max-w-lg flex-col divide-y divide-border-color border-y border-border-color text-left">
          {OWNERSHIP.map(item => (
            <div key={item.term} className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="text-sm text-tertiary-text-color">{item.term}</dt>
              <dd className="text-sm font-medium text-primary-text-color">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button href="https://console.optics.run">
          서비스 배포 시작
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="https://github.com/OPTiCS-Organization" variant="secondary">
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </Button>
        </div>

        <p className="mt-8 text-xs text-tertiary-text-color">
          오픈소스 · 셀프호스팅{versionLabel !== null && ` · ${versionLabel}`}
        </p>
      </Container>
    </section>
  )
}
