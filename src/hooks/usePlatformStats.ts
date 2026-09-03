import { useSyncExternalStore } from 'react'
import { getStatsSnapshot, subscribeStats, type StatsSnapshot } from '../lib/platformStats'

/**
 * Hub의 공개 통계 스냅샷을 구독한다.
 *
 * useSyncExternalStore 를 쓰는 이유: 저장소가 React 밖에 있고(lib/platformStats.ts),
 * StrictMode 의 이중 마운트나 동시 렌더 중에도 모든 구독자가 같은 값을 보게 해야 한다.
 * useState + useEffect 로 흉내 내면 구독 시점이 어긋나 화면마다 다른 버전이 잠깐 보일 수 있다.
 */
export function usePlatformStats(): StatsSnapshot {
  return useSyncExternalStore(subscribeStats, getStatsSnapshot, getStatsSnapshot)
}

/**
 * 화면에 적을 버전 문자열. 아직 못 받았거나 못 받게 됐으면 null 이다.
 *
 * 못 받았을 때 예전 값을 대신 쓰지 않는다. 버전을 코드에 박아 두는 것이 바로 이번에 없앤
 * 문제라서, 폴백을 두면 그 값이 그대로 낡은 채로 남아 페이지가 틀린 버전을 주장하게 된다.
 * 버전을 못 구했으면 그 문장에서 버전만 빠진다 — 이 훅을 쓰는 쪽이 그 처리를 한다.
 */
export function usePlatformVersion(): string | null {
  const snapshot = usePlatformStats()
  return snapshot.status === 'ready' ? snapshot.stats.version : null
}

/**
 * 릴리즈 단계 표기.
 *
 * 버전 숫자만으로는 0.7.1 이 '아직 정식이 아니다'라는 뜻인지 방문자가 알 수 없다. 숫자 뒤에
 * 단계를 붙여 그 판단 근거를 같이 준다.
 *
 * 이 값은 Hub 가 아니라 랜딩이 갖고 있다. 숫자는 package.json 에서 자동으로 따라오지만
 * 단계는 사람이 정하는 것이라 출처가 다르다. 대신 상수 한 곳에만 둔다 — 정식 출시 때
 * 이 줄만 지우면 다섯 군데가 한꺼번에 따라온다. Hub 응답에 channel 필드를 만들어 옮기는
 * 것도 가능하지만, 그건 Hub 가 자기 릴리즈 단계를 아는 구조가 먼저 필요하다.
 */
const RELEASE_CHANNEL = 'Open Beta'

/**
 * 화면에 그대로 찍는 버전 표기(예: `0.7.1 Open Beta`).
 *
 * `v` 접두사는 붙이지 않는다. 페이지 안에서 어떤 곳은 `v0.7.1`, 어떤 곳은 `0.7.1` 이던 것을
 * 한 형태로 통일한 결과다. 버전을 못 받아왔으면 null 이고, 쓰는 쪽은 그 조각을 통째로 뺀다.
 */
export function usePlatformVersionLabel(): string | null {
  const version = usePlatformVersion()
  return version === null ? null : `${version} ${RELEASE_CHANNEL}`
}
