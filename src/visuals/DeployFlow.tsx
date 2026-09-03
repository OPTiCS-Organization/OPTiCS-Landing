import { useEffect, useRef, useState } from 'react'
import { Check, GitBranch, Loader } from 'lucide-react'
import { useInView, useReducedMotion } from '../hooks/useInView'

/**
 * 기능 ① 저장소에서 배포까지.
 *
 * 네 단계가 실제로 진행된다. 정지 화면으로 두면 "이런 단계가 있다"까지만 전달되지만,
 * 움직이면 "지금 저 서버에서 저게 돌고 있다"가 된다. 이 섹션이 팔아야 하는 것은
 * 단계 목록이 아니라 그 진행 자체다.
 *
 * 네 단계는 Agent 의 배포 파이프라인 그대로다(deploy.service.ts).
 * 판별 결과로 적은 세 프리셋도 실제 값이다(DEPLOY_OPTION: DOCKERFILE,
 * COMPOSE, PRESET_NEST). 없는 프리셋을 늘어놓지 않는다.
 *
 * 단계별 시간은 실제 소요를 그대로 옮기지 않는다. 대신 이웃한 단계와의 **대비**로
 * 무게를 만든다 — 판별은 파일 하나 읽는 일이라 짧고, 빌드는 길다. Hero 데모에서
 * 쓴 것과 같은 규칙이다. 절대 시간이 아니라 리듬이 사실감을 만든다.
 *
 * 한 바퀴 약 10초. 끝나면 잠깐 머물렀다 처음으로 돌아간다. 처음에는 6초로 잡았는데,
 * 옆 글을 읽는 동안 단계가 지나가 버려서 무엇이 진행됐는지 남지 않았다. 이 패널은
 * 본문과 나란히 놓이므로 글을 읽다 눈을 들었을 때도 같은 단계가 남아 있어야 한다.
 */
const STAGES = [
  { name: 'Clone', detail: 'github.com/acorn497/my-blog', hold: 2000 },
  { name: 'Detect', detail: 'docker-compose.yml', hold: 1000 },
  { name: 'Build', detail: 'my-blog-app:latest', hold: 3000 },
  { name: 'Run', detail: 'mysql · redis · app', hold: 1900 },
]

/** 마지막 단계가 끝난 뒤 완료 상태로 머무는 시간. 결론을 볼 틈을 준다. */
const SETTLE = 2400

const PRESETS = ['Dockerfile', 'docker-compose', 'NestJS 프리셋']

export default function DeployFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const active = useInView(containerRef) && !reduced

  /* 진행 중인 단계의 인덱스. STAGES.length 는 '전부 끝남'을 뜻한다. */
  const [step, setStep] = useState(reduced ? STAGES.length : 0)

  useEffect(() => {
    if (!active) return

    const done = step >= STAGES.length
    const wait = done ? SETTLE : STAGES[step]!.hold

    const id = window.setTimeout(
      () => setStep(previous => (previous >= STAGES.length ? 0 : previous + 1)),
      wait,
    )
    return () => window.clearTimeout(id)
  }, [active, step])

  const finished = step >= STAGES.length

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="overflow-hidden rounded-lg border border-border-color bg-modal-background-color"
    >
      {/* 입력 — 방문자가 실제로 넣는 것은 이 한 줄이 전부다 */}
      <div className="border-b border-border-color bg-background-gradation-color px-5 py-4">
        <p className="text-4xs tracking-wide text-tertiary-text-color">REPOSITORY URL</p>
        <p className="mt-1.5 flex items-center gap-2 font-mono text-xs text-primary-text-color">
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-secondary-text-color" />
          <span className="truncate">github.com/acorn497/my-blog</span>
        </p>
      </div>

      {/* 파이프라인 */}
      <ol className="px-5 py-5">
        {STAGES.map((stage, index) => {
          const state = index < step || finished ? 'done' : index === step ? 'running' : 'waiting'

          return (
            <li key={stage.name} className="relative flex gap-3.5 pb-5 last:pb-0">
              {/*
                단계를 잇는 세로 레일. 지나온 구간만 액센트로 채운다 —
                선이 어디까지 왔는지가 진행률을 대신한다.

                레일은 원과 원 사이에서만 그린다. 원의 지름은 22px 이고 원의 윗변이
                다음 li 의 y=0 이므로, top-6(24px)에서 시작해 높이를 100%-1.5rem 으로
                두면 정확히 다음 원의 윗변에 닿고 멈춘다. 여기서 1rem 을 빼면 선이
                다음 원 안으로 8px 파고든다 — 원의 배경이 반투명이라 그 선이 원을
                가로지르는 것처럼 비친다.
              */}
              {index < STAGES.length - 1 && (
                <>
                  <span className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px bg-border-color" />
                  <span
                    className={`absolute left-[11px] top-6 w-px bg-success-color/50 transition-[height] duration-500 ease-out ${
                      state === 'done' ? 'h-[calc(100%-1.5rem)]' : 'h-0'
                    }`}
                  />
                </>
              )}

              <span
                className={`relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  state === 'done' ? 'border-success-color/40 bg-success-color/12 text-success-color'
                  : state === 'running' ? 'border-service-color/50 bg-service-color/12 text-service-color'
                  : 'border-border-color bg-background-color text-tertiary-text-color'
                }`}
              >
                {state === 'done' ? <Check className="h-3 w-3" />
                  : state === 'running' ? <Loader className="h-3 w-3 animate-spin [animation-duration:1.2s]" />
                  : <span className="h-1 w-1 rounded-full bg-current" />}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    state === 'waiting' ? 'text-tertiary-text-color' : 'text-primary-text-color'
                  }`}
                >
                  {stage.name}
                </p>
                {/*
                  아직 오지 않은 단계의 상세는 감춘다. 네 줄이 처음부터 다 적혀 있으면
                  진행이 아니라 목록으로 읽힌다.
                */}
                <p
                  className={`mt-1 truncate font-mono text-2xs transition-opacity duration-300 ${
                    state === 'waiting' ? 'opacity-0' : 'text-tertiary-text-color opacity-100'
                  }`}
                >
                  {stage.detail}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {/*
        완료 줄. 자리를 늘 차지하게 두고 내용만 바꾼다 — 나타났다 사라지면
        패널 높이가 흔들려 옆 글까지 같이 움직인다.
      */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border-color bg-background-gradation-color px-5 py-3.5">
        {finished ? (
          <p className="flex items-center gap-1.5 text-2xs font-medium text-success-color">
            <Check className="h-3.5 w-3.5" />
            배포 완료 — 컨테이너 3개 기동
          </p>
        ) : (
          <>
            <span className="mr-1 text-4xs tracking-wide text-tertiary-text-color">AUTO-DETECT</span>
            {PRESETS.map(preset => (
              <span
                key={preset}
                className="rounded border border-border-color px-2 py-0.5 font-mono text-3xs text-secondary-text-color"
              >
                {preset}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
