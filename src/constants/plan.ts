/**
 * 요금제 한도의 단일 출처.
 *
 * 이 값이 배너·요금 카드·FAQ 세 곳에 흩어져 있었고, 실제로 한 곳만 다른 숫자를
 * 들고 있었다(카드 3개 / 나머지 5개). 요금은 방문자가 가장 엄격하게 대조하는
 * 정보라 한 군데만 어긋나도 제품 전체의 신뢰가 깎인다.
 *
 * pricing.html 의 meta description 은 정적 HTML 이라 이 상수를 읽지 못한다.
 * 숫자를 바꾸면 그 파일도 함께 고쳐야 한다.
 *
 * 주의 — 이 한도는 아직 코드로 강제되지 않는다. Hub 의 SUBDOMAIN_ACTIVE_LIMIT 는
 * 사용자별이 아니라 전역 한도다(countActiveSubdomains() 가 전체를 센다).
 * 지금은 정책 선언이지 구현된 제약이 아니다.
 */
export const WORKSPACE_DOMAIN_LIMIT = 3
