# Scratch Canvas — Learnings

---
category: task-ordering
applied: not-yet
---
## Plan task order was dependency-correct — no reordering needed

**상황**: Step 2. plan.md의 Task 순서가 이미 타입→엔진→프리셋→페인트→저장→전체연결 의존성 순이었음.
**판단**: 재정렬 없이 그대로 실행. 순서가 명확할수록 plan 단계의 의존성 분석이 가치 있음.
**다시 마주칠 가능성**: 낮음 — plan이 올바르면 생략 가능, plan이 틀리면 재정렬이 필요함.

---
category: code-review
applied: rule
---
## Canvas 포인터 이벤트 좌표에 반드시 CSS→캔버스 해상도 스케일 적용

**상황**: Step 4 코드 리뷰에서 Critical 발견. `getBoundingClientRect()` 좌표가 CSS 픽셀이므로 캔버스 내부 해상도와 다를 때 그리기 위치가 어긋남. 소형(600×600)·중형(800×800)은 scale=1이라 우연히 정상, 나머지 4종은 모두 오작동.

**판단**: 두 훅 모두 수정:
```ts
const scaleX = e.currentTarget.width / rect.width
const scaleY = e.currentTarget.height / rect.height
scratch((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
```
**다시 마주칠 가능성**: 높음 — Canvas API를 사용하는 모든 feature에서 재발 가능. 즉시 규칙 승격.

---
category: code-review
applied: rule
---
## touch-action: none으로 캔버스 터치 지원 — 별도 touchmove 핸들러 불필요

**상황**: Step 4 코드 리뷰. ScratchCanvas에 touchmove 핸들러를 수동으로 추가했는데, 이는 pointer event와 중복 실행될 위험이 있고 유지보수 부담이 됨.

**판단**: `style={{ touchAction: 'none' }}`을 캔버스에 추가하면 브라우저가 touch 이벤트를 pointer 이벤트로 합성 → 별도 touchmove 핸들러 불필요. 코드 단순화.
**다시 마주칠 가능성**: 높음 — 터치 지원이 필요한 모든 Canvas feature에서 반복되는 패턴. 즉시 규칙 승격.

---
category: code-review
applied: not-yet
---
## 브러시 크기: 반지름 vs 직경 — 통일 필요

**상황**: Step 4. useScratchCanvas가 `ctx.arc(x, y, brushSize, ...)` (반지름), usePaintCanvas가 `ctx.arc(x, y, brushSize / 2, ...)` (직경)으로 서로 달랐음. 사용자에게 표시되는 "4px"가 실제로는 8px 원이 됨.

**판단**: 두 훅 모두 직경 기준으로 통일 (`brushSize / 2`를 반지름으로 사용). UX 일관성.
**다시 마주칠 가능성**: 중간 — Canvas 브러시를 다루는 모든 feature에서 재발 가능.

---
category: code-review
applied: not-yet
---
## exportCanvas의 async Image 로드 — 빈 dataURL이면 onload가 안 불림

**상황**: Step 4. `colorDataURL`이 빈 문자열일 때 `Image.onload`가 발화하지 않아 다운로드가 무음 실패.

**판단**: `onerror` 핸들러를 추가해 fallback 동작 제공. 또는 colorDataURL이 보장된 상태에서만 저장 버튼을 활성화하는 방향도 고려 가능.
**다시 마주칠 가능성**: 중간 — Image 비동기 로드 패턴을 쓰는 feature에서 동일 패턴 재발.

---
category: tooling
applied: not-yet
---
## jsdom에서 canvas getContext 모킹 — beforeAll로 prototype 스텁이 가장 단순

**상황**: Step 3, PresetPicker 테스트에서 `document.createElement('canvas').getContext('2d')` null 반환 문제.

**판단**: `HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(fakeCtx)` in `beforeAll`이 가장 깔끔한 해결책. 개별 엘리먼트를 spyOn하거나 createElement를 재정의하는 방식은 무한 재귀 위험.
**다시 마주칠 가능성**: 높음 — Canvas를 쓰는 모든 컴포넌트 테스트에서 반복.

---
category: code-review
applied: not-yet
---
## 스펙 색상값 검증 필요 — pastel 프리셋이 비파스텔 색을 사용했음

**상황**: Step 4 리뷰. `#f72585` (vivid magenta)를 파스텔 색상으로 잘못 사용. spec은 "파스텔 패치워크"를 명시.

**판단**: 실제 파스텔 계열로 교체 (`#f9c8d4`, `#b5ead7`, `#fff3b0`, `#c7e9f0`). 색상값을 직접 결정할 때 spec 테마와 실제 색이 맞는지 검토 필요.
**다시 마주칠 가능성**: 중간 — 색상 팔레트를 자체 결정하는 feature에서 재발 가능.
