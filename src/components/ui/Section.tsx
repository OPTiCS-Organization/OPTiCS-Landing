import Container from './Container'

/**
 * 섹션 껍데기.
 *
 * 배경 층·구분선·수직 리듬을 한 곳에서 정한다. 섹션마다 py 값을 직접 적으면
 * 24 와 20 과 28 이 섞이고, 그 차이는 개별 화면에서는 안 보이다가 스크롤로
 * 이어 볼 때 리듬이 어긋난 것으로 나타난다.
 *
 * tone 은 배경 계층이다. 다크 테마의 elevation 은 '더 밝은 면'이므로,
 * 인접한 섹션끼리 같은 톤이 이어지면 경계가 사라진다.
 *
 * 두 단계(base·sunken)만 번갈아 쓰다가 raised 를 더했다. 두 단계로는 긴 페이지에서
 * '지금 어디쯤인가'가 만들어지지 않는다 — 열두 섹션이 밝기 두 종류로만 나뉘면
 * 여섯 번째와 열 번째가 같아 보이고, 스크롤 위치 감각이 사라진다.
 * 세 단계가 되면 base 사이에 sunken 과 raised 를 섞어 '장(章)'을 만들 수 있다.
 *
 *   base    기본 배경
 *   sunken  한 단계 어두운 배경. 묶음과 묶음 사이를 끊을 때
 *   raised  한 단계 밝은 배경. 그 자리가 페이지의 고비라고 알릴 때만 쓴다
 *   fade    base → sunken 으로 흐르는 그라데이션. 다음 섹션이 sunken 일 때만 의미가 있다
 *
 * raised 주의: 카드에 쓰는 modal-background-color 와 같은 값이다. 카드가 주인인
 * 섹션에 raised 를 걸면 카드가 배경에 녹아 사라진다. 카드가 없거나, 카드를
 * modal-box-color 로 한 단계 더 올린 섹션에만 쓴다.
 */
type Tone = 'base' | 'sunken' | 'raised' | 'fade'

const TONE: Record<Tone, string> = {
  base: 'bg-background-color',
  sunken: 'bg-background-gradation-color',
  raised: 'bg-modal-background-color',
  fade: 'bg-gradient-to-b from-background-color to-background-gradation-color',
}

/** 섹션이 짊어진 정보량에 맞춘 수직 여백. 대부분 default 다. */
type Space = 'default' | 'compact' | 'roomy'

const SPACE: Record<Space, string> = {
  compact: 'py-16 sm:py-20',
  default: 'py-20 sm:py-28',
  roomy: 'py-24 sm:py-32',
}

type Props = {
  id?: string
  tone?: Tone
  space?: Space
  width?: 'narrow' | 'default' | 'wide'
  /** 이 섹션의 제목 요소 id. 스크린 리더가 섹션 경계를 이름으로 읽게 한다. */
  labelledBy?: string
  /** 아래 구분선. 배경 톤이 바뀌는 자리에서는 선이 오히려 군더더기라 끌 수 있다. */
  divider?: boolean
  className?: string
  children: React.ReactNode
}

export default function Section({
  id,
  tone = 'base',
  space = 'default',
  width = 'default',
  labelledBy,
  divider = true,
  className = '',
  children,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONE[tone]} ${divider ? 'border-b border-border-color' : ''} ${className}`}
    >
      <Container width={width} className={SPACE[space]}>
        {children}
      </Container>
    </section>
  )
}
