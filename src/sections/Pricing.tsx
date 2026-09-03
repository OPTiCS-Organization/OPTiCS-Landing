import Mark from '../components/ui/Mark'
import { ArrowRight, Check, Server } from 'lucide-react'
import { WORKSPACE_DOMAIN_LIMIT } from '../constants/plan'
import Section from '../components/ui/Section'
import Button from '../components/ui/Button'
import Eyebrow from '../components/ui/Eyebrow'

/**
 * 요금 페이지 본문.
 *
 * 플랜이 하나뿐인 페이지에 요금표를 그리지 않는다. 비교할 대상이 없는데 칼럼과
 * 카드를 세우면 형식만 요금표고 정보는 없다. 대신 방문자가 실제로 묻는 순서대로
 * 답한다 — 얼마인가 → 무엇이 어디까지 되나 → 내가 준비할 건 뭔가 → 왜 공짜인가.
 *
 * 표 안에서도 '한도'를 기능들보다 먼저 둔다. 제약을 먼저 말하는 편이 신뢰를 얻는다.
 */

/**
 * 사양표. 브라우저 호환성 표를 본떴다.
 *
 * 플랜이 하나라 비교 칼럼이 없다. 그래서 '플랜을 고르는 표'가 아니라 '무엇이
 * 얼마나 되는지 훑는 표'로 만든다. 값이 있는 항목은 값을, 있고 없고만 있는
 * 항목은 체크를 넣되, 셀을 통째로 칠해 색면이 먼저 읽히게 한다.
 *
 * v0.7.1 에서 실제로 동작하는 것만 적는다. 마지막 '준비물' 묶음은 빼지 않는다 —
 * 사용자가 부담하는 것을 같은 표 안에 둬야 무료의 조건이 정확해진다.
 */

/**
 * 셀의 색.
 *
 * 브라우저 호환성 표의 규칙을 그대로 빌린다 — 되면 초록, 부분적이면 주황,
 * 아니면 흐리게. 색이 판단을 대신하므로 표를 읽지 않고 훑기만 해도 결론이 남는다.
 *
 * 그래서 한도(3개)와 준비 중은 초록이 아니라 주황이다. 초록으로 칠하면 제약이
 * 혜택처럼 보인다. 숨겨서 얻는 신뢰는 없다.
 */
type Tone = 'yes' | 'partial' | 'own'
type Row = { label: string; value: string | true; tone: Tone; note?: string }
type Group = { name: string; rows: Row[] }

const TONE_CLASS: Record<Tone, string> = {
  yes: 'bg-success-color/12 text-success-color',
  partial: 'bg-warning-color/12 text-warning-color',
  own: 'bg-modal-box-color text-tertiary-text-color',
}

const SPEC: Group[] = [
  {
    name: '요금',
    rows: [
      { label: '월 요금', value: '₩0', tone: 'yes' },
      { label: '결제 수단 등록', value: '필요 없음', tone: 'yes' },
      { label: '기간 제한', value: '없음', tone: 'yes' },
    ],
  },
  {
    name: '한도',
    rows: [
      {
        label: '워크스페이스 도메인',
        value: `${WORKSPACE_DOMAIN_LIMIT}개`,
        tone: 'partial',
        note: '워크스페이스마다 HTTPS 서브도메인이 하나씩 발급됩니다.',
      },
      { label: '서비스 배포', value: '무제한', tone: 'yes', note: '워크스페이스 하나에 몇 개를 배포하든 제한이 없습니다.' },
      { label: 'Agent 연결', value: '무제한', tone: 'yes', note: '여러 대의 서버를 연결해 하나의 Console에서 관리합니다.' },
    ],
  },
  {
    name: '배포',
    rows: [
      { label: 'Git 저장소 URL로 배포', value: true, tone: 'yes' },
      { label: 'Dockerfile · docker-compose 자동 판별', value: true, tone: 'yes' },
      { label: '컨테이너 단위 시작 · 중지 · 재시작', value: true, tone: 'yes' },
      { label: '실시간 배포 · 런타임 로그', value: true, tone: 'yes' },
      { label: '배포 중단(ABORT)', value: '준비 중', tone: 'partial' },
    ],
  },
  {
    name: '네트워크',
    rows: [
      { label: '공인 IP · 포트포워딩', value: '필요 없음', tone: 'yes' },
      { label: 'HTTPS 인증서 발급 · 갱신', value: '자동', tone: 'yes' },
      { label: 'Cloudflare DNS 레코드', value: '자동 생성 · 정리', tone: 'yes' },
    ],
  },
  {
    name: '운영',
    rows: [
      { label: 'CPU · 메모리 모니터링', value: '7일 보존', tone: 'yes' },
      { label: 'SSH 웹 터미널', value: true, tone: 'yes' },
      { label: 'Agent 원격 업데이트', value: true, tone: 'yes' },
    ],
  },
  {
    name: '계정',
    rows: [
      { label: '2단계 인증 (TOTP)', value: true, tone: 'yes' },
      { label: '이메일 인증', value: true, tone: 'yes' },
      { label: '팀 구성원 초대 · 권한', value: '준비 중', tone: 'partial', note: '현재는 워크스페이스가 하나의 계정에 종속되어 있습니다.' },
    ],
  },
  {
    name: '준비물',
    rows: [
      {
        label: '서비스가 돌아갈 서버',
        value: '직접 준비',
        tone: 'own',
        note: '가정용 PC, 사내망 장비, 유휴 클라우드 인스턴스 모두 사용할 수 있습니다. Docker만 설치할 수 있으면 됩니다.',
      },
    ],
  },
]

export default function Pricing() {
  return (
    <Section id="pricing" width="narrow" labelledBy="pricing-title">
      {/* 1. 얼마인가 */}
      <Eyebrow>요금</Eyebrow>
      <h1 id="pricing-title" className="mt-4 text-4xl font-bold tracking-tight text-primary-text-color sm:text-5xl">
        전부 무료입니다
      </h1>

      <div className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="text-6xl font-bold tracking-tight text-primary-text-color">Free</span>
        <span className="text-sm text-tertiary-text-color">/ 월 · 기간 제한 없음</span>
      </div>

      <Button href="https://console.optics.run" className="mt-8">
        시작하기
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>

      {/*
        2. 사양표.

        묶음마다 tbody 를 따로 둔다. 한 표에 스무 줄을 이어 붙이면 어디까지가
        같은 주제인지 알 수 없다. 묶음 이름은 행 안의 th 로 넣어, 표 구조를
        깨지 않으면서 눈으로는 소제목처럼 읽히게 한다.

        칼럼이 둘뿐이라 좁은 화면에서도 가로 스크롤이 필요 없다.
      */}
      <table className="mt-20 w-full border-collapse text-left">
        <caption className="sr-only">FREE 플랜에 포함된 것과 한도</caption>
        <thead>
          <tr className="border-b border-border-strong-color">
            <th scope="col" className="pb-3 text-sm font-semibold text-primary-text-color">
              항목
            </th>
            <th scope="col" className="pb-3 pl-4 text-sm font-semibold text-service-color">
              <span className="block w-28 text-center sm:w-36">FREE</span>
            </th>
          </tr>
        </thead>

        {SPEC.map(group => (
          <tbody key={group.name}>
            <tr>
              <th
                scope="colgroup"
                colSpan={2}
                className="pt-8 pb-2 text-xs font-semibold tracking-wide text-tertiary-text-color"
              >
                {group.name}
              </th>
            </tr>

            {group.rows.map(row => (
              <tr key={row.label} className="border-t border-border-color align-baseline">
                <th scope="row" className="py-3.5 pr-6 font-normal">
                  <span className="text-sm text-primary-text-color">{row.label}</span>
                  {row.note !== undefined && (
                    <span className="mt-1 block max-w-md text-xs leading-relaxed text-tertiary-text-color">
                      {row.note}
                    </span>
                  )}
                </th>
                {/*
                  셀을 통째로 칠한다. 호환성 표가 한눈에 읽히는 이유는 기호가
                  아니라 색면이기 때문이다. 값이 짧아도 폭을 고정해 색 띠가
                  세로로 정렬되게 한다 — 들쭉날쭉하면 훑는 효과가 사라진다.
                */}
                <td className="py-2 pl-4">
                  <span
                    className={`flex min-h-8 w-28 items-center justify-center gap-1.5 rounded px-2 text-center sm:w-36 ${TONE_CLASS[row.tone]}`}
                  >
                    {row.value === true ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden />
                        <span className="sr-only">포함</span>
                      </>
                    ) : (
                      <span className="font-mono text-xs sm:text-sm">{row.value}</span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      {/*
        범례. 색으로 의미를 나르면 색만으로는 알 수 없는 사람이 생긴다.
        셀 안에 값 글자를 함께 두는 것이 1차 대비책이고, 이 범례가 2차다.
      */}
      <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-tertiary-text-color">
        {([
          ['yes', '현재 지원'],
          ['partial', '한도가 있거나 준비 중'],
          ['own', '사용자가 준비'],
        ] as const).map(([tone, label]) => (
          <li key={tone} className="flex items-center gap-2">
            <span className={`h-3 w-6 shrink-0 rounded-sm ${TONE_CLASS[tone]}`} />
            {label}
          </li>
        ))}
      </ul>

      {/*
        3. 준비물을 표에 넣었지만 한 번 더 풀어 쓴다.
        셀프호스팅이라 서버는 사용자가 마련해야 한다. 표의 한 줄로만 두면
        가입한 뒤에 알게 되고, 그때는 무료라는 말이 과장으로 읽힌다.
      */}
      <div className="mt-10 flex items-start gap-4 rounded-lg border border-border-color bg-modal-background-color p-6">
        <Server className="mt-0.5 h-5 w-5 shrink-0 text-tertiary-text-color" aria-hidden />
        <p className="text-sm leading-relaxed text-secondary-text-color">
          <strong className="font-semibold text-primary-text-color"><Mark>서버는 직접 준비하셔야 합니다.</Mark></strong>{' '}
          OPTiCS는 그 서버를 외부와 연결하고 배포를 대행할 뿐, 서비스를 실행할 장비를 제공하지는 않습니다.
          대신 공인 IP도, 포트포워딩도, 고정 IP도 필요하지 않습니다.
        </p>
      </div>

      {/*
        4. 왜 공짜인가.
        FAQ 맨 앞에 있던 답을 끌어올렸다. 무료 플랜에서 방문자가 가장 먼저 의심하는
        것이 이건데, 접힌 목록 안에 두면 찾아 읽어야 한다.
      */}
      <h2 className="mt-20 text-xl font-bold tracking-tight">왜 무료인가</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-secondary-text-color">
        <p>
          빌드와 실행에 필요한 연산·저장이 전부{' '}
          <strong className="font-semibold text-primary-text-color"><Mark>내 서버</Mark></strong>에서
          수행되기 때문입니다. 저희가 부담하는 것은 Hub 서버와 도메인 정도이므로, 사용자가 늘어도
          비용이 그에 비례해 증가하지 않습니다.
        </p>
        <p>
          유료 플랜은 아직 없습니다. 도입하더라도 현재 무료로 제공하던 기능을 이후에 제한하지 않습니다.
          이미 제공하던 것을 회수해 재판매하는 방식은 취하지 않겠습니다.
        </p>
      </div>
    </Section>
  )
}
