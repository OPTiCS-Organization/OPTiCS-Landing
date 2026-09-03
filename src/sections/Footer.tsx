import { Github } from 'lucide-react'
import Container from '../components/ui/Container'
import { usePlatformVersionLabel } from '../hooks/usePlatformStats'

/**
 * Footer.
 *
 * 열을 나누되 **실제로 존재하는 링크만** 넣는다. 회사처럼 보이려고 채용·블로그·
 * 개인정보처리방침을 만들어 두면, 누른 사람이 이 페이지에서 처음 확인하는 사실이
 * 404 가 된다. 위에서 "준비 중인 것을 숨기지 않는다"고 해 놓고 여기서 없는 페이지를
 * 링크하면 그 문장까지 같이 무너진다.
 *
 * 그래서 열은 셋이다 — 이 페이지 안, 바깥 자료, 지금 할 일.
 */
const GROUPS = [
  {
    title: '제품',
    links: [
      { label: '작동 방식', href: '/#how-it-works' },
      { label: '왜 OPTiCS인가', href: '/#comparison' },
      { label: '기능', href: '/#features' },
      { label: '구조', href: '/#architecture' },
      { label: '요금', href: '/#pricing' },
    ],
  },
  {
    title: '자료',
    links: [
      { label: '문서', href: 'https://docs.optics.run' },
      { label: 'GitHub', href: 'https://github.com/OPTiCS-Organization' },
      { label: '자주 묻는 것', href: '/#faq' },
      { label: '현재 상태', href: '/#status' },
    ],
  },
  {
    title: '시작하기',
    links: [
      { label: 'Console 열기', href: 'https://console.optics.run' },
      { label: 'Agent 설치', href: '/#install' },
    ],
  },
]

export default function Footer() {
  const versionLabel = usePlatformVersionLabel()

  return (
    <footer className="bg-background-gradation-color">
      <Container width="wide" className="py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="max-w-xs">
            <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-primary-text-color">
              <span className="inline-block h-2 w-2 rounded-full bg-service-color" aria-hidden />
              OPTiCS
            </p>
            {/* 태그라인은 영어로 둔다. 헤드라인과 같은 목소리로 페이지를 닫는다. */}
            <p className="mt-3 text-xs text-secondary-text-color">Your PC. Your Cloud.</p>
            <p className="mt-2 text-xs leading-relaxed text-tertiary-text-color">
              공인 IP 없이, 내 서버에 Docker 서비스를 배포하는 셀프호스팅 플랫폼.
            </p>

            <a
              href="https://github.com/OPTiCS-Organization"
              aria-label="GitHub"
              className="mt-5 inline-flex rounded p-1.5 text-secondary-text-color transition-colors hover:text-primary-text-color"
            >
              <Github className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <nav aria-label="사이트 링크" className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 md:max-w-2xl">
            {GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-2xs font-semibold tracking-wide text-primary-text-color">{group.title}</p>
                <ul className="mt-4 space-y-3">
                  {group.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="rounded text-sm text-secondary-text-color transition-colors hover:text-primary-text-color"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border-color pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xs text-tertiary-text-color">© 2026 OPTiCS by acorn497</p>
          <p className="text-2xs text-tertiary-text-color">
            Own Your PC, Turn it into a Cloud Server.{versionLabel !== null && ` · ${versionLabel}`}
          </p>
        </div>
      </Container>
    </footer>
  )
}
