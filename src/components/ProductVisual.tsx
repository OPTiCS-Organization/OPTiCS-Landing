import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft, Check, ChevronLeft, GitBranch, LayoutPanelTop, Package,
  Lock, Play, Plus, RefreshCw, RotateCcw, Server, Settings2, Square, Terminal, Trash2,
} from 'lucide-react'
import { useReducedMotion } from '../hooks/useInView'

/**
 * Hero 제품 비주얼. 실제 콘솔의 화면 흐름을 순서대로 재연한다.
 *
 *   Services 목록  →  배포 모달(최종 확인)  →  ServiceDetail 로그 탭
 *
 * 원칙: 화면 구조는 실제 콘솔을 따른다. 합성 화면을 만들지 않는다.
 * 클래스는 아래 실물 컴포넌트에서 가져왔으므로, 콘솔 UI가 바뀌면 여기도 같이 고쳐야 한다.
 *
 * 다만 라벨은 영어로 쓴다. 실제 콘솔은 한국어지만, 이 목업은 영문 헤드라인
 * 바로 아래에 놓이므로 한국어 UI 를 그대로 옮기면 시선이 두 언어 사이에서 끊긴다.
 * 여기가 실물과 어긋나는 유일한 지점이다.
 *
 *   - ServiceCard          OPTiCS-Hub-Console/src/components/service/ServiceCard.tsx
 *   - ServiceForm          OPTiCS-Hub-Console/src/components/service/ServiceForm.tsx
 *   - Modal                OPTiCS-Hub-Console/src/context/Modal.context.tsx
 *   - LogPanel             OPTiCS-Hub-Console/src/components/service/LogPanel.tsx
 *   - ServiceDetail 헤더/탭 OPTiCS-Hub-Console/src/pages/ServiceDetail.tsx
 *   - 상태·프리셋 라벨      OPTiCS-Hub-Console/src/constants/service.ts
 *
 * 사이드바는 모든 화면에서 유지되므로(실제 동작과 같다) 한 번만 그리고
 * 본문만 교차 전환한다. 모달은 목록 위에 겹친다.
 */

/* ─────────────────────────── 데모 시나리오 ─────────────────────────── */

const OWNER = 'acorn497'
const PROJECT = 'my-blog'
const WORKSPACE = 'Home Lab'
const WORKSPACE_SUBDOMAIN = 'homelab'
const AGENT_CODE = 'AMBER-OTTER'
/** 주소창에 치는 값. 실제 브라우저도 https:// 를 숨기므로 호스트만 쓴다. */
const PUBLIC_HOST = `${PROJECT}.${WORKSPACE_SUBDOMAIN}.optics.run`
const CONSOLE_URL = 'console.optics.run'

/* ─────────────────────────── 시각 ─────────────────────────── */

/**
 * LogPanel.tsx 의 formatTimestamp() 와 같은 포맷.
 * 방문자의 호스트 시간을 쓰므로 "방금 내 서버에서 일어난 일"처럼 읽힌다.
 */
function formatTimestamp(ms: number): string {
  const date = new Date(ms)
  const ampm = date.getHours() < 12 ? 'AM' : 'PM'
  const hour = String(date.getHours() % 12 || 12).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${ampm} ${hour}:${minute}:${second}`
}

/* ─────────────────────────── 타임라인 ─────────────────────────── */

type Phase = 'list' | 'modal' | 'detail'
type ServiceStatus = 'building' | 'running'
/** 포인터가 머무는 지점. center 외에는 실제 요소 위치를 측정해서 따라간다. */
type CursorSpot = 'center' | 'register' | 'deploy' | 'newtab' | 'address'

/**
 * 어느 탭이 앞에 있는가. 콘솔 탭은 항상 있고, 배포한 서비스 탭은 배포가
 * 끝난 뒤 새 탭으로 열린다.
 */
type Tab = 'console' | 'site'

type LogLine = {
  /** 첫 줄로부터 몇 초 뒤에 찍힌 로그인가. 표시 시각은 이 값을 기준으로 계산한다. */
  at: number
  /** LogPanel 의 logTags(). source, stream 순으로 최대 2개. */
  tags: [string, string]
  text: string
  /**
   * 성공을 알리는 줄만 초록으로 칠한다.
   * 실제 LogPanel 은 stderr 만 붉게 칠하고 나머지는 전부 같은 색인데,
   * 여기서는 배포가 끝난 지점이 한눈에 보여야 해서 한 줄만 예외를 둔다.
   */
  tone?: 'success'
}

type Step = {
  /** 이 단계에 머무는 시간(ms). 0이면 종착점이라 다음으로 넘어가지 않는다. */
  hold: number
  phase: Phase
  /** 마우스 포인터의 위치. */
  cursor?: CursorSpot
  /** 포인터가 가리키는 버튼을 누르고 있는 상태. */
  clicking?: boolean
  log?: LogLine
  status?: ServiceStatus

  /** 서비스 탭이 열려 있는가. 한 번 열리면 끝까지 남는다. */
  siteTab?: boolean
  /** 앞에 나와 있는 탭. */
  tab?: Tab
  /** 주소창을 클릭해 커서가 들어간 상태. */
  focused?: boolean
  /** 주소창에 URL 을 한 글자씩 치고 있는 중. */
  typing?: boolean
  /** 주소를 다 치고 이동한 뒤. 이때부터 서비스 페이지가 그려진다. */
  loaded?: boolean
}

/**
 * 배포 한 판의 흐름. 실제 로그를 그대로 옮기지 않고 읽기 쉽게 다듬었다.
 *
 * 실제 출력에는 내부 구현 이름과 도커 캐시 히트 줄이 잔뜩 섞여 있다. 그건 서비스를
 * 이미 아는 사람에게나 정보고, 처음 보는 방문자에게는 노이즈다. 그래서 줄마다
 * 한 가지 사실만 담고 도커를 몰라도 읽히는 말로 바꿨다.
 *
 * 줄 수는 아홉이다. 열다섯 줄이던 것을 줄였다. 다섯 줄쯤 지나면 '진짜 빌드가
 * 돈다'는 인상은 이미 전달되고, 그 뒤부터는 결론에 닿는 시간만 늘린다.
 *
 * 태그(agent·runtime / deploy·lifecycle·app)는 실제로 쓰이는 값만 쓴다.
 *
 * 마지막 줄에서 공개 URL을 찍는 게 이 애니메이션의 목적이다.
 * Hero 헤드라인이 약속한 것("내 PC가 내 클라우드가 된다")이 여기서 닫힌다.
 *
 * hold 는 '그 줄이 뜨고 나서 다음 줄이 뜨기까지' 걸리는 시간이다. 그러므로
 * 어떤 작업이 오래 걸리면, 그 작업을 알리는 줄에 긴 hold 를 준다.
 *
 *   git clone        네트워크로 저장소를 받아온다
 *   npm ci           이 배포에서 가장 오래 걸리는 구간
 *   npm run build    번들링
 *   mysql 기동        health check 를 통과할 때까지 기다린다
 *   나머지            파일 하나 읽거나 컨테이너를 띄우는 정도
 *
 * 이렇게 해야 '재생 중인 애니메이션'이 아니라 '진짜 로그'로 읽힌다.
 * 모든 줄이 같은 간격으로 떨어지면 아무리 내용이 진짜라도 가짜처럼 보인다.
 *
 * 다만 실제 소요 시간을 그대로 옮기지는 않는다. 전체가 15초에 가까워지면
 * 마지막 줄(공개 URL)까지 보고 가는 방문자가 없다. 그 줄이 이 애니메이션의
 * 목적이므로, 끝까지 도달하는 것이 사실적인 초 단위보다 우선한다.
 *
 * 대신 '무거운 작업은 오래 걸린다'는 감각은 절대 시간이 아니라 이웃한 줄과의
 * 대비에서 나온다. 주변이 180~260ms 일 때 880ms 는 이미 충분히 긴 멈춤이다.
 * 그래서 긴 홀드를 줄여도 리듬은 그대로 남는다.
 *
 * 아래 값은 리듬의 비율만 정한다. 실제 재생 속도는 PACE 가 결정한다.
 *
 * 순서는 바꾸지 않는다. 결과를 먼저 보여 달라는 요구가 있었지만, 배포한 적 없는
 * 서비스가 열려 있는 화면부터 나오면 그게 왜 열렸는지 알 근거가 없다.
 * 등록 → 배포 → 열림 이라는 순서 자체가 이 데모의 논증이다.
 */
/**
 * 재생 속도. 모든 hold 에 한꺼번에 곱한다.
 *
 * 처음 잡은 값(1.0, 전체 9.5초)은 각 단계가 무슨 일인지 읽히기 전에 다음 단계로
 * 넘어갔다. 로그가 한 줄씩 쌓이는 데모는 '빨라 보이는 것'보다 '따라 읽히는 것'이
 * 중요하다. 비율은 그대로 두고 배속만 낮춘다 — 단계 간 대비가 리듬을 만들고 있어서,
 * 개별 값을 손대면 그 대비가 무너진다. 전체 약 12.5초.
 */
const PACE = 1.32

const TIMELINE: Step[] = [
  // 포인터가 한가운데에 나타나 '서비스 등록'을 누르면 모달이 열리고,
  // 다시 '배포 시작'으로 옮겨 가 누른다. 누르는 순간은 짧게 끊어야 진짜 클릭처럼 보인다.
  { hold: 380, phase: 'list' },
  { hold: 200, phase: 'list', cursor: 'center' },
  { hold: 460, phase: 'list', cursor: 'register' },
  { hold: 280, phase: 'list', cursor: 'register', clicking: true },

  // 모달이 열려도 포인터는 방금 누른 자리에 그대로 있다. 그래야 이어진 동작으로 읽힌다.
  // 폼이 채워져 있다는 걸 알아볼 최소한만 남긴다. 여기서 더 줄이면 번쩍하고 지나간다.
  { hold: 500, phase: 'modal', cursor: 'register' },
  { hold: 460, phase: 'modal', cursor: 'deploy' },
  { hold: 280, phase: 'modal', cursor: 'deploy', clicking: true },
  { hold: 200, phase: 'detail' },

  // 명령 전달은 즉시
  { hold: 180, phase: 'detail', log: { at: 0, tags: ['agent', 'deploy'], text: `Deploying ${PROJECT}@1.0.0` } },

  // git clone — 네트워크로 저장소를 받아오는 동안 눈에 띄게 멈춘다
  { hold: 800, phase: 'detail', log: { at: 0, tags: ['agent', 'deploy'], text: `Cloning github.com/${OWNER}/${PROJECT}` } },

  // 프리셋 판별 — 파일 하나 읽는 일이라 즉시 끝난다
  { hold: 200, phase: 'detail', log: { at: 1, tags: ['agent', 'deploy'], text: 'Detected docker-compose.yml' } },

  /*
   * 빌드는 한 줄로 묶고 홀드를 길게 준다.
   *
   * 전에는 Step 1/4 … 4/4 를 한 줄씩 찍었다. 도커 느낌은 살지만 네 줄을 쓰고,
   * 무엇보다 줄을 줄일 때마다 번호가 어긋나 로그가 잘린 것처럼 보인다.
   * 실제로 그 버그를 한 번 냈다. 번호를 아예 없애면 그 취약함이 사라진다.
   *
   * '오래 걸린다' 는 감각은 이 한 줄의 880ms 가 이웃한 180~260ms 와 대비되며
   * 그대로 전달된다. 줄 수가 아니라 멈춤이 무게를 만든다.
   */
  { hold: 880, phase: 'detail', log: { at: 1, tags: ['agent', 'deploy'], text: `Building image ${PROJECT}-app` } },
  { hold: 240, phase: 'detail', log: { at: 2, tags: ['agent', 'deploy'], text: `Image built — ${PROJECT}-app:latest` } },

  // 컨테이너 기동 — 셋 다 남긴다. 헤더의 Running (3/3) 과 수가 맞아야 한다
  { hold: 400, phase: 'detail', log: { at: 2, tags: ['agent', 'lifecycle'], text: 'Container mysql started' } },
  { hold: 180, phase: 'detail', log: { at: 3, tags: ['agent', 'lifecycle'], text: 'Container redis started' } },
  { hold: 360, phase: 'detail', log: { at: 3, tags: ['agent', 'lifecycle'], text: 'Container app started' } },

  /*
   * 완료.
   *
   * 마지막 줄은 Agent 가 실제로 찍는 문구다(deploy.service.ts). 앞서 여기에
   * `Live at <공개 URL>` 을 뒀었는데, 그런 로그는 존재하지 않는다. 공개 주소를
   * 로그에 찍는 코드가 Agent 에도 Hub 에도 없다.
   *
   * 공개 URL 은 콘솔 프레임 바깥의 결과 바가 대신 보여준다. 콘솔에는 배포된
   * 서비스의 전체 주소를 링크로 띄우는 화면이 아직 없으므로(Overview 탭의
   * 엔드포인트 표기가 전부다), 없는 UI 를 그리는 대신 랜딩의 말로 말한다.
   */
  { hold: 360, phase: 'detail', log: { at: 3, tags: ['runtime', 'app'], text: 'Nest application started on port 3000' } },
  { hold: 560, phase: 'detail', log: { at: 4, tags: ['agent', 'deploy'], text: 'Service deployed successfully.', tone: 'success' }, status: 'running' },

  /*
   * 그리고 브라우저로 확인한다.
   *
   * 여기가 이 애니메이션의 결론이다. 로그 마지막 줄은 "배포됐다"까지만 말하고,
   * 방문자가 정말 알고 싶은 것("그래서 밖에서 열리냐")에는 답하지 못한다.
   * 주소창에 URL 을 쳐서 실제로 열리는 것을 보여주는 편이 어떤 문장보다 빠르다.
   *
   * 새 탭으로 여는 이유: 같은 창에서 이동하면 콘솔이 사라진다. 하필 서비스가
   * 돌아가고 있다는 걸 가장 보여주고 싶은 순간에 그 증거를 치우는 셈이다.
   * 탭 두 개가 나란히 남아야 '콘솔과 내 서비스가 함께 살아 있다'가 보인다.
   */
  { hold: 380, phase: 'detail', cursor: 'newtab', siteTab: false },
  { hold: 240, phase: 'detail', cursor: 'newtab', clicking: true },

  // 빈 새 탭. 아직 주소가 없으니 탭 이름도 New tab 이다.
  { hold: 260, phase: 'detail', siteTab: true, tab: 'site' },

  // 주소창을 눌러 커서를 넣는다. 이 한 박자가 없으면 글자가 저절로 나타난다.
  { hold: 360, phase: 'detail', siteTab: true, tab: 'site', cursor: 'address' },
  { hold: 240, phase: 'detail', siteTab: true, tab: 'site', cursor: 'address', clicking: true },

  // 타이핑. typedChars 가 이 hold 안에서 URL 끝까지 도달한다.
  { hold: 780, phase: 'detail', siteTab: true, tab: 'site', focused: true, typing: true },

  // 이동 — 잠깐의 빈 화면이 있어야 '지금 불러왔다'로 읽힌다
  { hold: 300, phase: 'detail', siteTab: true, tab: 'site', focused: true, typing: true, loaded: false },
  { hold: 0, phase: 'detail', siteTab: true, tab: 'site', loaded: true },
]

const FINAL_STEP = TIMELINE.length - 1

/* ─────────────────────────── 목록 데이터 ─────────────────────────── */

type MockService = {
  name: string
  preset: string
  running: number
  total: number
  repository: string
  version: string
  ports: string
}

/** 이미 돌고 있는 서비스들. 모달로 새로 만드는 my-blog 는 여기 없다. */
const SERVICES: MockService[] = [
  {
    name: 'todo-api', preset: 'Dockerfile', running: 1, total: 1,
    repository: `https://github.com/${OWNER}/todo-api`,
    version: '0.4.2', ports: ':8080 -> :8080',
  },
  {
    name: 'portfolio', preset: 'Dockerfile', running: 1, total: 1,
    repository: `https://github.com/${OWNER}/portfolio`,
    version: '0.1.0', ports: ':4000 -> :80',
  },
]

/* ─────────────────────────── 파생 상태 ─────────────────────────── */

function stateAt(step: number) {
  const passed = TIMELINE.slice(0, step + 1)
  const logs = passed.filter(item => item.log !== undefined).map(item => item.log!)
  const current = TIMELINE[step] ?? TIMELINE[0]

  let status: ServiceStatus = 'building'
  for (const item of passed) if (item.status !== undefined) status = item.status

  /* 탭은 한 번 열리면 닫히지 않는다. 지나온 단계 중 하나라도 켰으면 켜진 상태다. */
  const siteTab = passed.some(item => item.siteTab === true)

  return {
    logs,
    status,
    siteTab,
    phase: current.phase,
    cursor: current.cursor,
    clicking: current.clicking === true,
    tab: current.tab ?? 'console',
    focused: current.focused === true,
    typing: current.typing === true,
    loaded: current.loaded === true,
  }
}

/* ─────────────────────────── 조각 ─────────────────────────── */

/** ServiceCard.tsx 의 구조를 그대로 따른다. 목록의 서비스는 전부 running 상태다. */
function ServiceCardMock({ service }: { service: MockService }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border-color bg-modal-box-color">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5">
          <Package className="h-4.5 w-4.5 text-secondary-text-color" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-modal-box-color bg-success-color" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-primary-text-color">{service.name}</span>
            <span className="shrink-0 text-3xs text-secondary-text-color/60">{service.preset}</span>
          </div>
          <div className="flex items-center gap-1 text-2xs">
            <span className="font-medium text-success-color">
              Running
              <span className="ml-0.5 text-secondary-text-color/60">({service.running}/{service.total})</span>
            </span>
            <span className="text-secondary-text-color/40">·</span>
            <span className="font-mono text-secondary-text-color/60">{AGENT_CODE}</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-[54px] flex-col gap-1.5 px-4 pb-3">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-secondary-text-color/70">
          <GitBranch className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate font-mono">{service.repository}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-color px-4 py-2.5">
        <span className="shrink-0 font-mono text-3xs text-secondary-text-color/60">{service.version}</span>
        <span className="min-w-0 truncate text-right text-3xs text-secondary-text-color/60">{service.ports}</span>
      </div>
    </div>
  )
}

/** LogPanel.tsx 의 renderLogLine() 과 같은 구조. */
function LogRow({ line, time }: { line: LogLine; time: number }) {
  return (
    <div className="optics-log-in flex gap-2">
      <span className="shrink-0 text-secondary-text-color/40">
        {formatTimestamp(time)}
      </span>
      <span className="flex shrink-0 gap-1 self-start">
        {line.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex h-4 items-center rounded border border-border-color px-1 text-4xs leading-none text-secondary-text-color/60"
          >
            {tag}
          </span>
        ))}
      </span>
      <span className={`whitespace-pre ${line.tone === 'success' ? 'text-success-color' : 'text-primary-text-color'}`}>
        {line.text}
      </span>
    </div>
  )
}

const NAV = [
  { label: 'Overview', icon: LayoutPanelTop },
  { label: 'Agents', icon: Server },
  { label: 'Services', icon: Package, active: true },
  { label: 'Workspace Settings', icon: Settings2 },
]

function Sidebar() {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-border-color bg-background-gradation-color p-3 lg:flex">
      <p className="px-2 py-1.5 text-sm font-bold tracking-tight text-primary-text-color">OPTiCS</p>

      <div className="mt-4 rounded-md border border-border-color bg-modal-background-color px-3 py-2.5">
        <p className="text-4xs tracking-wide text-tertiary-text-color">CURRENT WORKSPACE</p>
        <p className="mt-1 text-xs font-semibold text-primary-text-color">{WORKSPACE}</p>
        <p className="mt-1 flex items-center gap-1.5 text-3xs text-secondary-text-color/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-service-color" />
          Agent linked
        </p>
      </div>

      <p className="mt-5 px-2 text-4xs tracking-wide text-tertiary-text-color">PAGES</p>
      <nav className="mt-1.5 flex flex-col gap-0.5">
        {NAV.map(item => (
          <span
            key={item.label}
            className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs ${
              item.active === true
                ? 'bg-surface-active-color font-medium text-service-color'
                : 'text-secondary-text-color'
            }`}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </span>
        ))}
      </nav>
    </aside>
  )
}

/* ─────────────────────────── 화면 ─────────────────────────── */

function ListScreen({
  registerRef,
  pressed,
}: {
  registerRef: React.RefObject<HTMLSpanElement | null>
  pressed: boolean
}) {
  return (
    <div className="p-6">
      <h1 className="text-lg font-bold text-primary-text-color">Services</h1>
      <p className="mt-1 text-sm text-secondary-text-color">
        Services running on agents linked to this workspace.
      </p>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary-text-color">
          All services<span className="ml-2 font-normal text-secondary-text-color">{SERVICES.length}</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-secondary-text-color">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </span>
          <span
            ref={registerRef}
            className={`flex items-center gap-1.5 rounded-sm bg-service-color px-2.5 py-1.5 text-xs text-white transition-transform duration-100 ${
              pressed ? 'scale-95' : ''
            }`}
          >
            <Plus className="h-3 w-3" />
            New service
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(service => (
          <ServiceCardMock key={service.name} service={service} />
        ))}
      </div>
    </div>
  )
}

/**
 * 마우스 포인터.
 *
 * lucide 의 MousePointer2 는 선으로 그린 아이콘이라 '커서'가 아니라 '아이콘'으로 보인다.
 * OS 커서와 같은 실루엣(흰 면 + 어두운 테두리 + 그림자)을 직접 그린다.
 *
 * 테두리를 굵게 주면 작은 크기에서 면이 뭉개져 뭉툭해 보인다. 얇은 테두리로
 * 형태만 잡고 대비는 그림자로 만든다.
 * 끝점은 viewBox 기준 (4, 1.5) 이라 20px 로 그리면 좌상단에서 약 (3, 1) 안쪽이다.
 */
const CURSOR_TIP = { x: 3, y: 1 }

function CursorArrow({ pressed }: { pressed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`block h-5 w-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-transform duration-100 ${
        pressed ? 'scale-90' : ''
      }`}
      style={{ transformOrigin: '4px 1.5px' }}
    >
      <path
        d="M4 1.5 L4 17.2 L8.1 13.4 L10.6 19.3 L13.3 18.1 L10.8 12.4 L16.2 12.4 Z"
        fill="#ffffff"
        stroke="#0d0b0a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** ServiceForm.tsx 의 마지막 단계(최종 확인). 여기서 '배포 시작'을 누른다. */
const FORM_STEPS = ['Source', 'Config', 'Env', 'Review']

const SUMMARY: { label: string; value: string }[] = [
  { label: 'Name', value: PROJECT },
  { label: 'Source', value: `github.com/${OWNER}/${PROJECT}` },
  { label: 'Preset', value: 'compose' },
  { label: 'Agent', value: 'home-server' },
]

function DeployModal({
  deployRef,
  pressed,
}: {
  deployRef: React.RefObject<HTMLSpanElement | null>
  pressed: boolean
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-border-color bg-modal-background-color shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
          <span className="text-sm font-semibold text-primary-text-color">New service</span>
          <span className="leading-none text-secondary-text-color">✕</span>
        </div>

        <div className="flex flex-col gap-3.5 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3 border-b border-border-color/70 pb-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-text-color">Review</p>
              <p className="mt-0.5 text-2xs text-secondary-text-color">
                Check the values, then start the deploy.
              </p>
            </div>

            {/* 4단계 진행 표시. 마지막 단계라 앞의 셋은 완료 상태다. */}
            <div className="relative mt-1.5 w-[104px] shrink-0 px-1">
              <div className="absolute top-[7px] right-1.5 left-1.5 h-px bg-border-color" />
              <div className="absolute top-[7px] left-1.5 h-px w-[92%] bg-service-color/80" />
              <div className="relative grid grid-cols-4">
                {FORM_STEPS.map((label, index) => {
                  const isCurrent = index === FORM_STEPS.length - 1
                  return (
                    <span key={label} className="flex min-w-0 justify-center">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-modal-background-color ${
                          isCurrent ? 'border-service-color text-service-color' : 'border-service-color/70 text-service-color'
                        }`}
                      >
                        {isCurrent
                          ? <span className="h-1 w-1 rounded-full bg-service-color" />
                          : <Check className="h-2 w-2" />}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            {SUMMARY.map(row => (
              <div
                key={row.label}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-2.5 border-b border-border-color/50 py-2 last:border-0"
              >
                <span className="text-xs text-secondary-text-color">{row.label}</span>
                <div className="min-w-0 truncate text-xs text-primary-text-color">{row.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border-color pt-3.5">
            <span className="flex h-8 items-center gap-1.5 rounded-sm border border-border-color px-3 text-xs text-secondary-text-color">
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </span>
            <span
              ref={deployRef}
              className={`relative flex h-8 items-center gap-2 rounded-sm bg-service-color px-3.5 text-xs font-semibold text-white transition-transform duration-100 ${
                pressed ? 'scale-95' : ''
              }`}
            >
              Deploy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── 브라우저 크롬 ─────────────────────────── */

/**
 * 탭 바.
 *
 * 재생이 끝나면(interactive) 탭을 눌러 오갈 수 있다. 다 본 뒤에도 화면이
 * 죽어 있지 않고, 방문자가 콘솔과 배포 결과를 직접 견줘 볼 수 있다.
 *
 * 다만 버튼에 tabIndex={-1} 을 준다. 이 목업 전체가 aria-hidden 이라
 * 포커스 가능한 요소를 남기면 키보드 사용자가 읽히지도 않는 곳에 갇힌다.
 * 마우스 전용 장식이고, 여기서 얻을 정보는 아래 결과 줄이 따로 말해 준다.
 */
function TabBar({
  siteTab,
  tab,
  loaded,
  newTabRef,
  pressed,
  interactive,
  onSelect,
}: {
  siteTab: boolean
  tab: Tab
  /** 페이지를 불러오기 전까지 탭 이름은 New tab 이다. */
  loaded: boolean
  newTabRef: React.RefObject<HTMLButtonElement | null>
  pressed: boolean
  interactive: boolean
  onSelect: (tab: Tab) => void
}) {
  const tabs: { id: Tab; label: string; shown: boolean }[] = [
    { id: 'console', label: 'OPTiCS Console', shown: true },
    { id: 'site', label: loaded ? PROJECT : 'New tab', shown: siteTab },
  ]

  return (
    <div className="flex items-end gap-1 border-b border-border-color bg-modal-box-color px-3 pt-2">
      {tabs.filter(item => item.shown).map(item => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            tabIndex={-1}
            onClick={interactive ? () => onSelect(item.id) : undefined}
            className={`flex min-w-0 max-w-[11rem] flex-1 items-center gap-2 rounded-t-md border border-b-0 px-3 py-2 text-2xs transition-colors ${
              active
                ? 'border-border-color bg-background-gradation-color text-primary-text-color'
                : 'border-transparent text-tertiary-text-color'
            } ${interactive ? 'cursor-pointer hover:text-primary-text-color' : ''}`}
          >
            {/*
              점은 '이 탭이 무엇인가'를 말한다. 아직 주소를 넣지 않은 새 탭은
              가리킬 대상이 없으므로 흐린 회색으로 둔다.
            */}
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                item.id === 'console' ? 'bg-service-color'
                : loaded ? 'bg-success-color'
                : 'bg-border-strong-color'
              }`}
            />
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}

      {/* 새 탭 버튼. 포인터가 여기를 눌러 서비스 탭을 연다. */}
      <button
        ref={newTabRef}
        type="button"
        tabIndex={-1}
        className={`mb-1 ml-0.5 shrink-0 rounded p-1 transition-colors ${
          pressed ? 'bg-border-strong-color text-primary-text-color' : 'text-tertiary-text-color'
        }`}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

/**
 * 배포된 서비스 페이지.
 *
 * 일부러 밋밋하게 그린다. 여기에 잘 만든 블로그를 그리면 "OPTiCS 를 쓰면 저런
 * 사이트가 나온다"로 읽히는데, 이건 사용자가 만든 앱이지 우리 제품이 아니다.
 * 알아볼 수 있을 만큼만 그리고 그 이상은 주장하지 않는다.
 *
 * 중요한 건 페이지 내용이 아니라 '주소를 쳤더니 열렸다'는 사실이다.
 */
const POSTS = [
  { title: 'Hello, world', date: '2026-09-01', read: '2 min', tag: 'notes' },
  { title: 'Second post', date: '2026-08-24', read: '5 min', tag: 'dev' },
  { title: 'Third post', date: '2026-08-11', read: '3 min', tag: 'notes' },
]

function SitePage({ loaded }: { loaded: boolean }) {
  return (
    /*
     * 색을 콘솔과 일부러 다르게 잡는다. 배경은 더 검고, 강조는 주황이 아니라
     * 인디고다. 같은 팔레트를 쓰면 콘솔의 한 화면처럼 보여서 '다른 사이트로
     * 넘어왔다'는 사실이 흐려진다. 여기는 남의 사이트여야 한다.
     */
    <div className="h-full overflow-hidden bg-[#0d0d10]">
      {/* 불러오는 동안의 빈 화면. 이게 있어야 '지금 받아왔다'로 읽힌다. */}
      <div className={`h-full transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mx-auto flex h-full max-w-xl flex-col px-8 py-9">
          {/* 사이트 머리 — 로고 마크와 메뉴. 블로그라면 으레 있는 것들이다. */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-500 text-2xs font-bold text-white">
                m
              </span>
              <span className="truncate text-sm font-semibold text-neutral-100">{PROJECT}</span>
            </div>
            <nav className="flex shrink-0 items-center gap-4 text-2xs">
              <span className="text-neutral-200">Posts</span>
              <span className="text-neutral-500">About</span>
              <span className="text-neutral-500">RSS</span>
            </nav>
          </div>

          <p className="mt-6 text-2xs leading-relaxed text-neutral-500">
            Notes on things I run at home. Hosted on my own machine.
          </p>

          <div className="mt-6 flex-1 divide-y divide-neutral-800/80 border-t border-neutral-800/80">
            {POSTS.map(post => (
              <article key={post.title} className="flex items-baseline justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-100">{post.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-3xs text-neutral-500">
                    <span className="text-indigo-400">#{post.tag}</span>
                    <span>{post.read}</span>
                  </p>
                </div>
                <p className="shrink-0 font-mono text-3xs text-neutral-600">{post.date}</p>
              </article>
            ))}
          </div>

          <p className="mt-4 shrink-0 border-t border-neutral-800/80 pt-4 text-3xs text-neutral-600">
            © 2026 {OWNER}
          </p>
        </div>
      </div>
    </div>
  )
}

type LogEntry = { line: LogLine; time: number }

function DetailScreen({
  entries,
  status,
  now,
}: {
  entries: LogEntry[]
  status: ServiceStatus
  /** 커서 줄에 찍히는 시각. 1초마다 갱신돼 로그가 없을 때도 시계가 흐른다. */
  now: number
}) {
  const running = status === 'running'
  const scrollRef = useRef<HTMLDivElement>(null)
  /* 사용자가 위로 올려 읽는 중이면 자동 스크롤을 멈춘다. 실제 LogPanel 과 같은 규칙. */
  const stickToBottomRef = useRef(true)

  useEffect(() => {
    const container = scrollRef.current
    if (container === null || !stickToBottomRef.current) return
    container.scrollTop = container.scrollHeight
  }, [entries.length])

  function handleScroll() {
    const container = scrollRef.current
    if (container === null) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    stickToBottomRef.current = distanceFromBottom < 40
  }

  return (
    <div className="flex h-full flex-col p-6">
      <span className="mb-4 flex w-fit shrink-0 items-center gap-1.5 text-xs text-secondary-text-color">
        <ArrowLeft className="h-3 w-3" />
        Back to services
      </span>

      {/* 헤더: 정체성 + 제어 */}
      <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-color bg-modal-box-color">
            <Package className="h-5 w-5 text-secondary-text-color" />
            <span
              className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background-color transition-colors duration-300 ${
                running ? 'bg-success-color' : 'bg-warning-color'
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2">
              <h1 className="truncate text-lg font-bold text-primary-text-color">{PROJECT}</h1>
              <span className="shrink-0 text-xs text-secondary-text-color/60">Compose</span>
            </div>
            <span className={`text-xs transition-colors duration-300 ${running ? 'text-success-color' : 'text-warning-color'}`}>
              {running ? 'Running' : 'Building'}
              <span className="ml-0.5 text-secondary-text-color/60">({running ? 3 : 0}/3)</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-secondary-text-color">
          <Play className="h-4 w-4" />
          <Square className="h-4 w-4" />
          <RefreshCw className="h-4 w-4" />
          <Trash2 className="h-4 w-4" />
        </div>
      </div>

      {/* 탭 바 */}
      <div className="mb-3 flex shrink-0 items-center gap-1 border-b border-border-color">
        {[
          { label: 'Overview', active: false },
          { label: 'Containers (3)', active: false },
          { label: 'Logs', active: true },
        ].map(tab => (
          <span
            key={tab.label}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium ${
              tab.active
                ? 'border-service-color text-primary-text-color'
                : 'border-transparent text-secondary-text-color'
            }`}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* 로그 패널 */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-modal-box-color">
        <div className="flex shrink-0 items-center justify-between border-b border-border-color px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-secondary-text-color" />
            <span className="text-xs font-semibold text-primary-text-color">Logs</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-service-color" />
            <span className="text-3xs text-secondary-text-color/60">Streaming</span>
          </div>
          <span className="text-3xs text-secondary-text-color">Clear</span>
        </div>

        {/*
          스크롤 컨테이너와 정렬 래퍼를 나눈다.
          flex + justify-end 를 스크롤 컨테이너에 직접 걸면 내용이 넘칠 때
          위쪽으로 스크롤이 안 되는 브라우저가 있다. 안쪽 래퍼에 min-h-full 을 줘서
          줄이 적을 땐 아래에 붙고, 넘치면 정상적으로 스크롤되게 한다.
        */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 font-mono text-2xs leading-5"
        >
          <div className="flex min-h-full flex-col justify-end">
            {entries.map(entry => (
              <LogRow key={entry.line.text} line={entry.line} time={entry.time} />
            ))}
            <div className="flex gap-2">
              <span className="shrink-0 text-secondary-text-color/40">
                {formatTimestamp(now)}
              </span>
              <span className="optics-caret text-service-color">▍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── 본체 ─────────────────────────── */

export default function ProductVisual() {
  const containerRef = useRef<HTMLDivElement>(null)

  /*
   * 모션 설정은 첫 렌더에서 읽는다. useEffect 로 미루면 그 사이 한 프레임 동안
   * 다른 화면이 그려졌다가 바뀌면서 원치 않는 페이드가 눈에 띈다.
   *
   * 직접 matchMedia 를 부르지 않고 훅을 쓰는 이유는 window 가 없는 곳에서도 이
   * 컴포넌트가 한 번 렌더되기 때문이다 — 빌드 때 크롤러용 HTML 을 뽑는
   * 프리렌더가 Node 에서 돌린다(scripts/prerender.mjs). 훅 쪽에 typeof window
   * 가드가 이미 있다. 이 파일에서 첫 렌더 중에 브라우저 API 를 읽는 곳은
   * 여기 하나뿐이고, 나머지는 전부 effect 안이라 Node 에서 실행되지 않는다.
   */
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)

  /*
   * 커서 줄에 찍히는 시계. 1초마다 갱신되므로 로그가 한 줄도 없을 때에도
   * 시간이 흐른다. 멈춘 스크린샷이 아니라 지금 열려 있는 콘솔로 읽히게 하는 부분이다.
   */
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!started && !reduced) return

    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [started, reduced])

  /*
   * 로그 줄이 화면에 나타난 실제 시각을 한 번만 기록해 둔다.
   * 미리 계산해 둔 가짜 시각이 아니라, 방문자가 그 줄을 본 바로 그 순간이 찍힌다.
   * 같은 인덱스에는 다시 쓰지 않으므로 렌더 중에 호출해도 값이 흔들리지 않는다.
   */
  const emittedAtRef = useRef(new Map<number, number>())

  function resolveTime(index: number, line: LogLine, lastAt: number) {
    // 모션 감소 설정에서는 전부 한 번에 그려지므로 상대 시각으로 자연스럽게 벌려 준다.
    if (reduced) return now - (lastAt - line.at) * 1000

    const emittedAt = emittedAtRef.current
    const recorded = emittedAt.get(index)
    if (recorded !== undefined) return recorded

    const time = Date.now()
    emittedAt.set(index, time)
    return time
  }

  useEffect(() => {
    if (reduced) return

    const element = containerRef.current
    if (element === null) return

    // 화면 밖으로 나가면 멈춘다. 안 보이는 애니메이션에 배터리를 쓰지 않는다.
    const observer = new IntersectionObserver(
      entries => setStarted(entries[0]?.isIntersecting === true),
      { threshold: 0.2 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    if (!started) return

    const current = TIMELINE[step]
    if (current === undefined || current.hold === 0) return

    const id = window.setTimeout(() => setStep(previous => previous + 1), current.hold * PACE)
    return () => window.clearTimeout(id)
  }, [step, started])

  /*
   * 시작 전에는 0단계(목록)를 그대로 보여준다. 여기서 마지막 단계를 그리면
   * 관찰자가 발동하는 순간 로그 화면 → 목록 화면으로 되돌아가는 페이드가 보인다.
   * 모션 감소 설정일 때만 완료 상태로 고정한다.
   */
  const state = stateAt(reduced ? FINAL_STEP : step)
  const { logs, status, phase, cursor, clicking, siteTab, focused, typing, loaded } = state

  /* 주소창에 커서가 들어가 있거나, 들어가려고 누르는 중이면 테두리를 밝힌다. */
  const addressActive = focused || cursor === 'address'

  /*
   * 모션 감소 설정에서는 완료 상태로 고정되므로 결과 바도 처음부터 보인다.
   * 애니메이션을 못 보는 사람에게 결론까지 감출 이유는 없다.
   */
  const done = reduced || step >= FINAL_STEP

  /*
   * 재생이 끝나면 탭은 방문자 것이 된다. 그전까지는 타임라인이 정한 탭을 따른다.
   * 수동으로 고른 탭은 다시 보기를 누를 때 비워진다.
   */
  const [pickedTab, setPickedTab] = useState<Tab | null>(null)
  const tab: Tab = done && pickedTab !== null ? pickedTab : state.tab

  function selectTab(next: Tab) {
    setPickedTab(next)
  }

  /*
   * 주소창 타이핑. 한 글자씩 늘려 실제로 치는 것처럼 보이게 한다.
   * TIMELINE 의 typing 단계 hold 안에 끝나야 하므로 간격에도 PACE 를 곱한다 —
   * 홀드만 늘리면 다 친 주소를 멍하니 보고 있는 시간이 생긴다.
   */
  const [typedChars, setTypedChars] = useState(0)

  useEffect(() => {
    if (!typing) return

    const id = window.setInterval(() => {
      setTypedChars(previous => Math.min(previous + 1, PUBLIC_HOST.length))
    }, 26 * PACE)
    return () => window.clearInterval(id)
  }, [typing])

  // 주소를 다 친 뒤에는 전체를 보여준다. 모션 감소 설정에서는 처음부터 완성형이다.
  const typed = loaded || reduced ? PUBLIC_HOST : PUBLIC_HOST.slice(0, typedChars)

  function replay() {
    // 기록해 둔 시각을 비워야 다시 재생할 때 지금 시각이 새로 찍힌다.
    emittedAtRef.current.clear()
    setTypedChars(0)
    setPickedTab(null)
    setStep(0)
  }

  const lastAt = logs.length > 0 ? logs[logs.length - 1]!.at : 0
  const entries = logs.map((line, index) => ({ line, time: resolveTime(index, line, lastAt) }))

  /*
   * 포인터는 화면(목록/모달) 바깥, 본문 영역 위에 하나만 둔다.
   * 화면 안에 두면 목록에서 모달로 넘어갈 때 좌표계가 바뀌어 포인터가 순간이동한다.
   *
   * 목표 지점은 버튼의 실제 위치를 재서 구한다. 좌표를 픽셀로 못박아 두면
   * 버튼 문구가 한 글자만 늘어도, 폰트가 달라도 빗나간다.
   */
  const contentRef = useRef<HTMLDivElement>(null)
  const registerRef = useRef<HTMLSpanElement>(null)
  const deployRef = useRef<HTMLSpanElement>(null)
  const newTabRef = useRef<HTMLButtonElement>(null)
  const addressRef = useRef<HTMLDivElement>(null)
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    if (cursor === undefined) return

    function measure() {
      const frame = containerRef.current
      const content = contentRef.current
      if (frame === null || content === null) return

      const frameRect = frame.getBoundingClientRect()
      const target = cursor === 'register'
        ? registerRef.current
        : cursor === 'deploy' ? deployRef.current
        : cursor === 'newtab' ? newTabRef.current
        : cursor === 'address' ? addressRef.current : null

      // center — 본문 한가운데에서 출발한다. 창 한가운데가 아니다.
      if (target === null) {
        const contentRect = content.getBoundingClientRect()
        setCursorPoint({
          x: contentRect.left - frameRect.left + contentRect.width / 2,
          y: contentRect.top - frameRect.top + contentRect.height * 0.46,
        })
        return
      }

      const targetRect = target.getBoundingClientRect()
      setCursorPoint({
        x: targetRect.left - frameRect.left + targetRect.width / 2,
        y: targetRect.top - frameRect.top + targetRect.height / 2,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [cursor])

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden
        className="relative overflow-hidden rounded-xl border border-border-color bg-modal-background-color shadow-2xl shadow-black/40"
      >
        {/* 탭 바 */}
        <TabBar
          siteTab={siteTab}
          tab={tab}
          loaded={loaded}
          newTabRef={newTabRef}
          pressed={clicking && cursor === 'newtab'}
          interactive={done}
          onSelect={selectTab}
        />

        {/* 주소창 */}
        <div className="flex items-center gap-3 border-b border-border-color bg-background-gradation-color px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong-color" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong-color" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong-color" />
          </div>

          {/*
            주소창은 세 가지 얼굴을 가진다.
              콘솔 탭        console.optics.run 고정
              빈 새 탭       안내 문구만. 눌러서 커서가 들어오면 캐럿이 뜬다
              주소 입력 후   자물쇠 + 전체 주소

            ref 를 다는 이유는 포인터가 여기를 실제로 눌러야 하기 때문이다.
            좌표를 박아 두면 창 폭이 바뀔 때 빗나간다.
          */}
          <div
            ref={addressRef}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded border px-3 py-1 font-mono text-2xs transition-colors ${
              addressActive
                ? 'border-service-color/60 bg-background-color'
                : 'border-transparent bg-background-color'
            }`}
          >
            {tab === 'console' ? (
              <span className="truncate text-tertiary-text-color">{CONSOLE_URL}</span>
            ) : typed === '' && !loaded ? (
              <span className="truncate text-tertiary-text-color/70">
                Search or enter address
                {focused && <span className="optics-caret text-service-color">▍</span>}
              </span>
            ) : (
              <>
                {/*
                  타이핑 중에는 자물쇠를 감춘다. 주소를 다 치기도 전에 인증서가
                  확인된 것처럼 보이면 거짓말이다.
                */}
                {loaded && <Lock className="h-2.5 w-2.5 shrink-0 text-success-color" />}
                <span className="truncate text-primary-text-color">
                  {typed}
                  {!loaded && <span className="optics-caret text-service-color">▍</span>}
                </span>
              </>
            )}
          </div>
        </div>

        {/*
          높이는 폭과 함께 창의 생김새를 정한다. 폭만 넓히면 창이 '화면'이 아니라
          '띠'로 보이므로, 폭이 커지는 구간에서 높이도 같이 올려 비율을 지킨다.

          Hero 의 데모 래퍼가 max-w-5xl(1024px) → max-w-6xl(1152px)로 넓어졌다.
          크롬(탭바+주소창 약 76px)까지 합친 가로세로비를 계산해 보면
            이전  1024 / (416 + 76) = 2.08 : 1
            지금  1152 / (480 + 76) = 2.07 : 1
          로 사실상 같다.

          lg 미만에서 26rem 을 유지하는 이유: 그 폭에서는 창이 뷰포트에 막혀
          넓어지지 않는다. 높이만 키우면 모바일에서 세로로 길쭉한 창이 된다.
        */}
        <div className="relative h-[26rem] bg-background-color lg:h-[30rem]">
          {/* 콘솔 탭 */}
          <div
            className={`absolute inset-0 flex transition-opacity duration-200 ${
              tab === 'console' ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* 사이드바는 모든 화면에서 유지된다. 실제 콘솔과 같다. */}
            <Sidebar />

            {/* 본문만 교차 전환하고, 모달은 목록 위에 겹친다. */}
            <div ref={contentRef} className="relative min-w-0 flex-1">
              <div
                className={`absolute inset-0 overflow-hidden transition-opacity duration-200 ${
                  phase === 'detail' ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <ListScreen
                  registerRef={registerRef}
                  pressed={clicking && cursor === 'register'}
                />
              </div>

              <div
                className={`absolute inset-0 overflow-hidden transition-opacity duration-150 ${
                  phase === 'modal' ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <DeployModal
                  deployRef={deployRef}
                  pressed={clicking && cursor === 'deploy'}
                />
              </div>

              <div
                className={`absolute inset-0 overflow-hidden transition-opacity duration-200 ${
                  phase === 'detail' ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <DetailScreen entries={entries} status={status} now={now} />
              </div>
            </div>
          </div>

          {/* 서비스 탭 */}
          <div
            className={`absolute inset-0 transition-opacity duration-200 ${
              tab === 'site' ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <SitePage loaded={loaded} />
          </div>
        </div>

        {/*
          포인터. 요소의 좌상단이 화살표 끝이므로, 목표 지점에서 끝점 오프셋만큼 뺀다.
          자리를 옮길 때는 사람 손처럼 출발·도착에서 느려지도록 ease-in-out 을 쓴다.

          이 duration 은 TIMELINE 의 가장 짧은 이동 단계 hold(380 × PACE ≒ 500ms)보다
          짧아야 한다. 길면 포인터가 목표에 닿기 전에 다음 단계로 넘어가 허공에서
          클릭한다. PACE 를 1 아래로 낮출 일이 생기면 이 값도 같이 줄여야 한다.

          창 전체를 기준으로 둔다. 새 탭 버튼은 크롬에 있고 배포 버튼은 본문에
          있어서, 본문 기준으로 두면 크롬까지 올라가지 못한다.
        */}
        {cursorPoint !== null && (
          <span
            className="pointer-events-none absolute z-30 transition-all duration-[400ms] ease-in-out"
            style={{
              left: cursorPoint.x - CURSOR_TIP.x,
              top: cursorPoint.y - CURSOR_TIP.y,
              opacity: cursor === undefined ? 0 : 1,
            }}
          >
            <span className="relative block">
              {/*
                클릭 파문은 포인터 끝점에서 퍼진다.
                누르는 대상이 둘 다 주황 버튼이라 액센트 색으로 그리면 배경에 묻힌다.
                흰색으로 그려야 주황 위에서도, 어두운 배경 위에서도 보인다.
                포인터보다 뒤에 깔아 화살표를 가리지 않게 한다.
              */}
              {clicking && (
                <span
                  className="optics-click absolute -z-10 h-7 w-7 rounded-full border border-white bg-white/12"
                  style={{ left: `${CURSOR_TIP.x}px`, top: `${CURSOR_TIP.y}px` }}
                />
              )}

              <CursorArrow pressed={clicking} />
            </span>
          </span>
        )}
      </div>

      {/*
        결과 줄. 데모가 끝나면 나타난다.

        공개 주소는 이제 주소창이 직접 보여주므로 여기서 되풀이하지 않는다.
        대신 주소창이 말하지 못하는 것 — 그 주소가 어떤 대가도 없이 열렸다는
        사실 — 만 남긴다.

        aria-hidden 을 풀어 실제로 읽히게 한다. 위쪽 목업은 장식이지만
        이 문장은 정보다. 목업의 탭 전환을 못 쓰는 사람도 결론은 여기서 얻는다.
      */}
      <div
        className={`mt-4 flex flex-col items-center gap-3 transition-opacity duration-500 sm:flex-row sm:justify-between ${
          done ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/*
          자동 재생은 한 번이면 충분하다. 다만 스크롤하다 놓친 사람에게
          되돌릴 방법은 있어야 한다. 단계별 탐색까지는 두지 않는다 —
          9.4초짜리 장식에 수동/자동 상태를 하나 더 만들 값이 아니다.
        */}
        <button
          type="button"
          onClick={replay}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-color px-3 py-1.5 text-xs text-secondary-text-color transition-colors hover:border-border-strong-color hover:text-primary-text-color"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          데모 다시 보기
        </button>
      </div>
    </>
  )
}
