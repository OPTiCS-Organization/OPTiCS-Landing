import { useEffect, useState } from 'react'
import { Github, Menu, X } from 'lucide-react'
import Button from './ui/Button'

/**
 * 상단 고정 내비게이션.
 *
 * 문구는 한국어로 둔다. 영어는 헤드라인과 데모 화면 안쪽까지다.
 * 내비게이션은 읽고 판단하는 자리라 모국어가 빠르다.
 *
 * 항목은 페이지에 실제로 있는 것만 넣는다. 없는 메뉴를 만들어 큰 회사처럼
 * 보이게 하는 순간, 누른 사람이 첫 번째로 발견하는 사실이 '이 페이지는 거짓말을
 * 한다'가 된다.
 *
 * 좁은 화면 처리:
 * 이전에는 앵커를 sm 미만에서 그냥 숨겼다. 모바일 방문자에게는 기능도 요금도
 * 존재하지 않는 페이지가 됐다는 뜻이다. 항목이 다섯(하위 페이지에서는 여섯)이라
 * 접는 메뉴를 둘 값이 된다. 펼치는 기준이 lg 인 것도 그래서다 — md 에서는
 * 항목과 오른쪽 버튼이 서로를 밀어낸다.
 */
const LINKS = [
  { label: '작동 방식', href: '/#how-it-works' },
  { label: '기능', href: '/#features' },
  { label: '구조', href: '/#architecture' },
  { label: '요금', href: '/#pricing' },
  { label: '문서', href: 'https://docs.optics.run' },
]

export default function NavBar({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(false)
  /*
   * 맨 위에서는 헤더에 선도 그림자도 두지 않는다. Hero 의 그라데이션이
   * 화면 꼭대기부터 이어져야 페이지가 헤더 아래에서 시작하지 않는다.
   * 스크롤이 시작되면 그때 경계를 만들어 본문과 헤더를 분리한다.
   */
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /*
   * 열린 메뉴는 Escape 로 닫힌다. 백드롭은 두지 않는다 — 메뉴가 화면을 덮지 않고
   * 헤더 아래에 붙어 있어서, 본문을 누르면 그 요소가 눌리는 편이 자연스럽다.
   * 항목을 누를 때도 닫는다(아래 onClick).
   */
  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled || open
          ? 'border-b border-border-color bg-background-gradation-color/85 backdrop-blur-md'
          : 'border-b border-transparent bg-background-gradation-color/40 backdrop-blur-sm'
      }`}
    >
      <nav aria-label="주요" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 rounded text-base font-bold tracking-tight text-primary-text-color"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-service-color" aria-hidden />
          OPTiCS
        </a>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {home && (
            <a
              href="/"
              className="rounded px-3 py-1.5 text-sm font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
            >
              홈
            </a>
          )}

          {LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="rounded px-3 py-1.5 text-sm font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/*
            GitHub 은 아이콘만 둔다. 오픈소스라는 사실은 알려야 하지만,
            글자로 두면 로그인과 같은 무게가 돼 무엇을 눌러야 할지 흐려진다.
          */}
          <a
            href="https://github.com/OPTiCS-Organization"
            aria-label="GitHub"
            className="rounded p-2 text-secondary-text-color transition-colors hover:text-primary-text-color"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>

          <a
            href="https://console.optics.run"
            className="hidden rounded px-3 py-1.5 text-sm font-medium text-secondary-text-color transition-colors hover:text-primary-text-color sm:block"
          >
            로그인
          </a>

          {/*
            바깥에서 display 를 덮지 않는다. Button 이 자기 클래스에 inline-flex 를
            들고 있어서 hidden 을 나중에 붙여도 이기지 못한다(우선순위가 같아
            스타일시트 순서가 결정한다). 감추는 일은 감싸는 요소가 맡는다.
          */}
          <div className="ml-1 hidden sm:block">
            <Button href="https://console.optics.run" size="sm">
              시작하기
            </Button>
          </div>

          {/* 좁은 화면에서만 나오는 접힘 메뉴 토글 */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setOpen(previous => !previous)}
            className="ml-1 rounded p-2 text-secondary-text-color transition-colors hover:text-primary-text-color lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {/*
        접힘 메뉴. 화면을 덮지 않고 헤더 아래로 펼친다.
        전체 화면 오버레이는 항목이 이만큼일 때 과하다 — 닫는 법을 한 번 더 배워야 한다.
      */}
      {open && (
        <div id="nav-menu" className="border-t border-border-color bg-background-gradation-color lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {home && (
              <a
                href="/"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-3 text-sm font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
              >
                홈
              </a>
            )}

            {LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded border-t border-border-color/60 px-2 py-3 text-sm font-medium text-secondary-text-color transition-colors first:border-t-0 hover:text-primary-text-color"
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://console.optics.run"
              className="rounded border-t border-border-color/60 px-2 py-3 text-sm font-medium text-secondary-text-color transition-colors hover:text-primary-text-color sm:hidden"
            >
              로그인
            </a>

            <div className="my-3 sm:hidden">
              <Button href="https://console.optics.run" className="w-full">
                시작하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
