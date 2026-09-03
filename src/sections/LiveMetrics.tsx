import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Box, Download, Globe } from 'lucide-react'
import { useInView, useReducedMotion } from '../hooks/useInView'
import { usePlatformStats } from '../hooks/usePlatformStats'
import { refreshStats, type PlatformStats } from '../lib/platformStats'

/**
 * 실시간 메트릭 — Hub의 `/v1/stats/public`에서 받은 값 넷을 그대로 보여준다.
 *
 * 이 컴포넌트는 섹션이 아니라 Hero 바로 아래 띠(TrustBar)의 내용물이다. 원래 그 자리에는
 * 코드에 박아 둔 사실 넷(0개 · ₩0 · 내 서버 · 1줄)이 있었는데, 같은 질문("믿을 만한가")에
 * 실측값으로 답하는 편이 낫다고 보고 자리를 넘겨받았다. 껍데기와 하단 고지 줄은
 * TrustBar.tsx 가 그린다.
 *
 * 요청과 파싱은 이 파일이 하지 않는다. 같은 응답의 version 필드를 페이지 곳곳(Hero 배지 ·
 * 현재 상태 · Closing · Footer · 비교 표)이 함께 쓰기 때문에, 요청은 lib/platformStats.ts
 * 한 곳이 소유하고 여기서는 구독만 한다. 폴링 주기를 여기서 재촉하는 것은 이 띠가 화면에
 * 있을 때만 값이 흘러야 하기 때문이다.
 *
 * 이 페이지에서 가장 위험한 자리다. 다른 곳의 숫자는 코드에 박힌 사실이라 언제 봐도 참이지만,
 * 여기는 매 순간 바뀌는 실제 서비스 상태를 남에게 보여준다. API가 죽었거나 모양이 바뀌었는데도
 * 뭔가를 그리면 그건 더 이상 "확인 가능한 사실"이 아니라 지어낸 값이다. 그래서 실패 시 정책은
 * 하나뿐이다 — 0도, 대시(-)도, 에러 문구도 없이 통째로 사라진다(return null). 띠 자체는
 * 남으므로(고지 줄과 GitHub 링크) 화면에 구멍이 나지 않는다.
 */

const POLL_INTERVAL_MS = 30_000

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/**
 * BigInt 바이트 값을 사람이 읽는 단위로 바꾼다. 1024 배씩 나눠 단위를 정하는
 * 동안은(while 루프) BigInt 나눗셈만 쓴다 — BigInt는 소수를 못 담으므로
 * 이 단계에서 소수점까지 계산하려 하면 안 된다.
 *
 * 단위가 정해진 뒤에야 Number(bytes)로 내려와 소수 한 자리를 계산한다.
 * 이 변환이 Number.MAX_SAFE_INTEGER를 넘는 값에서도 화면에 보이는 자리수
 * 기준으로는 안전하다 — IEEE-754 double은 정수를 정확히 표현하는 한계(2^53)를
 * 넘어도 약 15~17자리의 유효숫자는 유지한다. 여기서 화면에 내보내는 건
 * "1,234.5 TB" 같은 유효숫자 5~6자리짜리 문자열뿐이라, 절대값이 아무리
 * 커져도 소수 첫째 자리까지는 흔들리지 않는다. 잃는 것은 '정확한 바이트 수
 * 그 자체'뿐이고, 애초에 그 정밀도로 사람이 읽을 수 있는 화면이 아니다.
 */
function formatBytes(bytes: bigint): string {
  if (bytes < 1024n) return `${bytes.toString()} B`

  let unitIndex = 0
  let scaled = bytes
  while (scaled >= 1024n && unitIndex < BYTE_UNITS.length - 1) {
    scaled /= 1024n
    unitIndex += 1
  }

  const divisor = 1024 ** unitIndex
  const display = Number(bytes) / divisor
  return `${display.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} ${BYTE_UNITS[unitIndex]}`
}



type TileKey = 'containers' | 'traffic' | 'domains' | 'agents'

const TILE_ORDER: TileKey[] = ['containers', 'traffic', 'domains', 'agents']

const TILE_ICON: Record<TileKey, typeof Box> = {
  containers: Box,
  traffic: ArrowLeftRight,
  domains: Globe,
  agents: Download,
}

/*
  트래픽 라벨을 그냥 "트래픽"이라고 쓰지 않는다. 이 값의 출처는 Cloudflare
  엣지 분석의 edgeResponseBytes 이고, 그건 엣지가 방문자에게 **내보낸** 응답
  바이트만 센다. 올라온 요청 바이트는 들어 있지 않다. "총 트래픽"이라고 적으면
  양방향 합계를 말하는 것이 되어 실제보다 큰 범위를 주장하게 된다.

  기간도 "최근 30일"로 박아 두지 않는다. Hub가 Cloudflare 동기화를 시작한 지
  얼마 안 됐다면 trafficWindowDays 가 30이 아니라 7 같은 값으로 올 수 있고,
  그 상태에서 "30일"이라고 쓰면 갖고 있지도 않은 기간을 가진 척하는 셈이 된다.
  그래서 기간은 항상 응답의 trafficWindowDays 를 그대로 따라간다(tileSubLabel).
*/
function tileLabel(key: TileKey): string {
  switch (key) {
    case 'containers': return '현재 서비스 중인 컨테이너'
    case 'traffic': return 'OPTiCS Gateway에서 내보내진 트래픽'
    case 'domains': return '활성화된 서브도메인'
    case 'agents': return '지금까지 설치된 Agent'
  }
}

/** 트래픽 타일에만 붙는 기간 보조 설명. 다른 타일은 항상 null이다. */
function tileSubLabel(key: TileKey, stats: PlatformStats): string | null {
  if (key !== 'traffic' || !stats.trafficAvailable) return null
  return `최근 ${stats.trafficWindowDays}일`
}

function tileValue(key: TileKey, stats: PlatformStats): string {
  switch (key) {
    case 'containers': return `${stats.runningContainers.toLocaleString('ko-KR')}개`
    case 'domains': return `${stats.activeWorkspaceDomains.toLocaleString('ko-KR')}개`
    case 'agents': return `${stats.installedAgents.toLocaleString('ko-KR')}개`
    case 'traffic':
      // trafficAvailable이 true인 타일만 visibleTiles에 남으므로 이 분기는 항상 도달 가능하다.
      return stats.trafficAvailable ? formatBytes(stats.trafficBytes) : ''
  }
}

/**
 * 값이 바뀐 순간 잠깐 옅어졌다 돌아오는 것으로 '갱신됐다'는 신호를 준다.
 * 깜빡임(요소를 지웠다 그리기)이나 재마운트가 아니라 opacity 전환 하나뿐이다 —
 * 숫자가 통째로 사라졌다 나타나면 그 잠깐 동안 레이아웃을 다시 재는 부담이
 * 생기고, 리더에게는 값이 아예 없어졌다 온 것처럼 들릴 수 있다.
 * prefers-reduced-motion 에서는 아예 옅어지지 않는다.
 */
function useHighlightOnChange(value: string, disabled: boolean): boolean {
  const previous = useRef(value)
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    if (disabled) return

    setHighlighted(true)
    const id = window.setTimeout(() => setHighlighted(false), 500)
    return () => window.clearTimeout(id)
  }, [value, disabled])

  return highlighted
}

function MetricTile({ tileKey, stats, reducedMotion }: {
  tileKey: TileKey
  stats: PlatformStats | null
  reducedMotion: boolean
}) {
  const Icon = TILE_ICON[tileKey]
  const loading = stats === null
  const value = loading ? '' : tileValue(tileKey, stats)
  const subLabel = loading ? null : tileSubLabel(tileKey, stats)
  const highlighted = useHighlightOnChange(value, loading || reducedMotion)

  /*
    dl 안에서 dt 는 '용어'이고 dd 는 '그 용어의 값'이다. 그러므로 지표 이름이 dt,
    숫자가 dd 여야 한다 — 눈에는 숫자가 먼저 크게 보이지만 그건 시각적 순서일
    뿐이고, 마크업까지 뒤집으면 스크린 리더가 "12개"를 용어로 읽고 "현재 서비스
    중인 컨테이너"를 그 설명으로 읽는다. DOM 순서는 dt → dd 로 두고(그래야 유효한
    문서다) flex order 로 화면에 보이는 순서만 뒤집는다.

    기간 보조설명은 dt 안에 넣는다. dl > div 안에는 dt 와 dd 말고 다른 요소를 둘
    수 없고, 의미로 봐도 "최근 30일"은 값이 아니라 지표 이름을 한정하는 말이다.
  */
  return (
    <div className="flex flex-col border-l border-border-color pl-4 sm:pl-5">
      <Icon className="order-1 h-4 w-4 text-tertiary-text-color" aria-hidden />

      {/*
        높이를 고정해 스켈레톤 → 실제 값으로 바뀔 때 세로로 밀리지 않게 한다.
        font-mono 는 쓰지 않는다 — 값이 전부 "12개" 처럼 숫자+한글 단위 조합이라
        TrustBar 의 동종 숫자(0개 · ₩0 · 1줄)와 같은 처리를 따른다. 자릿수가
        바뀔 때 폭이 흔들리지 않게 하는 역할은 tabular-nums 만으로 충분하다.
      */}
      <dd
        className={`order-2 mt-2 flex h-7 items-center text-xl font-bold tabular-nums tracking-tight text-primary-text-color transition-opacity duration-500 sm:h-8 sm:text-2xl ${
          highlighted ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {loading ? (
          <span
            aria-hidden
            className="h-6 w-20 animate-pulse rounded bg-surface-hover-color sm:h-7 sm:w-24"
          />
        ) : (
          value
        )}
      </dd>

      <dt className="order-3 mt-1.5 text-xs leading-relaxed text-tertiary-text-color">
        {tileLabel(tileKey)}
        {/*
          기간 보조설명 자리를 항상 예약해 둔다. 트래픽 타일에만 내용이 들어가고
          나머지 타일은 늘 비어 있지만, 자리 자체는 넷 모두 동일해야 행 높이가
          타일마다 들쭉날쭉해지지 않는다.
        */}
        <span className="mt-0.5 block h-4 text-3xs leading-relaxed text-tertiary-text-color/80">
          {subLabel ?? '\u00a0'}
        </span>
      </dt>
    </div>
  )
}

export default function LiveMetrics() {
  // dl(타일 그리드)을 관찰 대상으로 삼는다. TrustBar 의 <section> 은 이 컴포넌트 밖이라
  // 잡을 수 없고, 잡을 필요도 없다 — 갱신되는 것은 이 영역뿐이다.
  const gridRef = useRef<HTMLDListElement>(null)
  const reducedMotion = useReducedMotion()
  const inView = useInView(gridRef)
  const snapshot = usePlatformStats()

  /*
    30초 폴링. 화면 밖으로 나가면(inView === false) 인터벌 자체를 걷어낸다 — 백그라운드 탭에
    남은 마케팅 페이지가 계속 Hub를 두드리게 두지 않는다.

    화면 안으로 들어온 순간에도 한 번 재촉한다. refreshStats 가 '마지막 갱신이 한 주기보다
    오래됐을 때만' 실제로 요청하므로, 최초 로드 직후에 들어와도 같은 요청을 두 번 보내지 않고,
    아래를 한참 보다 올라온 경우에는 묵은 값을 30초 더 들고 있지 않는다.
  */
  useEffect(() => {
    if (!inView) return

    refreshStats(POLL_INTERVAL_MS)
    const id = window.setInterval(() => refreshStats(POLL_INTERVAL_MS), POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [inView])

  if (snapshot.status === 'disabled' || snapshot.status === 'failed') return null

  const stats = snapshot.status === 'ready' ? snapshot.stats : null

  /*
    로딩 중에는 넷 다 스켈레톤으로 보여준다. 트래픽 타일이 나중에 사라질 수 있다는 것은 알지만,
    그 판단에 필요한 trafficAvailable 자체가 응답이 오기 전까지는 없다 — 근거 없이 미리 세 칸으로
    줄이는 것도 지어내는 일이다.
  */
  const visibleTiles = stats === null
    ? TILE_ORDER
    : TILE_ORDER.filter(key => key !== 'traffic' || stats.trafficAvailable)

  return (
    <>
      {/*
        아래 고지 줄과의 경계선을 이 dl 이 직접 갖는다. 띠(TrustBar) 쪽에 두면 메트릭이
        사라졌을 때 선과 여백만 남아 허공에 줄이 그어진다.
      */}
      <dl
        ref={gridRef}
        className={`mt-4 mb-9 grid grid-cols-2 gap-x-6 gap-y-8 border-b border-border-color pb-9 sm:gap-x-8 ${
          visibleTiles.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {visibleTiles.map(key => (
          <MetricTile key={key} tileKey={key} stats={stats} reducedMotion={reducedMotion} />
        ))}
      </dl>
    </>
  )
}
