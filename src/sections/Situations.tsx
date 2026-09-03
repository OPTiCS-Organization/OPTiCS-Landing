import { ArrowRight } from 'lucide-react'
import Container from '../components/ui/Container'

/**
 * 상황별 바로가기.
 *
 * 이 페이지는 길다. 그런데 방문자가 가장 먼저 확인하고 싶은 것은 기능 목록이 아니라
 * "이게 내 얘기가 맞나"다. 그 판단을 스크롤 끝까지 미루면, 자기 상황과 무관한
 * 설명을 여덟 번 지나친 뒤에야 관련성을 알게 된다.
 *
 * 그래서 기능이 아니라 **상황**으로 입구를 연다. 세 줄 중 하나에 자기가 있으면
 * 그 자리에서 해당 설명으로 건너뛴다. 없으면 그냥 아래로 계속 읽으면 된다.
 *
 * 도착지가 서로 달라야 한다는 것이 이 컴포넌트의 유일한 제약이다.
 * 두 항목이 같은 앵커로 가면 '고르는 척하는 장식'이 된다. 원래 후보 중
 * '공인 IP가 없다'와 '공유기 설정을 건드리기 싫다'는 결국 같은 섹션(역방향 터널)이
 * 답하는 같은 질문이라 하나로 합쳤고, 남은 자리에 '이미 다른 도구를 쓰는 중'을 넣었다.
 * 그 상황의 답은 비교 섹션에만 있다.
 *
 * 부수 효과 하나 — 비교 섹션은 용어 때문에 역방향 터널 뒤(6번)에 있어야 하는데,
 * 이미 ngrok 을 쓰는 사람은 그 답을 첫 화면 근처에서 원한다. 링크가 그 간극을 메운다.
 * 섹션을 앞으로 당기지 않고도 빠른 길을 내주는 셈이다.
 */
const SITUATIONS = [
  {
    label: '공인 IP도 포트포워딩도 없는 서버',
    target: '#tunnel',
    hint: '연결 방향을 뒤집었습니다',
  },
  {
    label: '이미 Docker가 도는 서버가 있음',
    target: '#how-it-works',
    hint: '세 단계면 끝납니다',
  },
  {
    label: 'ngrok · Cloudflare Tunnel을 쓰는 중',
    target: '#comparison',
    hint: '무엇이 겹치고 무엇이 다른가',
  },
]

export default function Situations() {
  return (
    /*
     * 섹션이 아니라 띠다. Section 프리미티브의 수직 여백을 쓰면 이 자리가
     * '읽어야 할 내용'으로 보이는데, 여기는 지나가면서 훑고 필요하면 누르는 곳이다.
     *
     * 배경은 위(TrustBar, sunken)와 아래(문제, base) 어느 쪽과도 겹치지 않게
     * 한 단계 올린다. 톤이 같으면 띠의 경계가 사라져 앞 섹션의 꼬리로 읽힌다.
     */
    <nav
      aria-label="상황별 바로가기"
      className="border-b border-border-color bg-modal-background-color/50"
    >
      <Container width="wide" className="py-7">
        <p className="text-2xs font-semibold tracking-wide text-tertiary-text-color">
          어느 쪽에 해당하시나요
        </p>

        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {SITUATIONS.map(item => (
            <li key={item.target}>
              <a
                href={item.target}
                className="group flex h-full items-center justify-between gap-3 rounded-md border border-border-color bg-background-color px-4 py-3.5 transition-colors hover:border-service-color/50 hover:bg-surface-hover-color/40"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-primary-text-color">
                    {item.label}
                  </span>
                  {/* 도착지를 미리 알린다. 어디로 가는지 모르는 링크는 누르기 망설여진다. */}
                  <span className="mt-0.5 block text-2xs text-tertiary-text-color">
                    {item.hint}
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4 shrink-0 text-tertiary-text-color transition-colors group-hover:text-service-color"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
