import Eyebrow from './Eyebrow'

/**
 * 섹션 머리.
 *
 * 제목 폭을 max-w-2xl 로 묶는다. 큰 글씨가 컨테이너 폭 전체를 가로지르면
 * 한 줄이 너무 길어져 다음 줄 첫 글자를 찾는 데 눈이 한 번 헤맨다.
 *
 * id 를 받는 이유는 Section 의 aria-labelledby 와 짝을 이루기 위해서다.
 * 섹션에 이름이 붙어야 스크린 리더가 목차처럼 건너뛸 수 있다.
 */
type Props = {
  id?: string
  eyebrow: string
  title: React.ReactNode
  children?: React.ReactNode
}

export default function SectionHeading({ id, eyebrow, title, children }: Props) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>

      <h2
        id={id}
        className="mt-4 text-[1.75rem] font-bold leading-[1.25] tracking-tight text-primary-text-color sm:text-4xl"
      >
        {title}
      </h2>

      {children !== undefined && (
        <div className="mt-5 text-base leading-[1.75] text-secondary-text-color">{children}</div>
      )}
    </div>
  )
}
