/**
 * CTA 링크.
 *
 * 같은 버튼 마크업이 Hero·Closing·요금 배너·요금 페이지 네 곳에 복사돼 있었다.
 * 한 곳에서 hover 색을 바꾸면 나머지 셋이 조용히 뒤처진다. 버튼은 방문자가
 * 페이지에서 가장 여러 번 마주치는 요소라 그 어긋남이 제일 먼저 눈에 띈다.
 *
 * 상태를 전부 정의한다 — hover / active / focus-visible.
 * active 에서 1px 내려앉게 두는 것이 눌림을 알리는 가장 싼 방법이다.
 * (:focus-visible 의 링 자체는 index.css 가 전역으로 그린다.)
 *
 * 링크만 만든다. 이 페이지에 폼 제출 버튼은 없고, 전부 다른 곳으로 보내는 일뿐이다.
 */
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-service-color text-on-accent-color font-semibold hover:bg-button-hover-color active:bg-button-progress-color',
  secondary:
    'border border-border-color text-secondary-text-color font-medium hover:border-border-strong-color hover:bg-surface-hover-color/40 hover:text-primary-text-color',
  ghost:
    'text-secondary-text-color font-medium hover:bg-surface-hover-color/50 hover:text-primary-text-color',
}

const SIZE: Record<Size, string> = {
  md: 'px-6 py-3 text-sm',
  sm: 'px-4 py-2 text-sm',
}

type Props = {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
} & Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-label' | 'target' | 'rel'>

export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-md transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
