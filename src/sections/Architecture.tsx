import Mark from '../components/ui/Mark'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'
import PlainSummary from '../components/PlainSummary'
import DiagramFrame from '../components/ui/DiagramFrame'
import SystemTopology from '../diagrams/SystemTopology'

/**
 * 구조.
 *
 * 컴포넌트 목록 앞에 전체 구조도를 세운다. 이름 다섯 개를 먼저 읽히면
 * 각각이 어디에 서 있는지 모르는 채로 표를 훑게 된다. 그림을 먼저 보고
 * 나면 표가 '그림의 각주'가 되어 읽는 속도가 달라진다.
 */

/** 그림 위 번호의 설명. 그림 안에 넣으면 좁은 화면에서 겹친다. */
const FLOW = [
  '개발자가 Console에 저장소 URL과 환경변수를 입력합니다.',
  'Hub는 Agent가 미리 확립해 둔 연결을 통해 배포 명령을 전달합니다.',
  'Agent가 저장소를 클론하고 이미지를 빌드합니다. 아웃바운드 연결이므로 방화벽을 그대로 통과합니다.',
  '컨테이너가 내 서버에서 기동합니다.',
  '방문자의 요청은 Cloudflare와 공개 프록시를 거쳐, Agent가 개설한 터널을 통해 해당 컨테이너에 도달합니다.',
]

export default function Architecture() {
  return (
    <Section id="architecture" labelledBy="architecture-title">
      <SectionHeading
        id="architecture-title"
        eyebrow="구조"
        title="코드가 서비스가 되기까지"
      >
        <p>
          Hub와 Agent 사이에 NAT가 있어도 Agent가 먼저 연결하므로
          경계를 개방할 필요가 없습니다.
        </p>
      </SectionHeading>

      {/* 다이어그램은 자기 컨테이너 안에서만 가로 스크롤한다. 본문은 절대 밀리지 않는다. */}
      <div className="mt-12">
        <DiagramFrame>
          <SystemTopology />
        </DiagramFrame>
      </div>

      <ol className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {FLOW.map((item, index) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-secondary-text-color">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-2xs font-bold ${
                index === FLOW.length - 1
                  ? 'border-service-color text-service-color'
                  : 'border-border-strong-color text-tertiary-text-color'
              }`}
            >
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      {/*
        저장소 5개 구성 표와 스택 배지가 여기 있었다. 뺐다.

        그건 "내가 이렇게 나눠 설계했다"는 진술이지 방문자의 질문에 대한 답이 아니다.
        셀프호스팅할 곳을 찾는 사람은 Hub 가 Prisma 를 쓰는지 궁금하지 않다. 궁금한 것은
        '내 서버에 뭐가 올라가고, 뭐가 저쪽에서 도는가' 하나뿐이고, 그 답은 위 그림과
        아래 한 줄이 이미 하고 있다. 구성 요소별 이야기는 문서 사이트의 몫이다.
      */}
      {/* 설치 스크립트가 올리는 건 Agent 와 Agent-Dashboard 두 컨테이너다. */}
      <PlainSummary>
        내 서버에 설치되는 것은 <Mark>Agent와 Agent Dashboard, 두 컨테이너뿐</Mark>입니다.
        나머지는 저희 쪽에서 동작합니다.
      </PlainSummary>
    </Section>
  )
}
