/**
 * 방향 비교 다이어그램.
 *
 * 전하려는 것은 하나다 — 방화벽은 '들어오는' 연결만 막고 '나가는' 연결은 막지 않는다.
 * 그래서 화살표의 방향 자체가 이 그림의 내용이다. 왼쪽은 벽에 부딪히고,
 * 오른쪽은 안쪽에서 밖으로 나가므로 통과한다.
 */
export default function TunnelComparison() {
  return (
    <svg
      viewBox="0 0 920 290"
      className="h-auto w-full min-w-[720px]"
      role="img"
      aria-labelledby="tunnel-comparison-title tunnel-comparison-desc"
    >
      <title id="tunnel-comparison-title">일반 배포 플랫폼과 OPTiCS의 연결 방향 비교</title>
      <desc id="tunnel-comparison-desc">
        일반적인 배포 플랫폼은 Hub가 Agent로 요청을 전송하기 때문에 NAT·방화벽에 차단됩니다.
        OPTiCS는 Agent가 Hub로 먼저 연결하고, 명령은 그 연결을 역방향으로 통과합니다.
      </desc>

      <defs>
        <marker id="arrow-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-danger-color)" />
        </marker>
        <marker id="arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-service-color)" />
        </marker>
        <marker id="arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-secondary-text-color)" />
        </marker>

        {/* 방화벽 / NAT 경계 */}
        <pattern id="wall-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-border-strong-color)" strokeWidth="3" />
        </pattern>
      </defs>

      {/* ───────────── 왼쪽: 일반적인 구조 ───────────── */}
      <text x="20" y="26" fill="var(--color-tertiary-text-color)" fontSize="13" fontWeight="600">
        일반적인 배포 플랫폼
      </text>

      <rect x="20" y="96" width="112" height="58" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />
      <text x="76" y="130" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="14" fontWeight="600">Hub</text>

      <rect x="238" y="62" width="14" height="126" fill="url(#wall-hatch)" />
      <text x="245" y="208" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="11">NAT · 방화벽</text>

      <rect x="316" y="96" width="112" height="58" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />
      <text x="372" y="130" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="14" fontWeight="600">Agent</text>

      <line x1="132" y1="125" x2="226" y2="125" stroke="var(--color-danger-color)" strokeWidth="2" markerEnd="url(#arrow-danger)" />
      <g stroke="var(--color-danger-color)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="238" y1="118" x2="252" y2="132" />
        <line x1="252" y1="118" x2="238" y2="132" />
      </g>

      <text x="20" y="244" fill="var(--color-secondary-text-color)" fontSize="13">
        Hub가 Agent에게 요청을 전송합니다.
      </text>
      <text x="20" y="264" fill="var(--color-secondary-text-color)" fontSize="13">
        공인 IP나 포트포워딩이 없으면 도달하지 못합니다.
      </text>

      {/* 구분선 */}
      <line x1="460" y1="10" x2="460" y2="280" stroke="var(--color-border-color)" strokeDasharray="3 5" />

      {/* ───────────── 오른쪽: OPTiCS ───────────── */}
      <text x="492" y="26" fill="var(--color-service-color)" fontSize="13" fontWeight="600">
        OPTiCS
      </text>

      <rect x="492" y="96" width="112" height="58" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />
      <text x="548" y="130" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="14" fontWeight="600">Hub</text>

      <rect x="710" y="62" width="14" height="126" fill="url(#wall-hatch)" />
      <text x="717" y="208" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="11">NAT · 방화벽</text>

      <rect x="788" y="96" width="112" height="58" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />
      <text x="844" y="130" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="14" fontWeight="600">Agent</text>

      {/* ① Agent → Hub : 안에서 밖으로 나가는 연결이라 벽을 통과한다 */}
      <line x1="788" y1="112" x2="608" y2="112" stroke="var(--color-service-color)" strokeWidth="2" markerEnd="url(#arrow-accent)" />
      <text x="698" y="102" textAnchor="middle" fill="var(--color-service-color)" fontSize="11" fontWeight="600">
        ① 먼저 연결
      </text>

      {/* ② 명령은 이미 열린 그 연결을 거꾸로 타고 내려간다 */}
      <line x1="608" y1="142" x2="784" y2="142" stroke="var(--color-secondary-text-color)" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#arrow-muted)" />
      <text x="698" y="163" textAnchor="middle" fill="var(--color-secondary-text-color)" fontSize="11">
        ② 명령은 해당 연결을 역방향으로
      </text>

      <text x="492" y="244" fill="var(--color-secondary-text-color)" fontSize="13">
        Agent가 먼저 Hub로 연결합니다.
      </text>
      <text x="492" y="264" fill="var(--color-secondary-text-color)" fontSize="13">
        방화벽은 아웃바운드 연결을 차단하지 않습니다.
      </text>
    </svg>
  )
}
