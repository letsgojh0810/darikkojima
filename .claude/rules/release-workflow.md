---
name: release-workflow
description: >
  커밋·push·태그·릴리즈 절차. 사용자가 커밋이나 릴리즈를 요청했을 때,
  버전을 올릴 때, 릴리즈 빌드 결과를 확인·공개할 때 적용한다.
---

# Release Workflow — 요청 시에만, 검증 후 공개

커밋·push·태그·릴리즈는 사용자가 요청했을 때만 한다. 작업이 끝나면 "아직 커밋 안 했다"고 상태만 알린다.

## Process

### Step 1: 사전 검증

```bash
npx tsc --noEmit -p .
npx vitest run
cargo check --manifest-path src-tauri/Cargo.toml   # Rust를 바꿨을 때
```

임시 파일(`zz-*`)이 남아 있으면 지운다.

### Step 2: 커밋

- 메시지는 한국어. 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- push 전 커밋은 정리해도 된다(예: 되돌린 작업이 기록에 남지 않게 합치기). push한 커밋은 다시 쓰지 않는다.

### Step 3: 버전 올리기 (4곳)

| 파일 | 위치 |
|------|------|
| `package.json` | `"version"` |
| `src-tauri/tauri.conf.json` | `"version"` |
| `src-tauri/Cargo.toml` | `[package] version` |
| `src-tauri/Cargo.lock` | `name = "darikkojima"` 항목의 version |

커밋 `chore: vX.Y.Z` → main push → `vX.Y.Z` 태그 push. `release.yml`이 Windows → Mac 순으로 같은 **draft** 릴리즈에 올린다. 빌드는 백그라운드로 기다린다.

### Step 4: Draft 검증

```markdown
| # | Check | Result |
|---|-------|--------|
| 1 | **Windows·Mac 빌드 둘 다 success** | ✅/❌ |
| 2 | **파일 전부 있음** — _x64-setup.exe(+.sig), _aarch64.dmg, _aarch64.app.tar.gz(+.sig), latest.json | ✅/❌ |
| 3 | **latest.json version** = 새 버전 | ✅/❌ |
| 4 | **latest.json URL** — windows-x86_64·darwin-aarch64가 이번 파일을 가리킴 | ✅/❌ |
| 5 | **서명 일치** — 각 플랫폼 signature = .sig 파일 내용 | ✅/❌ |
| 6 | **태그가 의도한 커밋** — 마지막 수정이 포함된 커밋을 가리킴 | ✅/❌ |
```

### Step 5: Verdict

| Result | Verdict |
|--------|---------|
| 6/6 | **공개** — 노트 설정 후 `--draft=false --latest` |
| ❌ 있음 | **공개하지 않고 보고** |

### Step 6: 공개 후 알림

공개했다고 알린다. 사용자는 재시작해서 업데이트를 받는다.

## Rules

1. **요청 없이 커밋·태그·릴리즈 금지.**
2. **draft 검증 전 공개 금지.**
3. **릴리즈 노트는 사용자가 정한 문구만** — 하나로 정했으면(예: `핫픽스`) 본문은 그 문구만. 개인정보·실명 금지.
4. **잠수함 패치 금지** — 공개한 버전에 파일만 바꿔 올리지 않는다. 자동 업데이트는 버전이 높아야 받으므로 기존 사용자에게 전달되지 않고 같은 버전에 두 내용이 섞인다. 고치면 끝자리를 올린다.
5. **태그 후 변경이 들어오면 (공개 전만)** — 빌드 취소 → 원격·로컬 태그 삭제 → draft가 있으면 삭제 → 변경 커밋 → 같은 버전 태그 다시 push.
6. **서명 개인키는 커밋하지 않는다.**
