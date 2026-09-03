/**
 * 다이어그램 액자.
 *
 * 그림은 자기 컨테이너 안에서만 가로로 스크롤한다. 본문이 따라 밀리면
 * 페이지 전체가 흔들리고, 한 번 어긋난 좌우 정렬은 스크롤을 되돌려도 눈에 남는다.
 *
 * 좁은 화면에서는 그림이 잘려 있다는 사실 자체를 알려야 한다. 스크롤 막대가
 * 뜨지 않는 환경(터치, macOS 기본 설정)에서는 잘린 그림이 '망가진 그림'으로 보인다.
 * 그림이 컨테이너보다 좁아지는 폭(lg)부터는 안내를 감춘다.
 */
type Props = {
  children: React.ReactNode
  /** 안내를 감출 브레이크포인트. 그림의 min-width 에 맞춘다. */
  hint?: boolean
}

export default function DiagramFrame({ children, hint = true }: Props) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border-color bg-modal-background-color/40">
      <div className="overflow-x-auto p-6">{children}</div>

      {hint && (
        <figcaption className="border-t border-border-color px-6 py-2.5 text-3xs text-tertiary-text-color lg:hidden">
          그림은 좌우로 스크롤할 수 있습니다.
        </figcaption>
      )}
    </figure>
  )
}
