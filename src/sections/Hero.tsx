import { ArrowRight } from 'lucide-react'
import ProductVisual from '../components/ProductVisual'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { usePlatformVersionLabel } from '../hooks/usePlatformStats'

/**
 * Hero.
 *
 * 헤드라인은 두 박자로 끊는다 — 소유("Own Your PC...")를 먼저 세우고,
 * 그 아래에서 조건을 없앤다("No public IP required."). 순서가 바뀌면
 * 제약 해소가 먼저 나와 무엇에 대한 이야기인지 알 수 없어진다.
 *
 * 언어:
 * 영어는 헤드라인 두 줄과 데모 화면 안쪽까지다. 그 아래 설명·버튼·내비게이션은
 * 전부 한국어로 둔다. 헤드라인은 소리내어 읽히는 자리라 짧고 리듬이 있는 영어가
 * 힘을 받지만, 판단하고 누르는 자리에서는 모국어가 빠르다. 헤드라인 블록 안에서
 * 언어를 섞지 않는 것도 규칙이다 — 두 줄이 한 덩어리로 읽혀야 한다.
 *
 * 수직 리듬 주의:
 * 헤드라인 → 콘솔 화면까지가 한 호흡으로 읽혀야 한다. 블록 사이를 넉넉하게 벌리면
 * 위쪽이 '텍스트만 덩그러니' 남은 것처럼 비어 보인다. 그래서 텍스트 블록 내부는
 * 촘촘히 묶고, 콘솔 앞에서만 한 번 크게 띄운다.
 *
 * 첫 화면이 답해야 하는 것:
 *   무엇인가        → 배지 '셀프호스팅 배포 플랫폼'
 *   무엇을 얻는가    → 헤드라인
 *   왜 되는가       → 'No public IP required.' + 본문 한 문장
 *   지금 뭘 하나     → CTA 둘
 *   진짜 되는가      → 아래 데모가 9.5초 만에 증명한다
 */

/**
 * CTA 아래 한 줄. 누르기 직전에 남는 망설임을 없애는 자리다.
 * 셋 다 검증 가능한 사실이고, 하나(서버 준비)는 우리에게 불리한 조건이지만 그대로 쓴다.
 * 가입한 뒤에 알게 되는 조건이 하나라도 있으면 나머지 두 개도 의심받는다.
 */
const ASSURANCES = ['카드 등록 없음', '오픈소스', 'Docker 서버 한 대로 시작']

export default function Hero() {
  const versionLabel = usePlatformVersionLabel()

  return (
    <section className="relative overflow-hidden border-b border-border-color bg-gradient-to-b from-background-gradation-color to-background-color">
      {/*
        헤드라인 뒤에 아주 옅은 액센트 광원 하나. 브랜드 색이 페이지에서 처음
        등장하는 자리를 만들어 주되, 글자 대비를 건드리지 않을 만큼만 깔린다.
        움직이지 않는다 — 계속 도는 배경은 읽는 것을 방해한다.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.16] [background:radial-gradient(60%_100%_at_50%_0%,var(--color-service-color),transparent_70%)]"
      />

      <Container width="wide" className="relative pb-16 pt-12 sm:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          {/*
            상단 여백을 빈 공간이 아니라 정보로 채운다.
            버전을 함께 노출해 '지금 살아 있는 제품'이라는 신호를 준다.
          */}
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-border-color bg-modal-background-color/60 px-3.5 py-1.5 text-2xs font-medium text-secondary-text-color backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-service-color" aria-hidden />
            셀프호스팅 배포 플랫폼
            {/* 못 받아왔으면 이 조각만 빠진다. 배지 자체는 버전 없이도 성립한다. */}
            {versionLabel !== null && <span className="text-tertiary-text-color">{versionLabel}</span>}
          </p>

          {/*
            모바일에서 48px(text-5xl)로 두면 'Turn it into a Cloud Server.' 가
            세 줄로 접히면서 첫 화면을 헤드라인 혼자 다 먹는다. 한 단계 낮춰
            아래 문장과 CTA 까지 한 화면에 들어오게 한다.
          */}
          <h1 className="text-[2.6rem] font-bold leading-[1.08] tracking-tight text-primary-text-color sm:text-6xl lg:text-7xl">
            Own Your PC,
            <br />
            Turn it into a Cloud Server.
          </h1>

          <p className="mt-5 text-lg font-medium text-service-color sm:mt-6 sm:text-2xl">
            No public IP required.
          </p>

          {/*
            Hero 에서 두 번째로 중요한 정보다. 본문보다 한 단계 크고 밝게 둔다.
            '왜 가능한가'는 아래 역방향 터널 섹션이 통째로 설명하므로 여기서는 결론만 말한다.
          */}
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-[1.7] text-primary-text-color/85">
            Git 저장소 URL 하나로 사용자 서버에 배포할 수 있습니다.
            <br className="hidden sm:block" />
            {' '}포트 포워딩과 공인 IP가 필요하지 않습니다.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button href="https://console.optics.run">
              서비스 배포 시작
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>

            <Button href="https://docs.optics.run" variant="secondary">
              문서 보기
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-2xs text-tertiary-text-color">
            {ASSURANCES.map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-border-strong-color" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/*
          텍스트 블록(max-w-5xl)보다 한 단계만 넓게 둔다. 바깥 컨테이너의
          max-w-7xl 을 그대로 쓰면 폭 차이가 커서 헤드라인과 화면이 따로 논다.

          리뷰 4건 전원이 "제품 화면이 작다"고 지적해 헤드라인·데모를 함께 한 단계씩
          올렸다(4xl→5xl, 5xl→6xl) — 데모만 키우면 위 텍스트 블록과 비례가 깨진다.
          다만 ProductVisual 내부 데모 프레임 높이(h-[26rem])는 고정값이라 폭만 커진
          만큼 세로 대비 가로 비율이 이전보다 더 납작해진다(약 2.3:1 → 2.6:1대).
          ProductVisual.tsx 는 1200줄짜리 애니메이션이라 손대지 않기로 했고, 이 래퍼
          에는 높이를 보정할 수단이 없다 — 프레임 자체의 높이 조정은 후속 작업으로 남긴다.
        */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-14">
          <ProductVisual />
        </div>
      </Container>
    </section>
  )
}
