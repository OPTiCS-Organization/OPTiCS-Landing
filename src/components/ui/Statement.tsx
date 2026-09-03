import Container from './Container'
import Reveal from './Reveal'

/**
 * 후반부에 반복되는 'eyebrow → 제목 → 설명 → 카드' 패턴을 한 번 끊는 블록.
 *
 * 카드도 목록도 아이콘도 없다. 지금까지 증명한 사실 하나를 문장 하나로
 * 다시 말하고 지나가는 것이 유일한 일이라 props 를 늘리지 않는다.
 *
 * 어울리는 문장의 예시 (전부 위 섹션이 이미 증명한 사실의 요약이어야 한다.
 * 여기서 새 주장을 시작하면 안 된다):
 *   "서버는 이미 책상 위에 있습니다."
 *   "열어야 할 포트는, 여전히 0개입니다."
 *   "코드도 데이터도, 한 번도 이 서버를 떠나지 않았습니다."
 *
 * 텍스트를 이 파일에 하드코딩하지 않는다. 어떤 사실을 다시 말할지는
 * 호출부(어느 섹션 사이에 두는지)에 따라 달라지므로 그 판단은 호출부의 몫이다.
 */
type Props = {
  /** 강조할 한 문장. 길어지면 이 컴포넌트의 존재 이유(짧고 강한 한 방)가 사라진다. */
  children: React.ReactNode
  /** 문장 아래에 붙는 한 줄 보충 설명. 없어도 된다. */
  note?: React.ReactNode
  className?: string
}

export default function Statement({ children, note, className = '' }: Props) {
  return (
    <section
      className={`relative overflow-hidden border-b border-border-color bg-background-gradation-color ${className}`}
    >
      {/*
        Hero·Closing 의 광원과 같은 어휘를 아주 옅게 재사용한다.
        opacity 를 0.1 근처로 묶는 이유는 이 블록의 무게가 빛이 아니라 문장
        자체에 있어야 하기 때문이다. Closing 만큼 진하게 쓰면 '마지막'이라는
        신호와 겹쳐 혼동을 만든다 — 광원은 페이지의 처음과 끝에서만 크게 쓴다.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] [background:radial-gradient(60%_140%_at_50%_50%,var(--color-service-color),transparent_70%)]"
      />

      {/*
        Reveal 로 감싸는 이유는 새 모션을 만들지 않기 위해서다. 이 컴포넌트가
        움직이는 유일한 순간은 스크롤로 처음 들어올 때 한 번뿐이고, 그 규칙과
        prefers-reduced-motion 처리는 이미 Reveal 이 갖고 있다.
      */}
      <Container width="narrow" className="relative py-20 text-center sm:py-28">
        <Reveal>
          <p className="text-balance text-3xl font-bold leading-[1.35] tracking-tight text-primary-text-color sm:text-5xl">
            {children}
          </p>

          {note !== undefined && (
            <p className="mt-5 text-sm text-tertiary-text-color sm:text-base">{note}</p>
          )}
        </Reveal>
      </Container>
    </section>
  )
}
