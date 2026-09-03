/**
 * Hub의 `/v1/stats/public` 한 곳에서 오는 값을 페이지 전체가 나눠 쓰기 위한 저장소.
 *
 * 이 응답을 필요로 하는 곳이 둘로 나뉜다.
 *   - 실시간 메트릭(TrustBar 띠) — 30초마다 다시 받아야 한다
 *   - 버전 문자열 — Hero 배지 · 현재 상태 · Closing · Footer · 비교 표, 다섯 군데
 * 각자 fetch 하게 두면 페이지 한 번 여는 데 같은 요청이 여섯 번 나간다. 그래서 요청은
 * 이 모듈이 혼자 소유하고, 화면들은 구독만 한다.
 *
 * Context 를 쓰지 않고 모듈 수준 저장소로 둔 이유: 소비처가 index.html 과 pricing.html
 * 두 진입점에 흩어져 있고, Footer 는 지연 로드되는 별도 청크에 있다. Provider 로 감싸려면
 * 두 진입점의 트리를 모두 건드려야 하는데, 얻는 것은 같고 잃는 것은 '어느 Provider 안에
 * 있어야 한다'는 제약뿐이다.
 */

const STATS_PATH = '/v1/stats/public'

/*
  VITE_API_URL 이 없으면 이 상수가 null 이고, 아래 ensureLoaded 는 아무 것도 하지 않는다 —
  요청 자체가 한 번도 나가지 않는다. 끝의 슬래시를 미리 잘라 두는 것은 STATS_PATH 와 합칠 때
  이중 슬래시가 생기는 것을 막기 위해서다.
*/
const rawApiUrl: unknown = import.meta.env.VITE_API_URL
export const API_URL = typeof rawApiUrl === 'string' && rawApiUrl.trim() !== ''
  ? rawApiUrl.trim().replace(/\/+$/, '')
  : null

/** 숫자 필드(컨테이너 수 · 도메인 수 · Agent 수)가 공통으로 통과해야 하는 모양. */
function isFiniteNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
}

/**
 * trafficBytes는 서버에서 BigInt를 십진 문자열로 내려준다. 트래픽 총량은
 * Number.MAX_SAFE_INTEGER(약 9PB)를 어렵지 않게 넘을 수 있는 값이라, 숫자로 바로 파싱하면
 * 그 지점부터 자릿수가 조용히 틀어진다. 그래서 절대 Number()로 캐스팅하지 않고 BigInt로만
 * 다룬다. 정규식으로 '순수 십진 정수 문자열'만 통과시키는 것은 부호·소수점·지수 표기·공백이
 * 섞이면 BigInt() 가 예외를 던지거나 의미가 다른 값을 받아들일 여지가 있기 때문이다 —
 * 형식이 어긋난 순간 이 값은 신뢰할 수 없다고 보고 포기한다. 30자리 상한은 현실적인 바이트
 * 수를 아득히 넘는 길이라, 잘못된 응답이 브라우저를 멈추는 사고를 막는 방어선이다.
 */
function parseByteString(value: unknown): bigint | null {
  if (typeof value !== 'string' || value.length > 30 || !/^\d+$/.test(value)) return null
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

/**
 * 버전 문자열.
 *
 * 화면에는 접두사 없이 `0.7.1 Open Beta` 형태로 찍는다(hooks/usePlatformStats.ts). 서버가
 * `v0.7.1` 로 주더라도 `v0.7.1 Open Beta` 가 되지 않도록 여기서 접두사를 떼어 정규화한다.
 * 모양이 이상하면(빈 문자열, 지나치게 긴 값, 줄바꿈 포함)
 * 버리고 null 을 준다 — 버전은 화면에서 사라질 수 있는 값이지 아무거나 그려도 되는 값이 아니다.
 */
function parseVersion(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/^v/i, '')
  if (trimmed === '' || trimmed.length > 32 || /\s/.test(trimmed)) return null
  return trimmed
}

export type PlatformStats = {
  version: string | null
  runningContainers: number
  activeWorkspaceDomains: number
  installedAgents: number
} & (
  | { trafficAvailable: true; trafficBytes: bigint; trafficWindowDays: number }
  | { trafficAvailable: false }
)

/**
 * 응답 하나를 PlatformStats 로 좁힌다. 숫자 셋 중 하나라도 모양이 틀어지면 전체를 null 로
 * 돌려보낸다 — 절반만 믿을 수 있는 상태로 렌더링을 진행하지 않는다.
 *
 * 트래픽 셋(trafficBytes · trafficWindowDays · trafficAvailable)과 version 만 예외다.
 * Cloudflare 동기화가 아직 한 번도 성공하지 못한 배포에서는 트래픽 쪽이 통째로 없을 수 있고,
 * 구버전 Hub 에는 version 이 없을 수 있다. 둘 다 나머지 지표와는 무관한 정상 상태이므로,
 * 그 부분만 없는 것으로 처리하고 나머지는 그대로 쓴다.
 */
export function parseStats(payload: unknown): PlatformStats | null {
  if (typeof payload !== 'object' || payload === null) return null
  const root = payload as Record<string, unknown>
  const data = (
    typeof root.data === 'object' && root.data !== null ? root.data : root
  ) as Record<string, unknown>

  const runningContainers = data.runningContainers
  const activeWorkspaceDomains = data.activeWorkspaceDomains
  const installedAgents = data.installedAgents

  if (
    !isFiniteNonNegativeInteger(runningContainers)
    || !isFiniteNonNegativeInteger(activeWorkspaceDomains)
    || !isFiniteNonNegativeInteger(installedAgents)
  ) {
    return null
  }

  const base = {
    version: parseVersion(data.version),
    runningContainers,
    activeWorkspaceDomains,
    installedAgents,
  }

  const trafficBytes = parseByteString(data.trafficBytes)
  const trafficWindowDays = data.trafficWindowDays

  if (data.trafficAvailable === true && trafficBytes !== null && isFiniteNonNegativeInteger(trafficWindowDays)) {
    return { ...base, trafficAvailable: true, trafficBytes, trafficWindowDays }
  }

  return { ...base, trafficAvailable: false }
}

/** 화면들이 보는 상태. failed 는 '최초 요청이 실패했다'는 뜻이고 되돌아오지 않는다. */
export type StatsSnapshot =
  | { status: 'disabled' }
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; stats: PlatformStats }

let snapshot: StatsSnapshot = API_URL === null ? { status: 'disabled' } : { status: 'loading' }
const listeners = new Set<() => void>()
/** 마지막으로 값을 받아온 시각. 화면 밖에 있다 돌아왔을 때 얼마나 묵었는지 판단하는 데 쓴다. */
let fetchedAt = 0
let inFlight: AbortController | null = null
let started = false

function publish(next: StatsSnapshot) {
  snapshot = next
  for (const listener of listeners) listener()
}

async function load(): Promise<void> {
  if (API_URL === null) return

  inFlight?.abort()
  const controller = new AbortController()
  inFlight = controller

  try {
    const response = await fetch(`${API_URL}${STATS_PATH}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`stats ${response.status}`)

    const parsed = parseStats(await response.json() as unknown)
    if (parsed === null) throw new Error('unexpected stats shape')

    fetchedAt = Date.now()
    publish({ status: 'ready', stats: parsed })
  } catch (error) {
    if (controller.signal.aborted) return
    /*
      이미 값을 받아 둔 뒤의 실패는 화면을 되돌리지 않는다. 떠 있는 값은 방금 전까지 실제로
      유효했던 값이고, 잠깐의 네트워크 오류 하나로 지우면 오히려 더 눈에 띄는 깜빡임이 된다.
      '아예 보여주지 않는다'는 원칙은 최초 로드가 실패했을 때만 적용된다.
    */
    if (snapshot.status === 'loading') publish({ status: 'failed' })
  } finally {
    if (inFlight === controller) inFlight = null
  }
}

/** 첫 구독자가 생기는 순간 한 번만 요청한다. */
function ensureLoaded() {
  if (started || API_URL === null) return
  started = true
  void load()
}

/**
 * 값이 묵었으면 다시 받아온다. 메트릭 띠가 화면에 들어올 때와 폴링 주기마다 부른다.
 * `minAgeMs` 보다 최근에 받아온 값이면 아무 것도 하지 않으므로, 여러 화면이 동시에 불러도
 * 요청이 겹치지 않는다.
 */
export function refreshStats(minAgeMs: number) {
  if (API_URL === null || snapshot.status === 'failed') return
  if (Date.now() - fetchedAt < minAgeMs) return
  void load()
}

export function subscribeStats(listener: () => void): () => void {
  ensureLoaded()
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getStatsSnapshot(): StatsSnapshot {
  return snapshot
}
