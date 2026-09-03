/**
 * 전체 구조도.
 *
 * 기존 두 다이어그램은 각각 '연결 방향'과 '요청 한 건의 경로'를 다룬다.
 * 여기서는 그 위 단계 — 코드가 어디서 출발해 어떤 순서로 서비스가 되는지 —
 * 를 한 장에 담는다. 제어(배포)와 데이터(요청)를 위아래 두 줄로 나눠 그린다.
 *
 * 선 위에 문장을 얹지 않는다. 화살표마다 설명을 붙이면 좁은 화면에서 글자가
 * 겹치고, 겹치지 않게 줄이다 보면 무슨 말인지 알 수 없는 두 단어만 남는다.
 * 번호만 찍고 설명은 SVG 밖의 목록이 맡는다 — 그쪽은 화면 폭에 맞춰 접힌다.
 *
 * 색 규칙: 방문자의 요청이 지나는 길만 액센트다. 이 제품이 결국 증명해야 하는
 * 것이 그 경로라서, 눈이 먼저 닿아야 할 곳도 거기다.
 */
export default function SystemTopology() {
  return (
    <svg
      viewBox="0 0 990 360"
      className="h-auto w-full min-w-[760px]"
      role="img"
      aria-labelledby="system-topology-title system-topology-desc"
    >
      <title id="system-topology-title">코드가 배포되어 공개 서비스가 되기까지의 전체 구조</title>
      <desc id="system-topology-desc">
        개발자가 Console에 저장소 URL을 입력하면 Hub가 Agent에게 명령을 전달하고, Agent는 저장소를 클론해
        이미지를 빌드한 뒤 컨테이너를 기동합니다. 방문자의 요청은 Cloudflare와 Hub의 공개 프록시를 거쳐
        Agent가 개설한 터널을 통해 해당 컨테이너에 도달합니다. Hub와 프록시는 관리형이며, Agent와 컨테이너는
        NAT 뒤 사용자의 서버에 있습니다.
      </desc>

      <defs>
        <marker id="topo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-service-color)" />
        </marker>
        <marker id="topo-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-secondary-text-color)" />
        </marker>

        <pattern id="topo-wall" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-border-strong-color)" strokeWidth="3" />
        </pattern>
      </defs>

      {/* ───── NAT 경계. 이 선의 오른쪽이 전부 사용자의 서버다 ───── */}
      <rect x="520" y="24" width="14" height="300" fill="url(#topo-wall)" />
      <text x="527" y="342" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="11">
        NAT · 방화벽
      </text>

      <text x="510" y="16" textAnchor="end" fill="var(--color-tertiary-text-color)" fontSize="11" fontWeight="600">
        OPTiCS가 운영하는 영역
      </text>
      <text x="544" y="16" fill="var(--color-secondary-text-color)" fontSize="11" fontWeight="600">
        내 서버
      </text>

      {/* ───── Git 저장소 ───── */}
      <rect x="190" y="40" width="160" height="52" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-border-color)" />
      <text x="270" y="64" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">Git 저장소</text>
      <text x="270" y="81" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">github.com</text>

      {/* ───── 윗줄: 배포(제어) ───── */}
      <g fill="var(--color-modal-background-color)" stroke="var(--color-border-color)">
        <rect x="10" y="130" width="150" height="62" rx="8" />
        <rect x="360" y="130" width="134" height="62" rx="8" />
        <rect x="590" y="130" width="160" height="62" rx="8" />
      </g>
      {/* 도착점만 액센트 테두리. 이 그림의 결론이 '내 서버 안에서 돈다'이므로 */}
      <rect x="800" y="130" width="170" height="62" rx="8" fill="var(--color-modal-background-color)" stroke="var(--color-service-color)" />

      <text x="85" y="156" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">개발자</text>
      <text x="85" y="174" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">Console에서 URL 입력</text>

      <text x="427" y="156" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">OPTiCS-Hub</text>
      <text x="427" y="174" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">명령 중계</text>

      <text x="670" y="156" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">OPTiCS-Agent</text>
      <text x="670" y="174" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">Docker 생명주기</text>

      <text x="885" y="156" textAnchor="middle" fill="var(--color-service-color)" fontSize="13" fontWeight="600">서비스 컨테이너</text>
      <text x="885" y="174" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">app · mysql · redis</text>

      {/* ───── 아랫줄: 요청(데이터) ───── */}
      <g fill="var(--color-modal-background-color)" stroke="var(--color-border-color)">
        <rect x="10" y="248" width="150" height="62" rx="8" />
        <rect x="190" y="248" width="140" height="62" rx="8" />
        <rect x="360" y="248" width="134" height="62" rx="8" />
      </g>

      <text x="85" y="274" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">방문자</text>
      <text x="85" y="292" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">브라우저</text>

      <text x="260" y="274" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">Cloudflare</text>
      <text x="260" y="292" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">*.optics.run</text>

      <text x="427" y="274" textAnchor="middle" fill="var(--color-primary-text-color)" fontSize="13" fontWeight="600">공개 프록시</text>
      <text x="427" y="292" textAnchor="middle" fill="var(--color-tertiary-text-color)" fontSize="10">:10000</text>

      {/* ───── 제어 경로 (흐린 선) ───── */}
      <g stroke="var(--color-secondary-text-color)" strokeWidth="1.6" fill="none" markerEnd="url(#topo-arrow-muted)">
        {/* ① 개발자 → Hub */}
        <line x1="160" y1="161" x2="352" y2="161" />
        {/* ② Hub → Agent. Agent가 미리 맺어 둔 연결을 거꾸로 타고 내려간다 */}
        <line x1="494" y1="161" x2="582" y2="161" strokeDasharray="5 4" />
        {/* ③ Agent → 저장소 클론. 나가는 연결이라 방화벽을 그대로 지난다 */}
        <path d="M 670 130 L 670 66 L 358 66" strokeDasharray="5 4" />
      </g>

      {/* ④ Agent → 컨테이너 (빌드 · 기동) */}
      <line x1="750" y1="161" x2="792" y2="161" stroke="var(--color-secondary-text-color)" strokeWidth="1.6" markerEnd="url(#topo-arrow-muted)" />

      {/* ───── 요청 경로 (액센트) ───── */}
      <g stroke="var(--color-service-color)" strokeWidth="2" fill="none" markerEnd="url(#topo-arrow)">
        <line x1="160" y1="279" x2="182" y2="279" />
        <line x1="330" y1="279" x2="352" y2="279" />
        {/* ⑤ 프록시 → 터널 → Agent. 벽을 지나 위로 꺾여 Agent 로 들어간다 */}
        <path d="M 494 279 L 670 279 L 670 200" />
      </g>

      {/* ───── 번호. 설명은 SVG 밖 목록이 맡는다 ───── */}
      <g fontSize="11" fontWeight="700" textAnchor="middle">
        <circle cx="256" cy="161" r="10" fill="var(--color-background-color)" stroke="var(--color-border-strong-color)" />
        <text x="256" y="165" fill="var(--color-secondary-text-color)">1</text>

        <circle cx="558" cy="161" r="10" fill="var(--color-background-color)" stroke="var(--color-border-strong-color)" />
        <text x="558" y="165" fill="var(--color-secondary-text-color)">2</text>

        <circle cx="670" cy="98" r="10" fill="var(--color-background-color)" stroke="var(--color-border-strong-color)" />
        <text x="670" y="102" fill="var(--color-secondary-text-color)">3</text>

        <circle cx="771" cy="161" r="10" fill="var(--color-background-color)" stroke="var(--color-border-strong-color)" />
        <text x="771" y="165" fill="var(--color-secondary-text-color)">4</text>

        <circle cx="580" cy="279" r="10" fill="var(--color-background-color)" stroke="var(--color-service-color)" />
        <text x="580" y="283" fill="var(--color-service-color)">5</text>
      </g>
    </svg>
  )
}
