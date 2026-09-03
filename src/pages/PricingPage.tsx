import { ArrowRight } from 'lucide-react'
import NavBar from '../components/NavBar'
import Pricing from '../sections/Pricing'
import PricingFaq from '../sections/PricingFaq'
import Footer from '../sections/Footer'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

/**
 * /pricing.
 *
 * 랜딩의 요금 섹션을 그대로 재사용하고 FAQ를 덧붙인다. 같은 카드를 두 번 그리지 않으려면
 * 컴포넌트를 공유해야 한다. 요금 항목이 바뀔 때 한 곳만 고치면 양쪽이 따라온다.
 */
export default function PricingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-service-color focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent-color"
      >
        본문으로 건너뛰기
      </a>

      <NavBar home />

      <main id="main">
        <Pricing />
        <PricingFaq />

        <section aria-labelledby="pricing-cta-title" className="bg-background-color">
          <Container width="narrow" className="py-20 text-center">
            <h2 id="pricing-cta-title" className="text-2xl font-bold tracking-tight text-primary-text-color sm:text-3xl">
              별도의 비용 없이 이용할 수 있습니다
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-secondary-text-color">
              계정 생성과 Agent 설치를 완료한 후 서비스를 이용할 수 있습니다.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button href="https://console.optics.run">
                시작하기
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/#architecture" variant="secondary">
                작동 방식 보기
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
