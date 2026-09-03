import { useRef, useState } from 'react'
import { ArrowUpRight, Info } from 'lucide-react'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'
import CopyableCommand from '../components/CopyableCommand'

const RAW = 'http://github.com/OPTiCS-Organization/OPTiCS-Infra/raw/main'
/** 사람이 읽는 GitHub 페이지. RAW 와 달리 blob 경로라 브라우저에서 바로 원문을 볼 수 있다. */
const BLOB = 'https://github.com/OPTiCS-Organization/OPTiCS-Infra/blob/main'

type Platform = 'linux' | 'windows'

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'linux', label: 'Linux' },
  { id: 'windows', label: 'Windows' },
]

/**
 * 설치 스크립트가 실제로 하는 일. 모르는 스크립트를 그대로 실행해 달라는 요청은
 * 그 자체로 신뢰를 깎으므로, 실행 전에 무엇이 벌어지는지 여기서 먼저 밝힌다.
 *
 * 두 플랫폼의 스크립트는 서로 다르다(OPTiCS-Infra/linux/install-agent.sh 와
 * windows/install-agent.ps1 을 각각 읽고 확인했다). 특히 웹 SSH 터미널 설정은
 * Linux 스크립트에만 있고 Windows 스크립트에는 아예 없는 단계라, 하나의 목록으로
 * 뭉뚱그리면 Windows 탭에서 사실이 아닌 내용을 보여주게 된다.
 */
const LINUX_SCRIPT_STEPS = [
  'OS·배포판을 확인하고, Docker·Compose가 없으면 설치 여부를 먼저 확인합니다(동의한 경우에만 sudo를 사용합니다)',
  'Agent 저장소에서 docker-compose.yml과 .env.example 두 파일만 내려받습니다 — 소스를 클론하거나 빌드하지 않으며, 실행되는 이미지는 GHCR에 게시된 것을 그대로 사용합니다',
  '웹 SSH 터미널 사용 여부를 확인하고, 동의한 경우에만 sshd를 설정하고 전용 키를 생성합니다',
  '포트 충돌을 확인한 뒤 이미지를 내려받아 컨테이너를 기동합니다',
]

const WINDOWS_SCRIPT_STEPS = [
  '설치 진행 여부를 먼저 확인한 뒤, Docker Desktop이 없으면 winget으로 설치할지 확인합니다(설치 후 재부팅이 필요할 수 있습니다)',
  'Docker 데몬이 기동할 때까지 최대 2분 대기합니다',
  'Agent 저장소에서 docker-compose.yml과 .env.example 두 파일만 내려받습니다 — 소스를 클론하거나 빌드하지 않으며, 실행되는 이미지는 GHCR에 게시된 것을 그대로 사용합니다',
  '포트 충돌을 확인한 뒤 이미지를 내려받아 컨테이너를 기동합니다',
]

/**
 * 설치.
 *
 * 제거 스크립트를 같이 노출한다. 지우는 법을 숨기지 않는 것이 신뢰를 만든다.
 *
 * 탭 접근성:
 * role="tablist" 를 쓰면 스크린 리더는 화살표 키로 이동할 수 있다고 안내한다.
 * 그 약속을 지키지 않으면 Tab 키만으로는 두 번째 탭에 닿지 못한다. 그래서
 * 선택되지 않은 탭을 포커스 순서에서 빼고(tabIndex -1) 좌우 키로 옮긴다.
 */
export default function Install() {
  const [platform, setPlatform] = useState<Platform>('linux')
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: React.KeyboardEvent) {
    const index = PLATFORMS.findIndex(item => item.id === platform)
    const next =
      event.key === 'ArrowRight' ? (index + 1) % PLATFORMS.length
      : event.key === 'ArrowLeft' ? (index - 1 + PLATFORMS.length) % PLATFORMS.length
      : null

    if (next === null) return

    event.preventDefault()
    setPlatform(PLATFORMS[next]!.id)
    tabsRef.current[next]?.focus()
  }

  return (
    <Section id="install" labelledBy="install-title">
      <SectionHeading id="install-title" eyebrow="시작하기" title="설치는 한 줄입니다">
        <p>
          내 서버에서 실행합니다. Docker가 설치되어 있지 않으면 설치 스크립트가 함께 설치합니다.
        </p>
      </SectionHeading>

      <div
        role="tablist"
        aria-label="설치 플랫폼"
        onKeyDown={onKeyDown}
        className="mt-12 inline-flex gap-1 rounded-md border border-border-color bg-modal-background-color p-1"
      >
        {PLATFORMS.map((item, index) => (
          <button
            key={item.id}
            ref={element => { tabsRef.current[index] = element }}
            type="button"
            role="tab"
            id={`install-tab-${item.id}`}
            aria-selected={platform === item.id}
            aria-controls={`install-panel-${item.id}`}
            tabIndex={platform === item.id ? 0 : -1}
            onClick={() => setPlatform(item.id)}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              platform === item.id
                ? 'bg-surface-active-color text-primary-text-color'
                : 'text-tertiary-text-color hover:text-primary-text-color'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-border-color bg-modal-background-color/40 p-5">
        <p className="text-sm font-medium text-primary-text-color">스크립트는 이 순서로 동작합니다</p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-secondary-text-color">
          {(platform === 'linux' ? LINUX_SCRIPT_STEPS : WINDOWS_SCRIPT_STEPS).map((step, index) => (
            <li key={step} className="flex gap-2.5">
              <span className="shrink-0 font-mono text-tertiary-text-color">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {platform === 'linux' ? (
        <div
          role="tabpanel"
          id="install-panel-linux"
          aria-labelledby="install-tab-linux"
          className="mt-6 space-y-6"
        >
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-secondary-text-color">설치</p>
              <a
                href={`${BLOB}/linux/install-agent.sh`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
              >
                원문 보기
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </a>
            </div>
            <CopyableCommand
              command={`curl -fsSL ${RAW}/linux/install-agent.sh -o install-agent.sh && sh install-agent.sh`}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-secondary-text-color">제거</p>
            <CopyableCommand
              command={`curl -fsSL ${RAW}/linux/uninstall-agent.sh -o uninstall-agent.sh && sh uninstall-agent.sh`}
            />
          </div>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="install-panel-windows"
          aria-labelledby="install-tab-windows"
          className="mt-6 space-y-6"
        >
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-secondary-text-color">설치 (PowerShell)</p>
              <a
                href={`${BLOB}/windows/install-agent.ps1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-secondary-text-color transition-colors hover:text-primary-text-color"
              >
                원문 보기
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </a>
            </div>
            <CopyableCommand command={`irm ${RAW}/windows/install-agent.ps1 | iex`} />
            <p className="mt-2 text-xs leading-relaxed text-tertiary-text-color">
              이 명령은 내려받은 스크립트를 확인 없이 즉시 실행합니다(파이프 실행). 내용을 먼저 확인하시려면
              아래 명령으로 파일만 내려받으십시오. 내용을 확인한 뒤 <code className="font-mono">.\install-agent.ps1</code>로
              직접 실행하시면 됩니다.
            </p>
            <div className="mt-2">
              <CopyableCommand
                command={`irm ${RAW}/windows/install-agent.ps1 -OutFile install-agent.ps1`}
              />
            </div>
          </div>
          {/*
            Windows 쪽에는 아직 제거 스크립트가 없다(OPTiCS-Infra/windows 에 install 만 존재).
            없는 걸 있는 척하지 않고 그대로 밝힌다.
          */}
          <div className="flex items-start gap-3 rounded-md border border-border-color bg-modal-background-color/40 px-4 py-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-color" aria-hidden />
            <p className="text-sm leading-relaxed text-secondary-text-color">
              Windows용 제거 스크립트는 아직 제공하지 않습니다. 컨테이너와 설치 디렉터리를 직접 삭제해야 합니다.
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-tertiary-text-color">
        설치가 완료되면 화면에 연결 코드가 출력됩니다. 해당 코드를 Console에 입력하십시오.
      </p>
    </Section>
  )
}
