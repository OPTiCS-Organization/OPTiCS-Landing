/**
 * 기술 섹션 끝에 붙는 한 줄 번역.
 *
 * 역방향 터널과 구성 섹션은 밀도가 높다. 읽고 이해한 사람에게는 근거가 되지만,
 * 그렇지 않은 방문자는 "나한테 좋은 게 뭐였지"를 모른 채 다음 섹션으로 간다.
 * 그 사람을 위해 섹션마다 결론을 한 문장으로 다시 말해 준다.
 *
 * 요약이지 새로운 주장이 아니다. 위에서 말하지 않은 것을 여기서 처음 꺼내면
 * 근거 없는 문장이 된다.
 */
export default function PlainSummary({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-12 border-l-2 border-service-color/50 py-1 pl-5 text-base leading-relaxed text-secondary-text-color">
      <span className="font-semibold text-service-color">요약하면 — </span>
      {children}
    </p>
  )
}
