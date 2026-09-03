/**
 * 섹션 위에 붙는 한 마디. 그 섹션이 어떤 질문에 답하는지를 미리 알린다.
 *
 * 액센트 색을 쓰는 자리 중 가장 자주 나오는 곳이라 크기를 작게 묶어 둔다.
 * 여기서 색을 크게 쓰면 브랜드 색이 페이지 전체에 흩뿌려져 CTA 의 힘이 빠진다.
 */
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-service-color">
      <span className="inline-block h-px w-5 bg-service-color/60" aria-hidden />
      {children}
    </p>
  )
}
