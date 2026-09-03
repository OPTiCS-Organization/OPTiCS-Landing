# 배포

`main` 에 푸시하면 [GitHub Actions](../.github/workflows/deploy.yml) 가 빌드해서 배포 서버로
릴리스를 밀어 넣고 심링크를 갈아끼운다. 컨테이너도, nginx reload 도 없다.

```
/srv/optics-landing/
├── releases/
│   ├── <옛 sha>/          최근 5개까지 남는다
│   └── <새 sha>/          rsync 로 방금 올라온 dist/
└── current -> releases/<새 sha>
```

배포 직전에 페이지를 연 브라우저는 여전히 옛 해시 자산(`/assets/main-<옛해시>.js`)을 요청한다.
릴리스를 몇 개 남겨두는 건 그 요청들이 404 로 죽지 않게 하려는 것이다.

## 서버 1회 설정

`rsync` 와 `nginx` 가 깔려 있어야 한다.

```sh
# 배포 계정과 디렉터리. nginx 워커가 읽어야 하므로 상위 경로는 755 로 연다.
sudo useradd -m -s /bin/bash deploy       # 이미 쓰는 계정이 있으면 생략
sudo mkdir -p /srv/optics-landing/releases
sudo chown -R deploy:deploy /srv/optics-landing
sudo chmod 755 /srv /srv/optics-landing /srv/optics-landing/releases
```

배포 키를 만들어 공개키만 서버에 둔다. 로컬에서:

```sh
ssh-keygen -t ed25519 -f optics-landing-deploy -N '' -C 'github-actions@optics-landing'
```

- `optics-landing-deploy.pub` → 서버 `deploy` 계정의 `~/.ssh/authorized_keys`
- `optics-landing-deploy` (개인키) → GitHub 저장소 시크릿 `DEPLOY_SSH_KEY`
- 로컬 사본은 지운다

## GitHub 저장소 설정

Settings → Secrets and variables → Actions.

| 종류 | 이름 | 값 |
| --- | --- | --- |
| Secret | `DEPLOY_SSH_KEY` | 위에서 만든 개인키 전체 (`-----BEGIN` 줄 포함) |
| Variable | `DEPLOY_HOST` | 배포 서버 주소 |
| Variable | `DEPLOY_USER` | `deploy` |
| Variable | `VITE_API_URL` | Hub API 베이스 URL |
| Variable | `DEPLOY_HOST_KEY` | (선택) 아래 '호스트 키 고정' 참고 |

`VITE_API_URL` 은 빌드 시점에 번들 문자열로 박힌다. 런타임 환경변수가 아니라서 서버의 `.env` 는
아무 영향이 없고, 이 변수를 바꾸면 **다시 빌드해야** 반영된다. 값이 비면 실시간 메트릭 섹션이
조용히 사라지므로 워크플로에서 미리 막아 둔다.

### 호스트 키 고정 (선택)

기본값은 매 실행 `ssh-keyscan` 이라 첫 접속을 그대로 믿는다(TOFU). 엄격하게 가려면 서버에서 한 번

```sh
ssh-keyscan -H <배포서버주소>
```

을 떠서 출력 전체를 저장소 변수 `DEPLOY_HOST_KEY` 에 넣는다. 그 변수가 있으면 워크플로가
keyscan 대신 그 값을 쓴다.

## nginx 설정 반영

[nginx/optics.run.conf](nginx/optics.run.conf) 는 저장소에서 관리하지만 배포 워크플로가 건드리지
않는다. 잘못된 설정 한 줄이 사이트 전체를 내리기 때문에 사람이 확인하고 넣는다.

```sh
sudo cp deploy/nginx/optics.run.conf /etc/nginx/sites-available/optics.run
sudo ln -sfn /etc/nginx/sites-available/optics.run /etc/nginx/sites-enabled/optics.run
sudo nginx -t && sudo systemctl reload nginx
```

`root` 가 `current` 심링크를 가리키므로 **배포를 한 번 돌려 `current` 가 생긴 뒤에** 사이트를
켠다. 순서가 바뀌면 `nginx -t` 는 통과하고 요청마다 404 가 난다.

## TLS

위 설정은 80 포트만 연다. Cloudflare 프록시 뒤에 두고 SSL 모드를 Full 이상으로 쓸 거라면
오리진 인증서와 443 블록을 따로 추가해야 한다.

## 롤백

서버에서 심링크만 되돌리면 된다.

```sh
cd /srv/optics-landing
ls -1dt releases/          # 남아 있는 릴리스 확인
ln -sfn releases/<되돌릴 sha> current.tmp && mv -T current.tmp current
```
