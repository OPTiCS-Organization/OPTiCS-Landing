import { AlertTriangle, Check, Minus } from 'lucide-react'
import { usePlatformVersionLabel } from '../hooks/usePlatformStats'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'

/**
 * "ngrok / Cloudflare Tunnel / Tailscale / Coolify 같은 걸 이미 쓰는데 왜 OPTiCS인가"
 * — 리뷰에서 반복해서 나온 질문에 답하는 섹션.
 *
 * 특정 제품의 기능·가격·한도는 확인할 방법이 없으므로 단정하지 않는다.
 * 대신 접근 방식(카테고리) 셋을 비교한다. 제품 이름은 헤더의 '예:' 한 줄에만
 * 등장하고, 행의 서술은 전부 카테고리 일반론이다.
 *
 *   외부 터널 서비스  — 연결만 뚫는다. 배포는 다른 도구의 몫이다.
 *   셀프호스팅 PaaS   — 배포는 자동화하지만, 대상 서버까지 닿는 경로는 스스로 마련해야 한다.
 *   OPTiCS           — 위 둘을 한 제품 안에서 처리한다.
 *
 * OPTiCS 열도 전부 초록으로 칠하지 않는다. 요청이 Hub의 공개 프록시를 지난다는 것과
 * 아직 v0.7.1이라는 것, 두 가지는 있는 그대로 남긴다. 정직함이 이 표의 무기다.
 */

type CategoryKey = 'tunnel' | 'paas' | 'optics'

type Category = {
  key: CategoryKey
  name: string
  /** 특정 제품은 예시로만 언급한다. 서술 자체는 카테고리 일반론이어야 한다. */
  example?: string
  /** OPTiCS 열만 액센트 테두리로 강조한다. */
  accent?: boolean
}

const CATEGORIES: Category[] = [
  { key: 'tunnel', name: '외부 터널 서비스', example: '예: ngrok, Cloudflare Tunnel' },
  { key: 'paas', name: '셀프호스팅 PaaS', example: '예: Coolify, Dokploy' },
  { key: 'optics', name: 'OPTiCS', accent: true },
]

/**
 * 셀의 색과 기호.
 *
 * Pricing 섹션의 규칙을 그대로 빌린다 — 색이 판단을 대신하므로 표를 읽지
 * 않고 훑기만 해도 결론이 남는다. 다만 여기서는 'OPTiCS가 항상 초록'이
 * 아니다. 같은 행 안에서도 카테고리마다 진짜로 유리한 쪽이 다르기
 * 때문이다(예: '요청이 지나는 곳' 행은 OPTiCS가 아니라 셀프호스팅 PaaS가 초록이다).
 *
 * 기호를 함께 두는 이유: 초록과 주황은 적록색약에서 구분되지 않는다.
 * 색이 나르던 정보를 형태가 한 번 더 나른다. 아래 범례가 3차 대비책이다.
 */
type Tone = 'good' | 'cost' | 'na'

const TONE_CLASS: Record<Tone, string> = {
  good: 'bg-success-color/12 text-success-color',
  cost: 'bg-warning-color/12 text-warning-color',
  na: 'bg-modal-box-color text-tertiary-text-color',
}

const TONE_ICON: Record<Tone, typeof Check> = {
  good: Check,
  cost: AlertTriangle,
  na: Minus,
}

type Cell = { text: string; note?: string; tone: Tone }
type Row = { label: string; cells: Record<CategoryKey, Cell> }

/**
 * 성숙도 행의 버전 자리.
 *
 * ROWS 는 모듈 수준 상수라 훅을 부를 수 없다. 그래서 자리만 표시해 두고, 렌더링 직전에
 * Hub 에서 받은 실제 버전으로 바꿔 끼운다(withVersion). 버전을 못 받아왔으면 그 조각을
 * 통째로 지운다 — 문장이 '준비 중인 기능이 남아 있음' 으로 짧아질 뿐 뜻은 그대로다.
 */
const VERSION_SLOT = '__VERSION__'

function withVersion(rows: Row[], versionLabel: string | null): Row[] {
  return rows.map(row => {
    const cells = Object.fromEntries(
      Object.entries(row.cells).map(([key, cell]) => [
        key,
        cell.text.includes(VERSION_SLOT)
          ? { ...cell, text: cell.text.replace(VERSION_SLOT, versionLabel === null ? '' : `${versionLabel}. `) }
          : cell,
      ]),
    ) as Record<CategoryKey, Cell>
    return { ...row, cells }
  })
}

const ROWS: Row[] = [
  {
    label: '연결 방향',
    cells: {
      /*
       * 여기는 초록이 맞다. 터널 서비스도 역방향으로 연결하고, 그래서 우리와 똑같이
       * NAT 문제를 푼다. 같은 성질을 우리 열에서만 초록으로 칠하면 표 전체가
       * 광고로 읽히고, 그 순간 나머지 여덟 행의 신빙성까지 같이 깎인다.
       *
       * 방향만 적으면 처음 보는 사람에게는 아무 의미가 없다. 그래서 방향 뒤에
       * 그 방향이 만들어 내는 결과를 괄호로 붙인다.
       */
      tunnel: { tone: 'good', text: '역방향 (→ 공인 IP 불필요)' },
      paas: {
        tone: 'cost',
        text: '관리 서버를 따로 두면 정방향 (→ 접근 경로 필요)',
        note: '사용자 서버에 직접 설치하는 방식에는 해당하지 않습니다',
      },
      optics: { tone: 'good', text: '역방향 (→ 공인 IP 불필요)' },
    },
  },
  /*
   * 원래 '대상 서버에서 열어야 할 것' 한 행에 뭉쳐 있었는데, 그 행의 OPTiCS 칸이
   * 그냥 '없음'이었다. 터널 에이전트 설치는 세면서 우리 Agent 설치는 세지 않은
   * 이중 기준이다. 아는 사람은 바로 알아본다.
   *
   * 두 행으로 쪼개면 이중 기준이 사라지고, 오히려 진짜 차이가 드러난다 —
   * 셋 다 무언가를 설치하지만, 우리가 설치하는 것만 배포와 실행까지 맡는다.
   */
  {
    label: '공인 IP · 포트 개방',
    cells: {
      tunnel: { tone: 'good', text: '불필요' },
      paas: { tone: 'cost', text: '사용자 서버에 접근할 경로 필요 (공인 IP · 개방 포트 · SSH 중 하나)' },
      optics: { tone: 'good', text: '불필요' },
    },
  },
  {
    label: '내 서버에 설치하는 것',
    cells: {
      /* 셋 다 설치가 필요하다. 우열이 아니라 성격의 차이라 색을 주지 않는다. */
      tunnel: { tone: 'na', text: '제공사 에이전트 (연결만 담당)' },
      paas: { tone: 'na', text: 'PaaS 본체 또는 데몬' },
      optics: { tone: 'na', text: 'Agent 컨테이너와 Docker (배포 · 실행까지 담당)' },
    },
  },
  {
    label: '배포 자동화',
    cells: {
      tunnel: { tone: 'cost', text: '없음 (터널만 담당, 배포는 별도 도구)' },
      paas: { tone: 'good', text: '있음 (Git 저장소 → 빌드 → 실행)' },
      optics: { tone: 'good', text: '있음 (Git 저장소 → 빌드 → 실행)' },
    },
  },
  {
    label: '도메인 · HTTPS',
    cells: {
      tunnel: { tone: 'na', text: '제공사 서브도메인 즉시 발급 (자체 도메인은 별도 설정)' },
      /*
       * 회색이었던 것을 초록으로 올린다. 자체 도메인 연결과 인증서 자동 발급은
       * 이 계열 도구들이 오래전부터 잘해 온 일이다. 회색으로 두면 '불편하다'는
       * 인상을 주는데, 그건 사실이 아니라 우리에게 유리한 왜곡이다.
       */
      paas: { tone: 'good', text: '자체 도메인 연결과 인증서 발급을 지원' },
      optics: {
        tone: 'good',
        text: '워크스페이스마다 서브도메인 자동 발급',
        note: '도메인과 인증서는 Cloudflare에 의존합니다',
      },
    },
  },
  {
    label: '요청이 지나는 곳',
    cells: {
      tunnel: { tone: 'cost', text: '제공사 인프라 경유' },
      paas: { tone: 'good', text: '사용자 서버로 직접 연결', note: '이를 위해 접근 경로가 미리 열려 있어야 합니다' },
      optics: { tone: 'cost', text: 'Hub 공개 프록시 경유', note: 'Host만 읽고 중계합니다. Hub API와 DB는 이 경로 밖에 있습니다' },
    },
  },
  {
    label: '소스와 데이터의 위치',
    cells: {
      tunnel: { tone: 'na', text: '해당 없음 (배포 기능이 없음)' },
      paas: { tone: 'good', text: '모두 사용자 서버' },
      optics: { tone: 'good', text: '모두 사용자 서버' },
    },
  },
  /*
   * 우리가 가장 불리한 행을 일부러 넣는다.
   *
   * 아래 '현재 상태' 섹션에서 준비 중인 기능을 전부 밝혀 놓고 비교표에서만
   * 그 사실을 빼면, 표가 다른 섹션과 다른 목소리로 말하게 된다. 방문자는
   * 그 어긋남을 '표는 광고다'로 읽는다. 약점을 표 안에 두는 편이 표 전체를 살린다.
   */
  {
    label: '성숙도',
    cells: {
      tunnel: { tone: 'good', text: '여러 해 검증된 상용 서비스' },
      paas: { tone: 'good', text: '여러 해 이어진 오픈소스 프로젝트' },
      optics: { tone: 'cost', text: `${VERSION_SLOT}준비 중인 기능이 남아 있음`, note: '남은 항목은 아래 ‘현재 상태’에 모두 기재했습니다' },
    },
  },
  {
    label: '요금',
    cells: {
      tunnel: { tone: 'na', text: '무료 티어 + 유료 등급' },
      paas: { tone: 'na', text: '소프트웨어는 무료, 서버 비용은 별도' },
      /*
       * ₩0 만 적어 두면 곧바로 "그럼 Hub 는 누가 돌리나"라는 반문이 온다.
       * 답을 각주로 흐리게 두지 않고 셀 안에 같은 크기로 적는다 —
       * 조건이 안 보이는 무료는 과장으로 읽힌다.
       */
      optics: {
        tone: 'good',
        text: '₩0',
        note: 'Hub와 도메인은 OPTiCS에서 운영합니다. 서비스를 실행할 서버는 직접 준비해야 합니다',
      },
    },
  },
]

const LEGEND: Record<Tone, string> = {
  good: '유리한 지점',
  cost: '감수해야 하는 대가',
  na: '해당 없음 · 판단 보류',
}

/**
 * 셀 하나의 표시. 표와 좁은 화면 카드가 같은 함수를 쓴다 —
 * 두 곳에 나눠 두면 한쪽만 고쳐져 색과 기호가 어긋난다.
 *
 * 각주를 opacity 로 흐리게 두지 않는다. 조건을 적어 놓고 안 읽히게 만들면
 * 안 적은 것과 같고, 하필 그 각주들이 이 표에서 가장 조심스러운 문장들이다.
 */
function Value({ cell, className = '' }: { cell: Cell; className?: string }) {
  const Icon = TONE_ICON[cell.tone]

  return (
    <div className={`rounded-md px-3 py-2.5 leading-relaxed ${TONE_CLASS[cell.tone]} ${className}`}>
      <span className="flex items-start gap-1.5">
        <Icon className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{cell.text}</span>
      </span>
      {cell.note !== undefined && (
        <span className="mt-1.5 block text-2xs leading-relaxed text-secondary-text-color">{cell.note}</span>
      )}
    </div>
  )
}

export default function Comparison() {
  const rows = withVersion(ROWS, usePlatformVersionLabel())

  return (
    <Section id="comparison" tone="sunken" labelledBy="comparison-title">
      <SectionHeading id="comparison-title" eyebrow="왜 OPTiCS인가" title="이미 사용 중인 도구와 겹치는 지점, 갈라지는 지점">
        <p>
          외부 터널 서비스와 셀프호스팅 PaaS는 각각 이 문제의 일부를 해결합니다.
          터널은 연결을 담당하고, PaaS는 배포를 자동화합니다. 아래 표는 어느 쪽이
          우월하다는 주장이 아니라, 각 접근 방식이 무엇을 대가로 지불하는지를 정리한
          것입니다.
        </p>
      </SectionHeading>

      {/*
        데스크톱은 3열 표, 모바일은 카테고리별 카드로 쌓는다. 같은 ROWS/CATEGORIES를
        두 번 렌더링하지만 화면 폭에 따라 한쪽만 DOM에 그려지므로(hidden = display:none)
        스크린 리더가 같은 내용을 두 번 읽지는 않는다.
      */}
      <div className="mt-14 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">외부 터널 서비스·셀프호스팅 PaaS·OPTiCS 접근 방식 비교</caption>
          <thead>
            <tr className="border-b border-border-strong-color">
              <th scope="col" className="w-44 pb-4 pr-4 align-bottom text-sm font-semibold text-primary-text-color">
                비교 기준
              </th>
              {CATEGORIES.map(cat => (
                <th
                  key={cat.key}
                  scope="col"
                  className={`px-4 pb-4 align-bottom ${
                    cat.accent
                      ? 'rounded-t-md border-x border-t border-service-color/40 bg-modal-background-color pt-3'
                      : ''
                  }`}
                >
                  <span className={`block text-sm font-semibold ${cat.accent ? 'text-service-color' : 'text-primary-text-color'}`}>
                    {cat.name}
                  </span>
                  {cat.example !== undefined && (
                    <span className="mt-1 block text-2xs font-normal text-tertiary-text-color">{cat.example}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.label} className="border-t border-border-color align-top">
                <th scope="row" className="py-3 pr-4 text-sm font-medium text-secondary-text-color">
                  {row.label}
                </th>
                {CATEGORIES.map(cat => {
                  const cell = row.cells[cat.key]
                  return (
                    <td
                      key={cat.key}
                      /*
                        강조 열은 사면 ring 이 아니라 좌우 보더로 두른다. ring 을 셀마다
                        걸면 행 경계마다 가로선이 두 겹으로 생겨 '한 열'이 아니라
                        '작은 상자 아홉 개'로 보인다. 밑변은 마지막 행에서만 닫는다.
                      */
                      className={`px-4 py-2 ${
                        cat.accent
                          ? `border-x border-service-color/40 bg-modal-background-color/60 ${
                              rowIndex === ROWS.length - 1 ? 'rounded-b-md border-b pb-3' : ''
                            }`
                          : ''
                      }`}
                    >
                      <Value cell={cell} className="text-xs sm:text-sm" />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 좁은 화면 — 카테고리 하나가 카드 한 장. 가로 스크롤 대신 위아래로 훑는다. */}
      <div className="mt-14 grid gap-6 md:hidden">
        {CATEGORIES.map(cat => (
          <div
            key={cat.key}
            className={`rounded-lg border p-6 ${
              cat.accent ? 'border-service-color/35 bg-modal-background-color' : 'border-border-color bg-background-gradation-color'
            }`}
          >
            <p className={`text-xs font-semibold tracking-wide ${cat.accent ? 'text-service-color' : 'text-tertiary-text-color'}`}>
              {cat.name}
            </p>
            {cat.example !== undefined && <p className="mt-1 text-2xs text-tertiary-text-color">{cat.example}</p>}

            <dl className="mt-5 space-y-4">
              {rows.map(row => {
                const cell = row.cells[cat.key]
                return (
                  <div key={row.label}>
                    <dt className="text-2xs font-semibold tracking-wide text-tertiary-text-color">{row.label}</dt>
                    <dd className="mt-1.5">
                      <Value cell={cell} className="text-xs" />
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        ))}
      </div>

      {/* 범례. 색으로만 의미를 나르면 색맹 사용자에게 정보가 사라진다 — 셀 안 텍스트가 1차 대비책, 이 목록이 2차다. */}
      <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-tertiary-text-color">
        {(['good', 'cost', 'na'] as const).map(tone => (
          <li key={tone} className="flex items-center gap-2">
            <span className={`flex h-5 w-7 shrink-0 items-center justify-center rounded-sm ${TONE_CLASS[tone]}`}>
              {(() => { const Icon = TONE_ICON[tone]; return <Icon className="h-3 w-3" aria-hidden /> })()}
            </span>
            {LEGEND[tone]}
          </li>
        ))}
      </ul>

      {/*
        표를 '누가 이겼나'가 아니라 '나는 어느 쪽인가'로 닫는다.
        비교표를 끝까지 읽은 사람이 실제로 원하는 것은 승패가 아니라 자기 판단이다.
      */}
      <div className="mt-10 max-w-2xl">
        <p className="text-sm leading-relaxed text-secondary-text-color">
          터널 서비스는 연결만, PaaS는 배포만 담당합니다. OPTiCS는 공인 IP 없이 그 둘을 하나의
          흐름으로 연결합니다 — 이미 사용 중인 도구를 대체하는 것이 아니라, 그 사이의 공백을
          채우는 도구에 가깝습니다.
        </p>

        <dl className="mt-6 space-y-2.5 border-t border-border-color pt-5 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-tertiary-text-color sm:w-64">이미 공인 IP가 있는 서버를 사용 중이라면</dt>
            <dd className="text-secondary-text-color">터널 또는 PaaS로 운영할 수 있습니다.</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-tertiary-text-color sm:w-64">집 PC·사내망 장비를 배포까지 한 번에</dt>
            <dd className="font-medium text-service-color">OPTiCS를 통해 이 환경을 운영할 수 있습니다.</dd>
          </div>
        </dl>
      </div>
    </Section>
  )
}
