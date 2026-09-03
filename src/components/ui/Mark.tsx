import { useEffect, useRef, useState } from 'react'

/**
 * 형광펜 강조.
 *
 * 문장이 화면에 들어오면 그 안의 중요한 어절에 색 띠가 그어진다.
 * 굵게(strong)와 다른 점은 시선을 '끄는' 게 아니라 '끌고 가는' 것이다 —
 * 왼쪽에서 오른쪽으로 그어지므로 읽는 방향과 속도가 같다.
 *
 * 남용 금지. 한 화면에 두 개가 넘게 그어지면 형광펜을 든 사람이 아무 데나
 * 긋는 것처럼 보이고, 그 순간 강조는 정보가 아니라 장식이 된다.
 * 페이지 전체에서 다섯 곳 안쪽으로 유지한다.
 *
 * 의미는 색이 아니라 문장이 나른다. 이 컴포넌트는 시각 효과일 뿐이라
 * 스크린 리더에게는 아무것도 알리지 않는다(별도 role 이나 aria 를 두지 않는다).
 * 강조가 정말 의미를 바꾼다면 <strong> 을 함께 쓴다.
 */
export default function Mark({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'idle' | 'pending' | 'shown'>('idle')

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    /*
     * 이미 화면 안에 있으면 긋는 장면을 놓친 것이므로 그냥 그어진 채로 둔다.
     * 여기서 숨겼다가 보여주면 첫 화면에서 깜빡임만 생긴다.
     */
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight) return

    setState('pending')

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting !== true) return
        setState('shown')
        observer.disconnect()
      },
      /*
       * 문장 전체가 들어온 뒤에 긋는다. 한 글자만 걸쳐도 시작하면
       * 화면 아래 끝에서 띠가 그어지고, 정작 눈이 닿을 때는 이미 끝나 있다.
       */
      { threshold: 1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={ref}
      className="optics-mark"
      data-mark={state === 'idle' ? undefined : state}
    >
      {children}
    </span>
  )
}
