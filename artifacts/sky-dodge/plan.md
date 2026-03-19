# Sky Dodge 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 렌더링 방식 | HTML5 Canvas 2D | 2D 횡스크롤 게임에 최적. WebGL은 과도 |
| 게임 루프 | requestAnimationFrame + delta time | 브라우저 최적화 렌더링, 프레임률 독립 물리 |
| 충돌 판정 | AABB (Axis-Aligned Bounding Box) | 사각형 파이프/비행기에 적합, 구현 단순 |
| 리더보드 DB | JSON 파일 (scores.json) | DB 설치 불필요, 소규모 데모에 적합 |
| Canvas 해상도 | 480x640 고정 + CSS 스케일링 | 모든 화면에서 동일한 게임 경험 |
| 게임-React 통합 | 단일 Client Component에서 Canvas ref 관리 | 게임 로직은 순수 JS 모듈로 분리, React는 화면 전환/UI만 담당 |

## Required Skills

| 스킬 | 용도 |
|------|------|
| `vercel-react-best-practices` | React/Next.js 성능 최적화 규칙 |
| `web-design-guidelines` | Web Interface Guidelines 준수 |
| `game-engine` | Canvas 2D, 게임 루프, 충돌 판정, 입력 처리 레퍼런스 |
| `shadcn` | UI 컴포넌트(Button, Input, Table) 규칙 준수 |

## UI Components

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| Button | `bunx shadcn@latest add button` |
| Input | `bunx shadcn@latest add input` |
| Table | `bunx shadcn@latest add table` |

### 커스텀 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `GameCanvas` | Canvas ref 관리, 게임 엔진 초기화/정리, CSS 스케일링 |
| `StartScreen` | 타이틀, Play/Leaderboard 버튼 |
| `GameOverScreen` | 최종 점수, 이름 입력, Submit/Skip |
| `LeaderboardScreen` | 상위 10명 테이블 |
| `PauseOverlay` | 일시정지 오버레이 |

## 실행 프로토콜

- 각 task 시작 전, **참조 규칙**에 나열된 파일을 반드시 읽고 규칙을 준수하며 구현한다

## Tasks

### Task 0: shadcn UI 컴포넌트 설치

- **시나리오**: (선행 작업)
- **참조 규칙**: `.claude/skills/shadcn/rules/composition.md`, `.claude/skills/shadcn/cli.md`
- **구현 대상**: Button, Input, Table 컴포넌트 설치
- **수용 기준**:
  - [ ] `bunx shadcn@latest add button input table` 실행 후 `components/ui/` 에 파일 생성 확인
  - [ ] `bun run build` 성공
- **커밋**: `chore: add shadcn button, input, table components`

---

### Task 1: Spec 테스트 생성

- **시나리오**: SKY-001~027 전체
- **참조 규칙**: `artifacts/spec.yaml`, `artifacts/sky-dodge/spec.md`
- **구현 대상**: `__tests__/sky-dodge.spec.test.tsx` — spec.yaml의 모든 시나리오를 수용 기준 테스트로 변환
- **수용 기준**:
  - [ ] spec.yaml의 27개 시나리오가 각각 테스트 케이스로 존재
  - [ ] `getByRole`, `getByText` 등 구현 비의존 셀렉터 사용
  - [ ] `bun run test` 실행 시 모든 테스트가 FAIL (Red 상태)
- **커밋**: `test: add spec tests for sky-dodge game (red)`

---

### Task 2: 게임 엔진 코어 — 게임 루프 및 물리

- **시나리오**: SKY-023, SKY-024, SKY-027
- **참조 규칙**:
  - `.claude/skills/game-engine/references/basics.md` (게임 루프 구조)
  - `.claude/skills/game-engine/references/algorithms.md` (물리 연산)
  - `.claude/skills/game-engine/references/web-apis.md` (Canvas API, rAF)
  - `.claude/skills/vercel-react-best-practices/rules/client-event-listeners.md`
  - `.claude/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md`
- **구현 대상**:
  - `lib/game/engine.ts` — GameLoop 클래스 (rAF, delta time 계산, 50ms 클램핑)
  - `lib/game/physics.ts` — 중력, 속도, 위치 업데이트 (delta time 기반)
  - `lib/game/constants.ts` — 게임 상수 (CANVAS_WIDTH=480, CANVAS_HEIGHT=640, GRAVITY, MAX_DELTA 등)
  - 단위 테스트: `__tests__/game/engine.test.tsx`, `__tests__/game/physics.test.tsx`
- **수용 기준**:
  - [ ] delta time 16ms 입력 → 위치 = 이전 위치 + 속도 * 0.016
  - [ ] delta time 2000ms 입력 → 50ms로 클램핑되어 위치 = 이전 위치 + 속도 * 0.05
  - [ ] Canvas 크기 상수 480x640 정의
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add game loop and delta-time physics engine`

---

### Task 3: 입력 시스템 — 키보드 및 터치

- **시나리오**: SKY-003, SKY-004, SKY-005
- **참조 규칙**:
  - `.claude/skills/game-engine/references/game-control-mechanisms.md` (키보드/터치 입력 패턴)
  - `.claude/skills/vercel-react-best-practices/rules/client-event-listeners.md`
  - `.claude/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md`
- **구현 대상**:
  - `lib/game/input.ts` — InputSystem (스페이스바 keydown/keyup, touchstart/touchend 상태 추적)
  - 단위 테스트: `__tests__/game/input.test.tsx`
- **수용 기준**:
  - [ ] 스페이스바 keydown 이벤트 → `isFlapping` = true
  - [ ] 스페이스바 keyup 이벤트 → `isFlapping` = false
  - [ ] touchstart 이벤트 → `isFlapping` = true
  - [ ] touchend 이벤트 → `isFlapping` = false
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add keyboard and touch input system`

---

### Task 4: 비행기 및 파이프 엔티티

- **시나리오**: SKY-003, SKY-004, SKY-006, SKY-020
- **참조 규칙**:
  - `.claude/skills/game-engine/references/techniques.md` (충돌 판정)
  - `.claude/skills/game-engine/references/algorithms.md` (AABB)
  - `.claude/skills/game-engine/references/game-engine-core-principles.md` (엔티티 설계)
- **구현 대상**:
  - `lib/game/plane.ts` — Plane 엔티티 (위치, 속도, 상승/하강 로직)
  - `lib/game/pipe.ts` — Pipe 엔티티 (생성, 이동, 틈 위치)
  - `lib/game/spawner.ts` — PipeSpawner (일정 간격으로 파이프 생성)
  - 단위 테스트: `__tests__/game/plane.test.tsx`, `__tests__/game/pipe.test.tsx`
- **수용 기준**:
  - [ ] Plane: flap() 호출 → velocity.y가 음수(상승)로 설정
  - [ ] Plane: update(dt) → 중력 적용되어 position.y 변경
  - [ ] Pipe: 생성 시 x = 480(오른쪽 끝), 랜덤 gapY
  - [ ] Pipe: update(dt) → x가 감소(왼쪽 이동)
  - [ ] PipeSpawner: 일정 간격마다 새 Pipe 생성
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add plane and pipe entities with spawner`

---

### Task 5: 충돌 판정 및 점수

- **시나리오**: SKY-006, SKY-007, SKY-008, SKY-009
- **참조 규칙**:
  - `.claude/skills/game-engine/references/techniques.md` (2D 충돌 판정)
  - `.claude/skills/game-engine/references/algorithms.md` (AABB)
- **구현 대상**:
  - `lib/game/collision.ts` — AABB 충돌 판정 (비행기↔파이프, 비행기↔경계)
  - `lib/game/score.ts` — 점수 시스템 (파이프 통과 감지, 점수 증가)
  - 단위 테스트: `__tests__/game/collision.test.tsx`, `__tests__/game/score.test.tsx`
- **수용 기준**:
  - [ ] 비행기 rect와 파이프 rect 겹침 → `collides` = true
  - [ ] 비행기 y < 0 또는 y + height > 640 → 경계 충돌 = true
  - [ ] 비행기가 파이프 x를 통과 → 점수 +1
  - [ ] 이미 통과한 파이프는 재카운트하지 않음
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add AABB collision detection and scoring`

---

### Task 6: 난이도 시스템

- **시나리오**: SKY-010, SKY-011, SKY-021, SKY-022
- **참조 규칙**:
  - `.claude/skills/game-engine/references/game-engine-core-principles.md`
- **구현 대상**:
  - `lib/game/difficulty.ts` — DifficultySystem (시간→속도 증가, 점수→틈 축소, 상한/하한 클램핑)
  - 단위 테스트: `__tests__/game/difficulty.test.tsx`
- **수용 기준**:
  - [ ] elapsedTime 증가 → scrollSpeed 증가
  - [ ] scrollSpeed가 MAX_SPEED에 도달 → 더 이상 증가 안 함
  - [ ] score 증가 → gapSize 감소
  - [ ] gapSize가 MIN_GAP에 도달 → 더 이상 감소 안 함
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add difficulty system with speed and gap scaling`

---

### Task 7: 테마 시스템

- **시나리오**: SKY-012, SKY-013, SKY-014, SKY-015
- **참조 규칙**:
  - `.claude/skills/game-engine/references/web-apis.md` (Canvas 드로잉)
- **구현 대상**:
  - `lib/game/theme.ts` — ThemeSystem (점수→테마 매핑, 배경색/장식 요소 정의)
  - `lib/game/renderer.ts` — Canvas 렌더러 (배경, 파이프, 비행기, 점수 드로잉)
  - 단위 테스트: `__tests__/game/theme.test.tsx`
- **수용 기준**:
  - [ ] score 0~9 → theme = "day"
  - [ ] score 10~24 → theme = "sunset"
  - [ ] score 25~49 → theme = "night"
  - [ ] score 50+ → theme = "space"
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add theme system with 4-stage background transitions`

---

### Task 8: 게임 상태 관리 및 화면 전환

- **시나리오**: SKY-001, SKY-025, SKY-026
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-derived-state.md`
  - `.claude/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md`
  - `.claude/skills/vercel-react-best-practices/rules/rendering-conditional-render.md`
- **구현 대상**:
  - `lib/game/state.ts` — GameState 관리 (start, playing, paused, gameover)
  - 탭 비활성화 감지 (visibilitychange 이벤트 → paused 전환)
  - 단위 테스트: `__tests__/game/state.test.tsx`
- **수용 기준**:
  - [ ] 초기 상태 = "start"
  - [ ] play() → 상태 "playing"
  - [ ] visibilitychange hidden → 상태 "paused"
  - [ ] visibilitychange visible → 상태 "paused" 유지
  - [ ] resume() → 상태 "playing"
  - [ ] gameOver() → 상태 "gameover"
  - [ ] `bun run test` — 관련 단위 테스트 통과
- **커밋**: `feat: add game state management with auto-pause`

---

### Task 9: React 통합 — GameCanvas 컴포넌트

- **시나리오**: SKY-001, SKY-027
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/client-event-listeners.md`
  - `.claude/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md`
  - `.claude/skills/vercel-react-best-practices/rules/advanced-init-once.md`
  - `.claude/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md`
  - `.claude/skills/shadcn/rules/composition.md`
  - `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- **구현 대상**:
  - `components/game/GameCanvas.tsx` — Canvas ref, 게임 엔진 초기화/정리, CSS 스케일링
  - `components/game/StartScreen.tsx` — Play/Leaderboard 버튼
  - `components/game/GameOverScreen.tsx` — 점수, 이름 입력, Submit/Skip
  - `components/game/PauseOverlay.tsx` — Paused 오버레이
  - `app/page.tsx` — 메인 페이지 (화면 전환 관리)
- **수용 기준**:
  - [ ] 페이지 로드 → 시작 화면 표시 (Play, Leaderboard 버튼)
  - [ ] Play 클릭 → Canvas 표시, 게임 시작
  - [ ] 게임 오버 → GameOverScreen 표시 (최종 점수)
  - [ ] Canvas 480x640 내부 해상도, CSS로 화면 맞춤 스케일링
  - [ ] 탭 비활성화 → PauseOverlay 표시
  - [ ] `bun run test` — 관련 테스트 통과
- **커밋**: `feat: add React game components with screen transitions`

---

### Task 10: 리더보드 API 및 UI

- **시나리오**: SKY-002, SKY-016, SKY-017, SKY-018, SKY-019
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/async-api-routes.md`
  - `.claude/skills/vercel-react-best-practices/rules/server-serialization.md`
  - `.claude/skills/shadcn/rules/forms.md`
  - `.claude/skills/shadcn/rules/composition.md`
  - `.claude/skills/shadcn/rules/styling.md`
  - `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- **구현 대상**:
  - `app/api/leaderboard/route.ts` — GET (상위 10명 조회), POST (점수 제출)
  - `lib/leaderboard.ts` — JSON 파일 읽기/쓰기, 정렬, 상위 10명 필터링
  - `components/game/LeaderboardScreen.tsx` — Table로 리더보드 표시, Back 버튼
  - `data/scores.json` — 초기 빈 배열
  - 단위 테스트: `__tests__/leaderboard.test.tsx`
- **수용 기준**:
  - [ ] POST { name: "ACE", score: 30 } → scores.json에 저장
  - [ ] GET → 점수 내림차순 상위 10명 반환
  - [ ] 이름 빈 문자열 → Submit 버튼 disabled
  - [ ] Submit 클릭 → 서버 저장 후 리더보드 화면 전환
  - [ ] Skip 클릭 → 시작 화면 전환
  - [ ] 리더보드에 순위, 이름, 점수 칼럼 표시
  - [ ] `bun run test` — 관련 테스트 통과
- **커밋**: `feat: add leaderboard API and UI with JSON storage`

---

### Task 11: 통합 테스트 및 Spec 테스트 통과

- **시나리오**: SKY-001~027 전체
- **참조 규칙**: `artifacts/spec.yaml`, `artifacts/sky-dodge/spec.md`
- **구현 대상**: Task 1에서 생성한 spec 테스트가 모두 통과하도록 통합 및 수정
- **수용 기준**:
  - [ ] `bun run test` — 모든 spec 테스트(*.spec.test.tsx) 통과 (Green)
  - [ ] `bun run test` — 모든 단위 테스트(*.test.tsx) 통과
  - [ ] `bun run build` — 빌드 성공
- **커밋**: `test: all spec and unit tests passing (green)`

---

## 미결정 사항

- 없음 (모든 항목 확정됨)
