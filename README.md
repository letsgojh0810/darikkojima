# 다리꼬지마

바탕화면에 사는 작은 펫이 "다리 또 꼬셨죠?", "물 한 잔 하고 오세요" 같은 잔소리로 자세와 물 마시기, 스트레칭, 일정을 챙겨 주는 Windows 앱입니다.

- 거북이, 고양이, 강아지, 토끼 중에 고를 수 있고 크기도 바꿀 수 있어요.
- 근무 시간, 점심시간, 전체화면(발표·영상·게임) 중에는 조용히 있어요.
- 구글·아웃룩 같은 캘린더를 연결하면 회의 10분 전에 알려 줘요.
- 내 PC 밖으로 나가는 정보가 없어요. 설정은 이 PC에만 저장되고, 외부로 나가는 요청은 연결한 캘린더 주소와 업데이트 확인뿐이에요.

## 설치하기

Windows 10/11 (64비트)에서 쓸 수 있어요. 관리자 권한은 필요 없어요.

1. [Releases](https://github.com/letsgojh0810/darikkojima/releases) 페이지에서 가장 위에 있는 버전의 `darikkojima_x.y.z_x64-setup.exe`를 내려받아요.
2. 내려받은 파일을 실행해요. 설치 마법사는 한국어이고, "다음"만 누르면 돼요.
3. 설치가 끝나면 바탕화면에 펫이 나타나요.

### "Windows의 PC 보호" 창이 뜨면

처음 실행할 때 파란 경고창이 뜰 수 있어요. 아직 코드 서명을 받지 않은 앱이라 그래요.

1. 창 안의 **추가 정보**를 눌러요.
2. 아래에 생긴 **실행**을 눌러요.

## 처음 쓰는 법

설치하면 기본 설정으로 바로 알려 줘요. 평일 오전 9시부터 오후 6시까지 알려 주고, 점심시간(낮 12시부터 오후 1시까지)에는 쉬어요.

| 하고 싶은 것 | 방법 |
|---|---|
| 펫 옮기기 | 펫을 끌어서 놓아요. 다음에 켜도 그 자리에 있어요. 끄는 동안 펫이 달려가거나 헤엄쳐요. |
| 펫과 놀기 | 마우스를 올리면 웃고, 클릭하면 한마디를 해요. |
| 알림에 답하기 | 말풍선의 **했어요**를 누르면 닫혀요. **5분 뒤에 다시**는 5분 뒤에 다시 알려 주고, **오늘은 그만**은 그 알림만 내일까지 꺼요. |
| 설정 열기 | 펫을 오른쪽 클릭하거나, 작업표시줄 오른쪽 아래(숨겨진 아이콘 포함) 트레이 아이콘의 **설정**을 눌러요. |
| 잠깐 조용히 하기 | 펫 우클릭 → **1시간 조용히** (트레이 메뉴에도 있어요) |
| 펫 숨기기 | 트레이 아이콘 → **펫 숨기기**. 다시 보려면 **펫 보이기**를 눌러요. |
| 끄기 | 펫 우클릭 → **종료** |

앱은 하나만 실행돼요. 숨겨 둔 펫은 앱을 한 번 더 실행해도 다시 나와요.

## 설정하기

설정 창은 **일반**과 **펫** 두 탭이에요. 바꾼 내용은 **저장**을 눌러야 적용되고, **취소**하거나 창을 닫으면 버려져요.

**일반 탭**
- **알려줄 것들:** 다리 꼬지 않기, 허리 펴기, 물 마시기, 스트레칭을 켜고 끄고, 몇 분마다 알려 줄지 정해요. 아래 입력창에 "약 먹기"처럼 쓰고 **추가하기**를 누르면 내가 만든 알림도 넣을 수 있어요.
- **알림 시간:** 일하는 시간, 요일, 점심시간을 정해요. 이 밖의 시간에는 알리지 않아요.
- **일정 알림:** 캘린더 주소를 붙여 넣고, 일정 몇 분 전에 알려 줄지 정해요. (아래 "캘린더 연결하기")
- **기본 설정:** 컴퓨터를 켜면 같이 시작할지 정해요.

**펫 탭**
- **펫 고르기:** 거북이, 고양이, 강아지, 토끼 중에 눌러서 고르면 펫이 바로 바뀌어 보여요.
- **펫 크기:** 슬라이더로 50%에서 150% 사이로 정해요. 움직이는 동안 바로 보여요.

### 캘린더 연결하기

캘린더의 **비공개 주소(iCal)** 를 붙여 넣으면 돼요. 로그인 정보는 필요 없어요.

- **구글 캘린더:** 웹에서 설정 → 연결할 캘린더 선택 → **캘린더 통합** → "iCal 형식의 비공개 주소"를 복사해요.
- **아웃룩:** 설정 → 캘린더 → **공유 캘린더** → 캘린더 게시 후 ICS 링크를 복사해요.
- 메뉴 이름은 서비스가 바뀌면 달라질 수 있어요.

설정 → 일반 → **일정 알림**의 입력창에 붙여 넣고 **추가하기**, **저장**을 눌러요. 15분마다 새로 불러와요.

비공개 주소는 비밀번호처럼 쓰여요. 다른 사람에게 보여 주지 마세요. 설정 창에는 주소의 앞부분(호스트)만 보여요.

### 이럴 땐 알림이 안 와요
- 일하는 시간이 아닌 시간, 점심시간, 선택하지 않은 요일
- 발표·영상·게임 같은 전체화면 앱을 쓰는 중
- 회의 일정이 진행 중일 때 (자세 알림만. 일정 알림은 와요)
- **1시간 조용히** 중
- 그 알림을 껐을 때 (설정의 스위치, 또는 말풍선에서 **오늘은 그만**)

## 업데이트와 삭제

- **업데이트:** 앱이 켜져 있는 동안 6시간마다 새 버전을 확인해서 알아서 설치해요.
- **삭제:** Windows 설정 → 앱 → 설치된 앱 → **다리꼬지마** → 제거
- **설정 초기화:** 앱을 끄고 `%APPDATA%\com.darikkojima.app` 폴더의 `settings.json`을 지우면 처음 상태로 돌아가요.

## 문제가 있을 때

| 증상 | 확인해 보세요 |
|---|---|
| 펫이 안 보여요 | 트레이 아이콘(숨겨진 아이콘 포함) → **펫 보이기**. 그래도 없으면 앱을 한 번 더 실행해요. |
| 알림이 안 와요 | 위의 "이럴 땐 알림이 안 와요"를 확인해요. |
| 일정 알림이 안 와요 | 주소가 `https://`로 시작하는지, 캘린더에서 "비공개 주소"를 복사했는지 확인해요. |
| 펫이 화면 밖으로 사라졌어요 | 모니터를 바꾸면 저장된 위치가 화면 밖일 수 있어요. 설정 초기화를 해 보세요. |

macOS와 Linux는 아직 지원하지 않아요.

---

# 개발자용

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
src/scheduler   리마인더 스케줄러(기본 + 사용자 정의)와 방해 금지 판정(rules.ts, 순수 함수)
src/calendar    CalendarSource 인터페이스, ICS 구현, 일정 알림
src/pet         펫 UI. anim/pets.ts의 목록에서 펫을 고르고, 펫 컴포넌트는 PetAnimation 인터페이스 뒤에 있습니다
src/native      Rust 커맨드 호출 래퍼
src/messages    한국어 문구(ko.ts), 펫별 클릭 문구 포함
src/store       설정 스키마와 저장소
src/tokens.css  디자인 토큰(TDS 스타일), 라이트/다크 모드
src-tauri       창, 트레이, 전체화면 감지(Win32), 플러그인 등록
```

성능 목표: 유휴 시 프라이빗 메모리 약 180MB 이하, CPU 1% 미만(작업 관리자 전체 기준). 릴리스 빌드 실측은 메모리 약 170MB, CPU 약 0.1%입니다(펫 추가·드래그 동작 이전 측정). WebView2 특성상 100MB 미만은 어렵습니다.

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
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 키 비밀번호 (비밀번호가 없으면 만들지 않아도 됩니다) |

CLI로 등록하려면:

```powershell
Get-Content $env:USERPROFILE\.tauri\darikkojima.key -Raw | gh secret set TAURI_SIGNING_PRIVATE_KEY
gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD   # 비밀번호가 없으면 이 줄은 건너뜁니다
```

### 3. 버전을 올리고 태그 push

```powershell
# src-tauri/tauri.conf.json, package.json, src-tauri/Cargo.toml 의 version을 같은 값으로 올립니다
git commit -am "chore: release v0.1.2"
git tag v0.1.2
git push origin main v0.1.2
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

웹캠 자세 감지, macOS/Linux, OAuth 캘린더(Google, MS Graph), 네이버웍스/카카오 연동, 코드 서명.
