import { ChevronDown } from 'lucide-react'
import Section from '../components/ui/Section'

/**
 * 랜딩용 FAQ. 요금 관련 질문은 `/pricing`(PricingFaq)에 있으므로 여기서는 되풀이하지 않는다.
 * 여기는 기술·운영 질문만 다룬다 — 특히 "Hub가 죽으면 내 서버도 죽나?"처럼
 * 구조를 한 번 파봐야 답할 수 있는 질문들이다.
 *
 * 답은 전부 OPTiCS-Hub / OPTiCS-Agent / OPTiCS-Infra 코드를 실제로 읽고 확인한 내용만 담는다.
 * 확인하지 못한 것은 "정해 둔 게 없다"고 적지, 그럴듯하게 지어내지 않는다.
 *
 * 이 배열은 구조화 데이터(FAQPage)의 출처이기도 하다. 프리렌더가 여기서 바로 읽어
 * `<script type="application/ld+json">` 을 만든다(scripts/prerender.mjs).
 * index.html 에 손으로 한 벌 더 적어 두면 답을 고칠 때 화면과 검색 결과가 갈라지고,
 * 그 어긋남은 스팸으로 처리된다. 출처는 이 배열 하나다.
 */
export const FAQ = [
  {
    question: 'Hub에 장애가 발생하면 서비스도 함께 중단되나요?',
    answer:
      '이미 실행 중인 서비스는 중단되지 않습니다. 컨테이너는 사용자 서버에서 Docker 데몬이 직접 실행하며, ' +
      'Agent 코드 어디에도 Hub와의 연결이 끊어졌다고 컨테이너를 중단하는 로직이 없습니다. 컨테이너의 포트도 Docker가 ' +
      '호스트에 직접 바인딩하므로, 서버 로컬 IP로 직접 접근하는 경우에도 영향을 받지 않습니다. 다만 ' +
      '<서비스>.<워크스페이스>.optics.run 같은 공개 주소로 들어오는 요청은 Hub의 공개 프록시를 반드시 거치므로, 이 ' +
      '경로는 Hub에 장애가 발생하면 함께 중단됩니다. 배포·시작·중지 같은 새 명령도 Hub API를 경유하므로, Hub가 복구될 때까지는 ' +
      '처리되지 않습니다.',
  },
  {
    question: '설치 스크립트는 정확히 무엇을 하나요?',
    answer:
      'OS와 배포판을 확인하고, Docker·Docker Compose가 없으면 설치 여부를 먼저 확인합니다(동의한 경우에만 sudo로 설치를 ' +
      '진행합니다). 그다음 Agent 저장소에서 docker-compose.yml과 .env.example 두 파일만 내려받습니다 — 소스를 ' +
      '클론하거나 빌드하지 않으며, 실제로 기동되는 이미지는 GHCR에 게시된 것입니다. 웹 SSH 터미널 사용 여부를 확인하고 ' +
      '동의하면 sshd를 설정하고 전용 키를 만들어 등록합니다. 포트(기본 5230/5240) 충돌을 확인한 뒤 이미지를 ' +
      '내려받아 컨테이너를 기동하는 것으로 완료됩니다. 아래 설치 섹션에 스크립트 원문 링크가 있습니다.',
  },
  {
    question: '코드와 데이터는 어디에 저장되나요?',
    answer:
      '소스 코드, 빌드 이미지, 실행 중인 컨테이너 및 데이터베이스는 모두 사용자 서버(Agent)에 저장됩니다. Hub가 ' +
      '보관하는 정보는 계정 정보와 워크스페이스·서비스 설정 등의 메타데이터입니다. 다만 외부 방문자가 서비스에 ' +
      '접속할 때 전송하는 요청 바이트 자체는 Hub의 Gateway를 거쳐 서버로 중계됩니다 — ' +
      'Gateway는 요청을 전달할 뿐 내용을 로깅하거나 저장하지 않습니다.',
  },
  {
    question: '어떤 서버가 있어야 하나요?',
    answer:
      'Docker(와 Compose)가 동작할 수 있는 서버면 충분합니다. 별도로 정해 둔 최소 사양은 없습니다. 공인 IP나 포트포워딩도 ' +
      '필요하지 않습니다. Agent가 사용자 서버에서 먼저 Hub로 연결하므로 NAT 환경에서도 사용할 수 있습니다.',
  },
  {
    question: 'HTTPS 인증서는 어떻게 관리되나요?',
    answer:
      '직접 발급하거나 갱신하지 않습니다. 서브도메인 발급과 인증서 모두 Cloudflare를 사용합니다. Hub가 워크스페이스·서비스 ' +
      '서브도메인의 DNS 레코드를 Cloudflare에 등록하면, 그 앞단에서 Cloudflare가 TLS를 처리합니다.',
  },
  {
    question: 'Agent는 내 서버에서 어디까지 권한을 갖나요?',
    answer:
      'Agent 컨테이너에는 호스트의 Docker 소켓(/var/run/docker.sock)이 그대로 마운트됩니다. 배포·시작·중지· ' +
      '재배포 같은 정상 기능이 이 권한으로 동작하지만, 반대로 Agent 컨테이너가 침해되면 호스트의 ' +
      'Docker 전체를 조작할 수 있다는 의미이기도 합니다. 설치 시 웹 SSH 터미널을 활성화했다면 전용 SSH 키도 ' +
      '컨테이너에 추가로 마운트됩니다. 신뢰할 수 있는 서버에만 설치해야 합니다.',
  },
]

export default function Faq() {
  return (
    <Section id="faq" tone="raised" width="narrow" labelledBy="faq-title">
      <h2 id="faq-title" className="text-2xl font-bold tracking-tight text-primary-text-color sm:text-3xl">
        자주 묻는 기술 질문
      </h2>

      {/*
        접어 둔다. 여섯 답이 전부 서너 문장이라 펼쳐 두면 페이지 하단이 글 벽이 되고,
        정작 자기 질문을 찾으러 온 사람이 여섯 덩이를 다 읽어야 한다.

        details/summary 를 쓰는 이유는 접는 UI 를 직접 만들지 않기 위해서다.
        브라우저가 키보드 조작(Enter·Space)과 펼침 상태 안내를 이미 처리하고,
        JS 가 죽어도 열린다. 페이지 내 검색(Ctrl+F)도 최신 브라우저는 접힌
        내용을 찾아 펼쳐 준다.

        첫 질문만 열어 둔다. 전부 닫혀 있으면 이 자리가 무엇인지 알기 어렵다.
      */}
      <div className="mt-12 border-t border-border-color">
        {FAQ.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group border-b border-border-color"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-base font-semibold text-primary-text-color transition-colors hover:text-service-color [&::-webkit-details-marker]:hidden">
              {item.question}
              {/* 화살표는 열림 상태를 눈으로 알린다. 상태 자체는 details 가 스크린 리더에 이미 알린다. */}
              <ChevronDown
                className="mt-0.5 h-4 w-4 shrink-0 text-tertiary-text-color transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>

            <p className="pb-6 pr-8 text-sm leading-relaxed text-secondary-text-color">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  )
}
