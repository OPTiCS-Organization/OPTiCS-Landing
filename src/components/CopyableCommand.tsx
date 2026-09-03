import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = {
  command: string
  /** 화면에 보여줄 문자열. 실제 복사되는 값(command)과 다를 수 있다. */
  display?: string
}

/**
 * 설치 명령어 한 줄과 복사 버튼.
 *
 * navigator.clipboard 는 보안 컨텍스트(HTTPS 또는 localhost)에서만 존재한다.
 * 사내망 IP로 직접 열어보는 경우가 있으므로 execCommand 폴백을 남겨 둔다.
 */
export default function CopyableCommand({ command, display }: Props) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  async function copy() {
    try {
      if (navigator.clipboard !== undefined) {
        await navigator.clipboard.writeText(command)
      } else {
        const area = document.createElement('textarea')
        area.value = command
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
      }

      setCopied(true)
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* 복사가 막힌 환경에서는 사용자가 직접 드래그해 복사하면 된다. */
    }
  }

  return (
    <div className="flex items-stretch gap-2 rounded-md border border-border-color bg-modal-background-color/80 p-1 pl-3 backdrop-blur">
      <code className="flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap py-2 font-mono text-xs text-secondary-text-color sm:text-sm">
        <span className="mr-2 select-none text-tertiary-text-color">$</span>
        {display ?? command}
      </code>

      <button
        type="button"
        onClick={copy}
        aria-label={copied ? '복사됨' : '명령어 복사'}
        className="flex shrink-0 items-center gap-1.5 rounded px-3 text-xs font-medium text-secondary-text-color transition-colors hover:bg-surface-hover-color hover:text-primary-text-color"
      >
        {copied
          ? <><Check className="h-3.5 w-3.5 text-success-color" aria-hidden /><span className="hidden sm:inline">복사됨</span></>
          : <><Copy className="h-3.5 w-3.5" aria-hidden /><span className="hidden sm:inline">복사</span></>}
      </button>
    </div>
  )
}
