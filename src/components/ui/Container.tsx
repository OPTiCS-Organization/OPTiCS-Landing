/**
 * 본문 폭의 단일 출처.
 *
 * 섹션마다 max-w 를 직접 적으면 반드시 어긋난다(실제로 5xl·6xl·3xl 이 섞여 있었다).
 * 폭이 섹션마다 다르면 스크롤할 때 좌우 여백이 미세하게 흔들려, 이유를 딱 집을 수는
 * 없지만 정돈되지 않은 페이지로 읽힌다.
 *
 *   narrow  읽는 글이 주인 섹션(요금 본문, FAQ). 한 줄이 길어지지 않게 좁힌다 — 건드리지 않는다
 *   default 대부분의 섹션
 *   wide    Hero 처럼 제품 화면이 주인인 섹션
 *
 * default·wide 는 리뷰 4건 전원이 "1440px 에서 제품 화면이 작다"고 지적해 한 단계씩
 * 올렸다(5xl→6xl, 6xl→7xl). narrow 는 글줄 길이 문제라 그대로 둔다 — 읽는 폭과
 * 보여주는 폭은 같은 방향으로 움직일 이유가 없다. 1440px 기준 wide(80rem)의
 * 좌우 여백은 (1440-1280)/2=80px + px-6 이라 과하지 않다.
 */
type Width = 'narrow' | 'default' | 'wide'

const WIDTH: Record<Width, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

type Props = {
  width?: Width
  className?: string
  children: React.ReactNode
}

export default function Container({ width = 'default', className = '', children }: Props) {
  return (
    <div className={`mx-auto w-full px-6 ${WIDTH[width]} ${className}`}>
      {children}
    </div>
  )
}
