# 다리꼬지마 — Windows 데스크탑 펫 리마인더

한국 사무직용 Windows 펫 앱. 자세/물/스트레칭/캘린더를 잔소리 톤으로 리마인드.

## 스택 (고정)
Tauri 2 + React + TypeScript + Vite. Rust는 네이티브(창 제어, 트레이, 전체화면 감지)에만 최소한으로.
저장: tauri-plugin-store. 플러그인: notification, autostart, updater, single-instance, http. 타깃: Windows 10/11 x64만.

## 구조 원칙
- `src/scheduler`, `src/calendar`, `src/pet`, `src/native`를 모듈로 분리. 판정 로직(`rules.ts`, `ics.ts`)은 I/O 없는 순수 함수.
- 애니메이션은 `AnimationLayer` 인터페이스 뒤에 둔다 (나중에 Rive 교체).
- 캘린더는 `CalendarSource` 인터페이스 뒤에 둔다 (OAuth 확장 대비).
- 문구는 `src/messages/ko.ts`에만 둔다. 컴포넌트에 한국어 하드코딩 금지.
- 폴링 금지가 기본. 타이머는 다음 due 시각까지 setTimeout. 예외: 펫 click-through 커서 폴링(보일 때만).
- 외부 전송 금지 (ICS fetch 제외). 모든 데이터는 로컬.

## 명령
- 개발: `npm run tauri dev` / 빌드: `npm run tauri build` / 테스트: `npm test` (vitest)
- 프로젝트 루트에서 `npm --prefix`, `cargo --manifest-path src-tauri/Cargo.toml` 식으로 실행. `cd` 이동 지양.

## 작업 규칙
- 흐름: plan → execute → review → verify (OMC). 작성과 리뷰는 별도 패스. 자기 승인 금지.
- ponytail: 요청되지 않은 기능/추상화/설정 금지. 최소 코드로 끝까지. 새 로직은 테스트 하나 이상.
- 불확실한 플랫폼 제약은 PoC로 먼저 검증 (P1 click-through, P2 전체화면, P3 메모리).
- 단계마다 `npm run tauri dev`로 동작 확인 가능한 상태 유지.
- Tauri/플러그인 API는 구현 전 공식 문서 확인 (document-specialist).
- 코드 서명 키(`*.key`)와 업데이트 서명 개인키는 절대 커밋 금지.
- 커밋은 요청 시에만. 릴리스는 `v*` 태그 push로만.

## 범위 외
웹캠 자세 감지, macOS/Linux, OAuth 캘린더, 코드 서명, 최종 캐릭터 디자인.
