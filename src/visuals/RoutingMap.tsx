import { useEffect, useRef, useState } from 'react'
import { Check, Loader, Lock } from 'lucide-react'
import { useInView, useReducedMotion } from '../hooks/useInView'

/**
 * 기능 ② 주소가 붙는 방식.
 *
 * 배포가 끝나는 순간부터 주소가 살아나기까지를 재연한다. 표를 정지 화면으로 두면
 * '이런 주소가 생긴다'까지만 전달되는데, 방문자가 실제로 궁금해하는 것은
 * "내가 아무것도 안 했는데 언제 어떻게 저 주소가 열리느냐"다. 그 순서를 보여준다.
 *
 *   배포 완료 → DNS 레코드 생성 → 서비스마다 주소 활성 → HTTPS 확인
 *
 * 주소 규칙은 실제 구현 그대로다. <서비스>.<워크스페이스>.optics.run 이고,
 * Cloudflare 에는 *.<워크스페이스>.optics.run 와일드카드 레코드가 생성된다
 * (cloudflare.util.ts). 여기 적힌 형태가 곧 그 규칙이다.
 *
 * 자물쇠는 마지막에야 켠다. 주소가 활성화되기도 전에 인증서가 확인된 것처럼
 * 보이면 거짓말이다(Hero 데모의 주소창과 같은 규칙).
 */
const ROUTES = [
  { host: 'blog.homelab', service: 'my-blog', port: ':3000' },
  { host: 'api.homelab', service: 'todo-api', port: ':8080' },
  { host: 'portfolio.homelab', service: 'portfolio', port: ':80' },
]

/**
 * 단계.
 *   0        배포 중
 *   1        배포 완료 · DNS 레코드 생성
 *   2·3·4    주소가 하나씩 활성화
 *   5        전부 활성 + 자물쇠. 잠시 머물렀다 처음으로
 */
const LAST = ROUTES.length + 2

/**
 * 단계별 체류 시간. 주소가 켜지는 세 단계는 서로 이어지는 한 동작이라 짧게 붙이고,
 * 배포 중 · 완료 · 인증서에는 읽을 시간을 준다. 한 바퀴 약 9초 — 옆 본문을 읽는
 * 동안 사이클이 통째로 지나가 버리지 않을 만큼은 느려야 한다.
 */
const HOLD = [2200, 1300, 760, 760, 760, 3200]

export default function RoutingMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const active = useInView(containerRef) && !reduced

  const [step, setStep] = useState(reduced ? LAST : 0)

  useEffect(() => {
    if (!active) return

    const id = window.setTimeout(
      () => setStep(previous => (previous >= LAST ? 0 : previous + 1)),
      HOLD[step] ?? 1300,
    )
    return () => window.clearTimeout(id)
  }, [active, step])

  const deployed = step >= 1
  const secured = step >= LAST

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="overflow-hidden rounded-lg border border-border-color bg-modal-background-color"
    >
      {/* 브라우저가 보는 주소 */}
      <div className="border-b border-border-color bg-background-gradation-color px-5 py-4">
        <div
          className={`flex items-center gap-2 rounded border px-3 py-2 font-mono text-2xs transition-colors duration-500 ${
            secured ? 'border-service-color/40 bg-background-color' : 'border-border-color bg-background-color'
          }`}
        >
          <Lock
            className={`h-3 w-3 shrink-0 transition-colors duration-500 ${
              secured ? 'text-success-color' : 'text-tertiary-text-color/40'
            }`}
          />
          <span
            className={`truncate transition-colors duration-500 ${
              secured ? 'text-primary-text-color' : 'text-tertiary-text-color/60'
            }`}
          >
            blog.homelab.optics.run
          </span>
        </div>

        {/*
          안내 문구가 단계에 따라 바뀐다. 높이가 변하지 않도록 한 줄로 고정한다 —
          두 줄이 됐다 말았다 하면 아래 표가 위아래로 흔들린다.
        */}
        <p className="mt-2.5 flex items-center gap-1.5 truncate text-3xs">
          {!deployed ? (
            <>
              <Loader className="h-3 w-3 shrink-0 animate-spin text-service-color [animation-duration:1.2s]" />
              <span className="text-tertiary-text-color">배포 중…</span>
            </>
          ) : (
            <>
              <Check className="h-3 w-3 shrink-0 text-success-color" />
              <span className="text-secondary-text-color">
                {secured ? '인증서 발급 완료 · 자동으로 갱신됩니다' : '배포 완료 — DNS 레코드를 생성했습니다'}
              </span>
            </>
          )}
        </p>
      </div>

      {/* 발급된 주소들 */}
      <table className="w-full border-collapse text-left">
        <tbody>
          {ROUTES.map((route, index) => {
            /* 배포 완료(1) 다음 단계부터 한 줄씩 켜진다. */
            const on = step >= index + 2

            return (
              <tr
                key={route.host}
                className="border-b border-border-color/60 transition-opacity duration-500 last:border-0"
                style={{ opacity: on ? 1 : 0.35 }}
              >
                <td className="w-full max-w-0 py-3 pl-5 pr-2">
                  {/*
                    flex 안에서 truncate 하려면 자식에게 min-w-0 이 있어야 한다.
                    없으면 자식이 내용 폭을 최소 폭으로 주장해 부모가 줄어들고,
                    결과적으로 주소가 실제 여유보다 훨씬 이르게 잘린다.
                  */}
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ${
                        on ? 'bg-success-color' : 'bg-border-strong-color'
                      }`}
                    />
                    <span className="min-w-0 truncate font-mono text-2xs text-primary-text-color">
                      {route.host}
                      <span className="text-tertiary-text-color">.optics.run</span>
                    </span>
                  </span>
                </td>
                <td className="px-2 py-3 text-right">
                  <span className="font-mono text-3xs text-tertiary-text-color">→</span>
                </td>
                <td className="py-3 pl-2 pr-5 text-right">
                  <span className="block truncate text-2xs text-secondary-text-color">
                    {route.service}
                    <span className="ml-1.5 font-mono text-tertiary-text-color">{route.port}</span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-3 border-t border-border-color bg-background-gradation-color px-5 py-3.5">
        <span className="font-mono text-3xs text-tertiary-text-color">*.homelab.optics.run</span>
        <span
          className={`shrink-0 text-3xs transition-colors duration-500 ${
            deployed ? 'text-secondary-text-color' : 'text-tertiary-text-color/50'
          }`}
        >
          Cloudflare DNS · 자동 생성
        </span>
      </div>
    </div>
  )
}
