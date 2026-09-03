/**
 * 요청 흐름 다이어그램.
 *
 * 코드 기준(OPTiCS-Hub/proxy/server.ts)으로 두 갈래를 모두 그린다.
 *  - 기본 경로: Agent가 미리 열어 둔 유휴 소켓을 꺼내 쓴다. Agent에게 명령을 보내지 않는다.
 *  - 폴백: 풀이 비었을 때만 토큰을 걸어 두고 Agent에게 터널을 열라고 시킨다.
 * 기본 경로를 굵게, 폴백을 점선으로 둬서 '보통은 위쪽'임이 한눈에 보이게 한다.
 */
export default function RequestFlow() {
  return (
    <svg
      viewBox="0 0 960 330"
      className="h-auto w-full min-w-[760px]"
      role="img"
      aria-labelledby="request-flow-title request-flow-desc"
    >
      <title id="request-flow-title">외부 요청이 서비스 컨테이너까지 도달하는 경로</title>
      <desc id="request-flow-desc">
        브라우저 요청은 Cloudflare를 거쳐 Hub의 공개 프록시에 도착합니다. 프록시는 Hub API에 라우팅 정보만 조회한 뒤,
        Agent가 미리 확보해 둔 유휴 소켓으로 요청 바이트를 그대로 전달합니다.
        유휴 소켓이 없을 때만 토큰을 등록하고 Agent에게 터널 개설을 요청합니다.
      </desc>

      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-service-color)" />
        </marker>
        <marker id="flow-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-tertiary-text-color)" />
        </marker>
      </defs>

      {/* ───── Hub API : 라우팅 조회 (본 경로 위에 얹힌 곁가지) ───── */}
      <rect x="330" y="16" width="168" height="52" rx="8" fill="var(--color-modal-box-color)" stroke="var(--color-border-color)" />
      <text x="414" y="38" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">Hub API</text>
      <text x="414" y="56" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="11">라우팅 조회 · 캐시</text>

      <path d="M 300 122 L 300 42 L 322 42" fill="none" stroke="var(--color-tertiary-text-color)" strokeWidth="1.5" markerEnd="url(#flow-arrow-muted)" />
      <path d="M 506 42 L 528 42 L 528 122" fill="none" stroke="var(--color-tertiary-text-color)" strokeWidth="1.5" markerEnd="url(#flow-arrow-muted)" />
      <text x="414" y="84" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">agent_uuid · service_port</text>

      {/* ───── 본 경로 노드 ───── */}
      <g fill="var(--color-modal-background-color)" stroke="var(--color-border-color)">
        <rect x="10" y="122" width="118" height="56" rx="8" />
        <rect x="168" y="122" width="118" height="56" rx="8" />
        <rect x="326" y="122" width="150" height="56" rx="8" />
      </g>
      <rect x="560" y="122" width="150" height="56" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-service-color)" />
      <rect x="792" y="122" width="158" height="56" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />

      <text x="69" y="156" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">브라우저</text>

      <text x="227" y="148" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">Cloudflare</text>
      <text x="227" y="165" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">*.optics.run</text>

      <text x="401" y="148" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">공개 프록시</text>
      <text x="401" y="165" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">:10000 · Host 파싱</text>

      <text x="635" y="148" textAnchor="middle" fill="var(--color-service-color)" fontSize="13" fontWeight="600">Agent 유휴 소켓</text>
      <text x="635" y="165" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">사전 확보한 풀에서 할당</text>

      <text x="871" y="148" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">서비스 컨테이너</text>
      <text x="871" y="165" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">host.docker.internal</text>

      {/* ───── 본 경로 화살표 ───── */}
      <g stroke="var(--color-service-color)" strokeWidth="2" markerEnd="url(#flow-arrow)">
        <line x1="128" y1="150" x2="160" y2="150" />
        <line x1="286" y1="150" x2="318" y2="150" />
        <line x1="476" y1="150" x2="552" y2="150" />
        <line x1="710" y1="150" x2="784" y2="150" />
      </g>
      <text x="514" y="140" textAnchor="middle" fill="var(--color-service-color)" fontSize="10" fontWeight="600">OPEN + 요청 바이트</text>
      <text x="747" y="140" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">TCP 릴레이</text>

      {/* ───── 폴백 경로 ───── */}
      <line x1="10" y1="228" x2="950" y2="228" stroke="var(--color-border-color)" strokeDasharray="3 5" />
      <text x="10" y="256" fill="var(--color-tertiary-text-color)" fontSize="12" fontWeight="600">
        풀이 비어 있을 때만 (폴백)
      </text>

      <g stroke="var(--color-tertiary-text-color)" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#flow-arrow-muted)">
        <line x1="150" y1="288" x2="278" y2="288" />
        <line x1="410" y1="288" x2="538" y2="288" />
        <line x1="676" y1="288" x2="784" y2="288" />
      </g>

      <text x="10" y="292" fill="var(--color-secondary-text-color)" fontSize="12">토큰으로 소켓 등록</text>
      <text x="288" y="292" fill="var(--color-secondary-text-color)" fontSize="12">Hub가 tunnel-connect 명령</text>
      <text x="548" y="292" fill="var(--color-secondary-text-color)" fontSize="12">Agent가 :5220에 연결</text>
      <text x="794" y="292" fill="var(--color-secondary-text-color)" fontSize="12">토큰 매칭</text>

      <text x="10" y="318" fill="var(--color-tertiary-text-color)" fontSize="11">
        Hub API와 DB는 이 경로에 없습니다. 요청 본문은 공개 프록시가 TCP로 그대로 중계합니다.
      </text>
    </svg>
  )
}
