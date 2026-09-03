import { WORKSPACE_DOMAIN_LIMIT } from '../constants/plan'
import Section from '../components/ui/Section'

/**
 * 요금 페이지의 FAQ.
 *
 * 본문이 이미 답한 것은 여기서 되풀이하지 않는다. "왜 무료냐"와 "나중에 잠그냐"는
 * 위 '왜 무료인가' 섹션으로 올렸고, 서버 요건은 '직접 준비하실 것'이 맡았다.
 * 남은 것은 본문에 넣기엔 잘고, 빼기엔 실제로 묻는 질문들이다.
 *
 * 아직 안 되는 것(팀 관리)도 그대로 적는다.
 */
const FAQ = [
  {
    question: `워크스페이스 도메인 ${WORKSPACE_DOMAIN_LIMIT}개의 의미는 무엇인가요?`,
    answer:
      `워크스페이스마다 HTTPS 서브도메인이 하나씩 발급되며, 워크스페이스는 최대 ${WORKSPACE_DOMAIN_LIMIT}개까지 생성할 수 있습니다. 각 워크스페이스에 배포하는 서비스 수에는 제한이 없습니다. 예를 들어 워크스페이스가 homelab이면 api.homelab.optics.run, blog.homelab.optics.run과 같이 서비스별 주소가 발급됩니다.`,
  },
  {
    question: '한도를 넘기면 어떻게 되나요?',
    answer:
      `이미 생성된 워크스페이스는 계속 사용할 수 있습니다. ${WORKSPACE_DOMAIN_LIMIT}개를 모두 사용한 후 새 워크스페이스를 생성하려면 사용하지 않는 워크스페이스를 삭제해야 합니다. 서비스와 Agent 수에는 제한이 없으므로 대부분의 경우 하나의 워크스페이스에서 관리할 수 있습니다.`,
  },
  {
    question: '카드를 등록해야 하나요?',
    answer:
      '아니요. 결제 수단을 등록하지 않으므로 요금이 청구되지 않습니다. 계정을 생성하고 Agent를 설치하면 이용할 수 있습니다.',
  },
  {
    question: '제 코드와 데이터는 어디에 저장되나요?',
    answer:
      '소스 코드, 빌드 이미지, 컨테이너 및 데이터베이스는 모두 사용자 서버에 저장됩니다. Hub는 계정 정보와 워크스페이스·서비스 설정 등의 메타데이터를 보관하며, 공개 프록시는 요청을 사용자 서버로 중계합니다.',
  },
  {
    question: '팀으로 함께 쓸 수 있나요?',
    answer:
      '현재 지원하지 않습니다. 워크스페이스는 하나의 계정에 연결되며, 구성원 초대와 권한 관리 기능은 준비 중입니다. 여러 서버를 하나의 계정으로 관리하는 기능은 지원합니다.',
  },
]

export default function PricingFaq() {
  return (
    <Section tone="sunken" width="narrow" labelledBy="faq-title">
      <h2 id="faq-title" className="text-2xl font-bold tracking-tight text-primary-text-color sm:text-3xl">
        자주 묻는 질문
      </h2>

      <dl className="mt-12 divide-y divide-border-color border-t border-border-color">
        {FAQ.map(item => (
          <div key={item.question} className="py-7">
            <dt className="text-base font-semibold text-primary-text-color">{item.question}</dt>
            <dd className="mt-3 text-sm leading-relaxed text-secondary-text-color">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
