# 배포

`main` 에 푸시하면 [GitHub Actions](../.github/workflows/deploy.yml) 가 빌드해서 배포 서버로
릴리스를 밀어 넣고 심링크를 갈아끼운다. 컨테이너도, nginx reload 도 없다.

```
/srv/release/
├── landing -> landing.releases/<새 sha>   ← nginx root
└── landing.releases/
    ├── <옛 sha>/          최근 5개까지 남는다
    └── <새 sha>/          rsync 로 방금 올라온 dist/
```

`landing` 은 디렉터리가 아니라 심링크다. 손으로 배포할 때 `rsync ... /srv/release/landing/` 로
밀어넣으면 rsync 가 심링크를 따라가 릴리스 디렉터리를 직접 고쳐버린다. 항상
`landing.releases/<sha>/` 에 올리고 심링크를 옮긴다.

배포 직전에 페이지를 연 브라우저는 여전히 옛 해시 자산(`/assets/main-<옛해시>.js`)을 요청한다.
릴리스를 몇 개 남겨두는 건 그 요청들이 404 로 죽지 않게 하려는 것이다.

## 서버 1회 설정

`rsync` 와 `nginx` 가 깔려 있어야 한다.

```sh
# 배포 계정과 디렉터리. nginx 워커가 읽어야 하므로 상위 경로는 755 로 연다.
sudo useradd -m -s /bin/bash deploy       # 이미 쓰는 계정이 있으면 생략
sudo mkdir -p /srv/release/landing.releases
sudo chown -R deploy:deploy /srv/release
sudo chmod 755 /srv /srv/release /srv/release/landing.releases
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

이 파일에는 `www.optics.run` → `optics.run` 301 블록이 따로 있다. Cloudflare 에
`www` 레코드가 없으면 그 블록에는 요청이 오지 않는다 — 레코드를 두지 않는 선택도
같은 결과를 내지만, 누군가 나중에 `www` 를 만들었을 때 대비가 되어 있는 편이 낫다.

`root` 가 `landing` 심링크를 가리키므로 **배포를 한 번 돌려 `landing` 이 생긴 뒤에** 사이트를
켠다. 순서가 바뀌면 `nginx -t` 는 통과하고 요청마다 404 가 난다.

## 검색엔진 등록

여기까지는 크롤러가 와서 읽을 수 있는 상태를 만드는 것까지다. **와 달라고 말하는 것은
사람이 한 번 해야 한다.** 링크가 거의 없는 새 도메인은 등록하지 않으면 몇 달 동안
발견되지 않을 수 있다.

| 도구 | 주소 | 왜 |
| --- | --- | --- |
| Google Search Console | https://search.google.com/search-console | 색인 상태·검색어·수동 색인 요청 |
| 네이버 서치어드바이저 | https://searchadvisor.naver.com | 네이버는 등록하지 않으면 사실상 잡히지 않는다 |
| Bing Webmaster Tools | https://www.bing.com/webmasters | Bing·Copilot·DuckDuckGo 가 같은 색인을 쓴다 |
| 다음(카카오) | https://register.search.daum.net/index.daum | 등록 폼 한 번이면 끝난다 |

구글·네이버·Bing 은 소유 확인을 요구한다(다음은 제출 폼뿐이다). **DNS TXT 레코드로 확인한다** — Cloudflare 대시보드에
레코드를 하나 넣으면 되고, 재배포와 무관하게 남는다. HTML 파일 업로드나 `<meta>` 태그
방식을 고르면 그 값이 이 저장소에 들어와야 하고, 도구를 추가할 때마다 한 줄씩 늘어난다.

확인이 끝나면 각 도구에 사이트맵 주소를 넣는다.

```
https://optics.run/sitemap.xml
```

`robots.txt` 에도 같은 주소가 적혀 있지만, 그건 크롤러가 알아서 찾아왔을 때 읽는 것이고
위 등록은 '지금 와서 읽어라'에 해당한다. 둘 다 해 둔다.

새 페이지를 추가했거나 내용을 크게 고쳤을 때는 Search Console 의 URL 검사 → 색인 생성
요청으로 한 번 밀어 준다. 기다리면 어차피 오지만, 며칠이 몇 시간이 된다.

## TLS

위 설정은 80 포트만 연다. Cloudflare 프록시 뒤에 두고 SSL 모드를 Full 이상으로 쓸 거라면
오리진 인증서와 443 블록을 따로 추가해야 한다.

## 롤백

서버에서 심링크만 되돌리면 된다.

```sh
cd /srv/release
ls -1dt landing.releases/          # 남아 있는 릴리스 확인
ln -sfn landing.releases/<되돌릴 sha> landing.tmp && mv -T landing.tmp landing
```
