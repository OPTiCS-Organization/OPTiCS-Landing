import { useEffect, useState, type RefObject } from 'react'

/**
 * 모션 감소 설정.
 *
 * 첫 렌더에서 읽는다. useEffect 로 미루면 그 사이 한 프레임 동안 애니메이션이
 * 시작됐다가 멈추는 것이 눈에 띈다(ProductVisual 과 같은 판단).
 */
export function useReducedMotion(): boolean {
  const [reduced] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return reduced
}

/**
 * 요소가 화면 안에 있는가.
 *
 * 이 페이지에는 스스로 움직이는 화면이 넷이다(Hero 데모, 배포·라우팅·모니터링 목업).
 * 전부 동시에 돌면 스크롤 내내 타이머 넷이 살아 있게 된다. 보이지 않는 애니메이션에
 * 배터리를 쓰지 않도록, 각 목업은 이 훅이 true 일 때만 타이머를 건다.
 *
 * Reveal 과 달리 한 번 보고 끝내지 않는다. 지나갔다가 되돌아오면 다시 살아나야
 * '지금 돌고 있는 화면'으로 읽힌다.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.25): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    /* 관찰자가 없는 환경에서는 계속 켜 둔다. 멈춘 화면을 보여주느니 도는 편이 낫다. */
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => setInView(entries[0]?.isIntersecting === true),
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}
