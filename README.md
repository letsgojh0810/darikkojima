# 다리꼬지마

바탕화면에 상주하는 작은 펫이 한국 직장인의 자세와 일정을 잔소리 톤으로 챙겨 주는 Windows 데스크탑 앱입니다.

- **리마인더 4종:** 다리 꼬지 마, 허리 펴기, 물 마시기, 스트레칭. 항목별 켜기/끄기와 주기(분)를 설정합니다.
- **방해 금지:** 근무 시간(기본 평일 09:00–18:00)과 점심시간(기본 12:00–13:00) 밖에는 알리지 않습니다. 전체화면 앱(발표, 영상, 게임)이 실행 중이거나 일정이 진행 중일 때도 보류하고, 트레이에서 "1시간 조용히"를 고를 수 있습니다.
- **캘린더:** ICS 구독 URL(Google, Outlook, 네이버 등)을 등록하면 일정 시작 N분 전(기본 10분)에 말풍선으로 알려 줍니다.
- **프라이버시:** 모든 설정은 이 PC에만 저장됩니다. 외부로 나가는 요청은 등록한 ICS 주소와 업데이트 확인뿐입니다.

## 설치

1. [Releases](https://github.com/letsgojh0810/darikkojima/releases)에서 최신 `darikkojima_x.y.z_x64-setup.exe`를 받습니다.
2. 실행하면 설치됩니다. **관리자 권한이 필요 없고**, 현재 사용자 폴더(`%LOCALAPPDATA%\Programs`)에 설치됩니다.
3. 이후 새 버전은 앱이 자동으로 확인해 업데이트합니다(6시간마다 확인).

Windows 10/11 x64만 지원합니다.

### SmartScreen 경고가 뜰 때

코드 서명을 하지 않아 처음 실행할 때 "Windows의 PC 보호" 창이 뜰 수 있습니다.

1. **추가 정보**를 누릅니다.
2. **실행**을 누릅니다.

## 사용법

- 펫을 끌어서 옮깁니다. 위치는 다음 실행에도 유지됩니다. 펫 바깥의 빈 공간은 클릭이 아래 창으로 통과합니다.
- 말풍선에서 **확인 / 5분 뒤 / 오늘은 그만** 중 하나를 고릅니다.
- 시스템 트레이 아이콘 메뉴: 펫 숨기기/보이기, 1시간 조용히, 설정, 종료.
- 설정 창: 리마인더별 on/off와 주기, 근무·점심 시간, ICS URL, 일정 사전 알림 시간, Windows 시작 시 자동 실행.
- 앱은 하나만 실행됩니다. 한 번 더 실행하면 숨겨진 펫이 다시 나타납니다.

## 개발 환경

필요한 것:

| 도구 | 비고 |
|---|---|
| Node.js 22 이상 | |
| Rust (stable) | [rustup](https://rustup.rs) |
| Visual Studio Build Tools | "C++를 사용한 데스크톱 개발" 워크로드 |
| WebView2 런타임 | Windows 11은 기본 포함 |

```powershell
npm install
npm run tauri dev      # 개발 실행 (개발 모드에서는 자동 업데이트를 확인하지 않습니다)
npm test               # 단위 테스트 (vitest)
npm run tauri build    # 설치 파일 빌드 (아래 서명 키 필요)
```

구조:

```
src/scheduler   리마인더 스케줄러와 방해 금지 판정(rules.ts, 순수 함수)
src/calendar    CalendarSource 인터페이스, ICS 구현, 일정 알림
src/pet         펫 UI. 애니메이션은 AnimationLayer 뒤에 있어 Rive로 바꾸기 쉽습니다
src/native      Rust 커맨드 호출 래퍼
src/messages    한국어 문구(ko.ts)
src/store       설정 스키마와 저장소
src-tauri       창, 트레이, 전체화면 감지(Win32), 플러그인 등록
```

성능 목표: 유휴 시 메모리 작업 관리자 기준 약 150MB 이하, CPU 1% 미만. WebView2 특성상 100MB 미만은 어렵습니다.

## 릴리스

### 1. 업데이트 서명 키 만들기 (최초 1회)

자동 업데이트는 서명된 파일만 설치합니다. 키는 한 번만 만들고, **개인키는 저장소에 올리지 마세요.** 잃어버리면 기존 사용자에게 업데이트를 보낼 수 없습니다.

```powershell
npx tauri signer generate -w $env:USERPROFILE\.tauri\darikkojima.key
```

- 비밀번호를 물어보면 입력합니다(비워도 되지만 권장하지 않습니다).
- `darikkojima.key`(개인키)와 `darikkojima.key.pub`(공개키)가 생깁니다.
- 공개키 내용을 `src-tauri/tauri.conf.json`의 `plugins.updater.pubkey`에 넣습니다. 이미 들어 있는 값은 이 저장소의 키이므로, 키를 새로 만들면 교체해야 합니다.

### 2. GitHub Secrets 등록

저장소의 **Settings → Secrets and variables → Actions → New repository secret**에서 두 개를 추가합니다.

| 이름 | 값 |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | `darikkojima.key` 파일의 **내용 전체** |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 키 비밀번호 (비밀번호가 없으면 빈 값) |

CLI로 등록하려면:

```powershell
Get-Content $env:USERPROFILE\.tauri\darikkojima.key -Raw | gh secret set TAURI_SIGNING_PRIVATE_KEY
gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD   # 비밀번호가 없으면 이 줄은 건너뜁니다 (secret이 없으면 빈 값으로 처리됩니다)
```

### 3. 버전을 올리고 태그 push

```powershell
# src-tauri/tauri.conf.json 의 "version"을 올립니다 (package.json, Cargo.toml도 맞춰 두면 좋습니다)
git commit -am "chore: release v0.1.1"
git tag v0.1.1
git push origin main v0.1.1
```

`v*` 태그를 push하면 `.github/workflows/release.yml`이 windows-latest에서 테스트 후 빌드하고, **draft** 릴리스에 `setup.exe`, `.sig`, `latest.json`을 올립니다.

### 4. 릴리스 게시

GitHub의 Releases에서 draft를 확인하고 **Publish release**를 누릅니다. 게시해야 앱이 `latest.json`을 읽고 업데이트합니다.

> 업데이트 확인(`releases/latest/download/latest.json`)과 설치 파일 다운로드는 로그인 없이 접근할 수 있어야 하므로, 사용자에게 배포할 때는 저장소를 public으로 두어야 합니다.

### 로컬에서 설치 파일 빌드

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = "$env:USERPROFILE\.tauri\darikkojima.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""   # 키 비밀번호
npm run tauri build
# 결과: src-tauri\target\release\bundle\nsis\darikkojima_<버전>_x64-setup.exe
```

## 범위 외

웹캠 자세 감지, macOS/Linux, OAuth 캘린더(Google, MS Graph), 네이버웍스/카카오 연동, 코드 서명, 최종 캐릭터 디자인(현재는 placeholder).
