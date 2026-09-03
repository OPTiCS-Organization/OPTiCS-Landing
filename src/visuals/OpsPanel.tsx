import { useEffect, useRef, useState } from 'react'
import { Play, RotateCw, Square } from 'lucide-react'
import { useInView, useReducedMotion } from '../hooks/useInView'

/**
 * 기능 ③ 배포한 뒤.
 *
 * 실제로 있는 화면 두 개를 한 판에 겹쳐 놓았다 — Agent 대시보드의 CPU·메모리
 * 차트(Live · 3h · 1d 범위는 CpuChart.tsx 의 값 그대로)와, 콘솔 서비스 상세의
 * 컨테이너별 제어다. compose 프로젝트는 컨테이너를 하나씩 따로 다룰 수 있다.
 *
 * 값이 계속 흐른다. 정지된 꺾은선은 '차트가 있다'까지만 말하지만, 값이 들어오고
 * 왼쪽으로 밀려나면 '지금 보고 있는 중'이 된다. 이 섹션의 주장이 '배포한 뒤가 더
 * 길다'이므로, 지켜보는 행위 자체가 보여야 한다.
 *
 * 수치는 예시다. 실제 사용량을 지어내 평균치처럼 말하지 않으려고 축에 눈금을
 * 붙이지 않았다. 여기서 전할 것은 '숫자가 얼마'가 아니라 '지켜볼 수 있다'는 사실이다.
 * 값은 난수 걸음이지만 한 걸음의 폭을 좁게 묶어 둔다 — 매 초 0%와 90%를 오가는
 * 그래프는 살아 있어 보이는 게 아니라 고장 나 보인다.
 */

/**
 * 화면에 남는 기록의 길이와 값이 들어오는 간격.
 *
 * 900ms 는 빨랐다. 값이 밀려나는 속도가 눈으로 좇을 수 있는 한계에 가까워서
 * '지켜보는 화면'이 아니라 '깜빡이는 화면'으로 보였다. 실제 대시보드의 폴링도
 * 이보다 빠르지 않다. 축 라벨은 POINTS × TICK 에서 계산되므로 여기만 고치면 된다.
 */
const POINTS = 24
const TICK = 1200

/** 차트 좌표계. y 는 위가 0 이라 값이 클수록 위로 가려면 뒤집어야 한다. */
const VIEW = { w: 240, h: 56 }

/** 첫 렌더에 보이는 기록. 난수로 만들면 서버·클라이언트가 어긋나고 매번 모양이 달라진다. */
const SEED = [34, 31, 37, 28, 30, 24, 27, 21, 25, 19, 23, 17, 22, 26, 20, 24, 18, 22, 16, 21, 15, 19, 14, 18]

/** 다음 값. 이전 값에서 조금씩만 움직이고 범위를 벗어나지 않는다. */
function nextValue(previous: number): number {
  const drift = (Math.random() - 0.5) * 9
  return Math.min(46, Math.max(8, previous + drift))
}

/** 값(8~46)을 백분율로. 차트의 y 범위와 표시 숫자가 같은 값에서 나와야 한다. */
function toPercent(value: number): number {
  return Math.round(((46 - value) / 38) * 62 + 6)
}

const RANGES = ['Live', '3h', '1d']

const CONTAINERS = [
  { name: 'app', image: 'my-blog-app', up: true },
  { name: 'mysql', image: 'mysql:8', up: true },
  { name: 'redis', image: 'redis:7', up: true },
]

export default function OpsPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const active = useInView(containerRef) && !reduced

  const [series, setSeries] = useState<number[]>(SEED)
  const [memory, setMemory] = useState(21)

  useEffect(() => {
    if (!active) return

    const id = window.setInterval(() => {
      setSeries(previous => [...previous.slice(1), nextValue(previous[previous.length - 1]!)])
      /* 메모리는 CPU 보다 훨씬 느리게 움직인다. 같은 속도로 흔들면 둘 다 가짜로 보인다. */
      setMemory(previous => Math.min(38, Math.max(14, previous + (Math.random() - 0.5) * 1.6)))
    }, TICK)

    return () => window.clearInterval(id)
  }, [active])

  const step = VIEW.w / (POINTS - 1)
  const points = series.map((value, index) => `${(index * step).toFixed(1)},${value.toFixed(1)}`).join(' ')
  const latest = series[series.length - 1]!

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="overflow-hidden rounded-lg border border-border-color bg-modal-background-color"
    >
      {/* 리소스 */}
      <div className="border-b border-border-color px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-4xs tracking-wide text-tertiary-text-color">
              CPU
              {/* 지금 값이 들어오고 있다는 표시. 멈춰 있으면 이 점도 멈춘다. */}
              <span
                className={`inline-block h-1 w-1 rounded-full bg-service-color ${active ? 'animate-pulse' : ''}`}
              />
            </p>
            {/* 폭이 고정돼야 숫자가 바뀔 때 옆 요소가 밀리지 않는다. */}
            <p className="mt-0.5 w-16 font-mono text-lg font-semibold tabular-nums text-primary-text-color">
              {toPercent(latest)}%
            </p>
          </div>

          {/* 범위 전환. 실제 대시보드와 같은 세 가지다. */}
          <div className="flex gap-0.5 rounded border border-border-color bg-background-gradation-color p-0.5">
            {RANGES.map(range => (
              <span
                key={range}
                className={`rounded px-2 py-0.5 text-3xs ${
                  range === 'Live'
                    ? 'bg-surface-active-color text-primary-text-color'
                    : 'text-tertiary-text-color'
                }`}
              >
                {range}
              </span>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="mt-3 h-auto w-full" role="presentation">
          <defs>
            <linearGradient id="cpu-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-service-color)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-service-color)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon points={`${points} ${VIEW.w},${VIEW.h} 0,${VIEW.h}`} fill="url(#cpu-fill)" />
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-service-color)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* 가장 최근 값. 선의 오른쪽 끝이 '지금'이라는 것을 점 하나로 말한다. */}
          <circle cx={VIEW.w} cy={latest} r="2.5" fill="var(--color-service-color)" />
        </svg>

        {/* 기록의 범위. 눈금 대신 양 끝만 적는다 — 가운데 눈금은 지어낸 정밀도가 된다. */}
        <div className="mt-1 flex justify-between text-4xs text-tertiary-text-color">
          <span>{Math.round((POINTS * TICK) / 1000)}초 전</span>
          <span>지금</span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between text-3xs">
            <span className="text-tertiary-text-color">메모리</span>
            <span className="font-mono tabular-nums text-secondary-text-color">
              {(memory * 0.16).toFixed(1)} / 16 GB
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background-gradation-color">
            <div
              className="h-full rounded-full bg-service-color/70 transition-[width] duration-700 ease-out"
              style={{ width: `${memory}%` }}
            />
          </div>
        </div>
      </div>

      {/* 컨테이너 제어 */}
      <div className="px-5 py-4">
        <p className="text-4xs tracking-wide text-tertiary-text-color">CONTAINERS</p>

        <ul className="mt-2.5 divide-y divide-border-color/60">
          {CONTAINERS.map(container => (
            <li key={container.name} className="flex items-center gap-3 py-2.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  container.up ? 'bg-success-color' : 'bg-tertiary-text-color'
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-2xs text-primary-text-color">
                {container.name}
                <span className="ml-2 font-mono text-3xs text-tertiary-text-color">{container.image}</span>
              </span>

              <span className="flex shrink-0 items-center gap-2 text-tertiary-text-color">
                <Play className="h-3 w-3" />
                <Square className="h-3 w-3" />
                <RotateCw className="h-3 w-3" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-border-color bg-background-gradation-color px-5 py-3 text-3xs text-tertiary-text-color">
        지표는 7일 동안 보관됩니다.
      </p>
    </div>
  )
}
