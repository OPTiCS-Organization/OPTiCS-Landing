import { useLayoutEffect, useRef, useState } from 'react'

/**
 * 스크롤 진입 시 한 번 떠오르는 블록.
 *
 * 애니메이션의 목적은 장식이 아니라 순서다. 섹션 안에서 무엇을 먼저 읽어야
 * 하는지를 0.1초 간격의 지연으로 말해 준다. 그래서 delay 는 '두 번째 블록'
 * 정도의 얕은 계단까지만 쓰고, 카드 하나하나에 계단을 주지 않는다.
 * 여덟 장이 차례로 나타나는 화면은 정보가 아니라 대기 시간이다.
 *
 * 되돌아가지 않는다. 위로 스크롤할 때 다시 사라지면 페이지가 불안정해 보인다.
 * 한 번 나타난 요소는 관찰을 끊고 그대로 둔다.
 *
 * JS 가 없거나 IntersectionObserver 가 없으면 처음부터 보이는 상태다.
 * 마운트된 뒤에야 pending 을 걸기 때문이다(index.css 의 data-reveal 규칙 참조).
 */
type Props = {
  /** ms. 같은 흐름 안에서 순서를 만들 때만 쓴다. 200 을 넘기지 않는다. */
  delay?: number
  className?: string
  children: React.ReactNode
}

export default function Reveal({ delay = 0, className = '', children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  /*
   * 관찰자를 붙일 수 있는지 확인되기 전까지는 숨기지 않는다.
   * 첫 렌더에서 곧바로 pending 을 걸면, 관찰자가 없는 환경에서 내용이 영영 안 보인다.
   */
  const [armed, setArmed] = useState(false)

  /*
   * useEffect 가 아니라 useLayoutEffect 다. 효과가 그리기 뒤에 돌면 요소가 한 프레임
   * 보였다가 숨는 깜빡임이 생긴다. 숨기는 결정은 화면에 나가기 전에 끝나야 한다.
   */
  useLayoutEffect(() => {
    const element = ref.current
    if (element === null) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') return

    /*
     * 이미 화면 안에 있으면(첫 화면 근처) 숨겼다가 보이는 깜빡임이 생긴다.
     * 그 경우엔 애니메이션 없이 그대로 둔다.
     */
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight) return

    setArmed(true)

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting !== true) return
        setShown(true)
        observer.disconnect()
      },
      /* 아래에서 12% 쯤 들어왔을 때. 완전히 들어온 뒤에 뜨면 이미 읽던 중이라 늦다. */
      { threshold: 0.12 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal={armed ? (shown ? 'shown' : 'pending') : undefined}
      style={shown && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  )
}
