# Scratch Canvas 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 라우팅 | `app/scratch-canvas/page.tsx` 신규 페이지 | 기존 `app/page.tsx` 충돌 없이 독립 |
| Canvas 방식 | 2-layer: 컬러 캔버스(bottom) + 블랙 오버레이 캔버스(top) | top에만 `destination-out` 적용해 오버레이만 지움 |
| 컬러 레이어 전달 | 단계 전환 시 `canvas.toDataURL()` → state 저장 | 컴포넌트 언마운트 후에도 유지, 직렬화 비용 감수 가능 |
| Paint 브러시 슬라이더 | 네이티브 `<input type="range">` | shadcn Slider 미설치, 추가 불필요 |
| 상태 관리 | 페이지 단위 `useState` | 로그인 없는 3-step 앱, 전역 상태 불필요 |
| Dialog | 기존 `components/ui/dialog.tsx` 재사용 | 이미 설치됨 |
| 탭 컨테이너 소유권 | PresetPicker·PaintCanvas 각각이 탭 바를 렌더하고 `onSwitchMode` 콜백으로 page.tsx의 `layerMode` state를 변경 | 탭 전환이 단방향 콜백으로 명확, 별도 래퍼 컴포넌트 불필요 |

## 인프라 리소스

None

## 데이터 모델

### 타입 (`types/scratch-canvas.ts`)
- `CanvasSize` — `{ width: number; height: number; label: string }`
- `AppStep` — `'size-pick' | 'layer-pick' | 'scratch'`
- `LayerMode` — `'preset' | 'paint'`  ← page.tsx가 소유, PresetPicker/PaintCanvas 전환 제어
- `PresetId` — `'rainbow' | 'night' | 'sunset' | 'dawn' | 'forest' | 'pastel'`
- `ScratchBrushSize` — `2 | 4 | 6 | 8`
- `ColorLayerDataURL` — `string` (canvas.toDataURL 결과)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | Task 1, 2, 3, 4, 6 | Button, Card, Dialog 사용; styling 규칙 (semantic token, cn()) |
| vercel-react-best-practices | Task 2, 4 | pointer event listener passive 처리, canvas ref 패턴 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/scratch-canvas.ts` | New | Task 1 |
| `app/scratch-canvas/page.tsx` | New | Task 1, 6 |
| `components/scratch-canvas/SizePicker.tsx` | New | Task 1 |
| `components/scratch-canvas/SizePicker.test.tsx` | New | Task 1 |
| `hooks/useScratchCanvas.ts` | New | Task 2 |
| `hooks/useScratchCanvas.test.ts` | New | Task 2 |
| `components/scratch-canvas/ScratchCanvas.tsx` | New | Task 2, 5, 6 |
| `components/scratch-canvas/ScratchCanvas.test.tsx` | New | Task 2 |
| `lib/presets.ts` | New | Task 3 |
| `lib/presets.test.ts` | New | Task 3 |
| `components/scratch-canvas/PresetPicker.tsx` | New | Task 3 |
| `components/scratch-canvas/PresetPicker.test.tsx` | New | Task 3 |
| `hooks/usePaintCanvas.ts` | New | Task 4 |
| `hooks/usePaintCanvas.test.ts` | New | Task 4 |
| `components/scratch-canvas/PaintCanvas.tsx` | New | Task 4 |
| `components/scratch-canvas/PaintCanvas.test.tsx` | New | Task 4 |
| `lib/exportCanvas.ts` | New | Task 5 |
| `lib/exportCanvas.test.ts` | New | Task 5 |

---

## Tasks

### Task 1: App 진입점 + 캔버스 크기 선택

- **담당 시나리오**: Scenario 1 (full)
- **크기**: M (4 파일)
- **의존성**: None
- **참조**:
  - shadcn — Button, Card 컴포넌트
- **구현 대상**:
  - `types/scratch-canvas.ts` — CanvasSize, AppStep, PresetId, ScratchBrushSize, ColorLayerDataURL
  - `app/scratch-canvas/page.tsx` — AppStep state, 단계별 조건부 렌더
  - `components/scratch-canvas/SizePicker.tsx` — 6종 크기 카드 그리드, onSelect 콜백
  - `components/scratch-canvas/SizePicker.test.tsx`
- **수용 기준**:
  - [ ] `/scratch-canvas` 접속 시 캔버스 크기 선택 화면이 표시된다
  - [ ] 6종 크기 옵션(소형 정사각 600×600, 중형 정사각 800×800, 대형 정사각 1200×1200, 가로형 1200×800, 세로형 800×1200, 와이드 1600×900)이 모두 표시된다
  - [ ] 하나를 클릭하면 선택 상태(강조 테두리)로 바뀐다
  - [ ] 크기를 선택하면 색상 레이어 준비 화면으로 이동한다
- **검증**: `bun run test -- SizePicker`

---

### Task 2: 스크래치 엔진 (HIGH RISK — 핵심 기술 검증)

- **담당 시나리오**: Scenario 4 (full)
- **크기**: M (4 파일)
- **의존성**: Task 1 (AppStep, ScratchBrushSize 타입)
- **참조**:
  - Canvas API — `globalCompositeOperation: 'destination-out'`
  - vercel-react-best-practices — passive pointer event listeners
  - shadcn — Button (브러시 크기 버튼)
- **구현 대상**:
  - `hooks/useScratchCanvas.ts` — 두 canvas ref 관리, pointerdown/pointermove/pointerup + touchmove 핸들러, destination-out 원형 브러시 그리기
  - `hooks/useScratchCanvas.test.ts` — 브러시 상태 초기값·변경 검증
  - `components/scratch-canvas/ScratchCanvas.tsx` — 2-layer canvas(컬러 bottom + 블랙 오버레이 top), 브러시 크기 4단계 버튼, 저장·새로 시작 버튼(기능은 Task 5·6에서 연결), 하드코딩 그라데이션으로 동작 검증
  - `components/scratch-canvas/ScratchCanvas.test.tsx`
- **수용 기준**:
  - [ ] 스크래치 화면 진입 시 캔버스 전체가 검은 오버레이로 덮인 상태로 표시된다
  - [ ] 마우스 드래그 경로를 따라 오버레이가 제거되어 아래 컬러 레이어가 노출된다
  - [ ] 터치 드래그에서도 동일하게 동작한다
  - [ ] 브러시 크기 버튼 4단계(2px / 4px / 6px / 8px)가 표시되고, 선택 후 드래그 반경에 즉시 반영된다
  - [ ] 스크래치 화면에 색칠 단계(프리셋 선택·직접 칠하기)로 돌아가는 버튼이 없다 (불변 규칙: 단방향 흐름)
  - [ ] 스크래치 화면에 되돌리기(Undo) 버튼이 없다 (불변 규칙: 되돌리기 없음)
- **검증**:
  - `bun run test -- useScratchCanvas` — 브러시 상태 변경
  - `bun run test -- ScratchCanvas` — DOM 요소·버튼 존재 확인
  - Browser MCP — `/scratch-canvas` 진입 후 스크래치 화면에서 드래그 → 오버레이 제거 육안 확인, 증거 `artifacts/scratch-canvas/evidence/task-2-scratch.png` 저장

---

### Checkpoint: Tasks 1–2 이후

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] `/scratch-canvas`에서 크기 선택 → 스크래치 화면 전환 → 마우스로 긁으면 색상 노출 end-to-end 동작

---

### Task 3: 프리셋 색상 레이어 생성 + 선택 화면

- **담당 시나리오**: Scenario 2 (full)
- **크기**: M (4 파일)
- **의존성**: Task 1 (PresetId, ColorLayerDataURL 타입), Task 2 (ScratchCanvas — 스크래치 화면 전환 검증)
- **참조**:
  - Canvas API — `createLinearGradient`, `createRadialGradient`
  - shadcn — Card (프리셋 카드)
- **구현 대상**:
  - `lib/presets.ts` — 6종 프리셋 정의 및 `drawPreset(ctx, presetId, width, height)` 함수 (무지개·야경·황금빛 낙조·새벽·숲·파스텔)
  - `lib/presets.test.ts` — 각 presetId에 대해 드로우 함수가 오류 없이 실행되고 ctx에 올바른 작업이 위임되는지 확인
  - `components/scratch-canvas/PresetPicker.tsx` — 프리셋/직접 칠하기 탭 바(탭 전환 시 `onSwitchMode('paint')` 콜백), 선택된 캔버스 크기 배지(`selectedSize` prop), 6종 카드(미리보기 + 이름), "스크래치 시작" 버튼
  - `components/scratch-canvas/PresetPicker.test.tsx`
- **수용 기준**:
  - [ ] 색상 레이어 준비 화면에 "프리셋 선택" / "직접 칠하기" 탭 두 개가 표시된다
  - [ ] 프리셋 탭에서 6종 프리셋 카드(무지개, 야경, 황금빛 낙조, 새벽, 숲, 파스텔)가 표시된다
  - [ ] 프리셋 카드 클릭 시 선택 상태로 강조된다
  - [ ] 프리셋 선택 후 "스크래치 시작" 클릭 시 스크래치 화면으로 이동하고 해당 프리셋 색상이 컬러 레이어로 표시된다
- **검증**:
  - `bun run test -- presets` — drawPreset 함수 오류 없이 실행
  - `bun run test -- PresetPicker` — 탭·카드·버튼 존재 확인
  - Browser MCP — 프리셋 "무지개" 선택 → 스크래치 시작 → 긁으면 무지개 그라데이션 노출 확인, 증거 `artifacts/scratch-canvas/evidence/task-3-preset.png` 저장

---

### Task 4: 직접 칠하기 화면

- **담당 시나리오**: Scenario 3 (full)
- **크기**: M (4 파일)
- **의존성**: Task 1 (ColorLayerDataURL), Task 2 (ScratchCanvas — 스크래치 화면 전환 검증), Task 3 (PresetPicker 탭 구조 참조)
- **참조**:
  - Canvas API — 포인터 이벤트로 원형 브러시 그리기
  - vercel-react-best-practices — passive pointer event listeners
- **구현 대상**:
  - `hooks/usePaintCanvas.ts` — canvas ref, 선택 색상, 브러시 크기(2-30), pointerdown/pointermove/pointerup 핸들러
  - `hooks/usePaintCanvas.test.ts` — 색상·브러시 상태 초기값·변경 검증
  - `components/scratch-canvas/PaintCanvas.tsx` — 프리셋/직접 칠하기 탭 바(`onSwitchMode('preset')` 콜백), 선택된 캔버스 크기 배지(`selectedSize` prop), 흰 캔버스, 크레파스 16색 스와치, 브러시 슬라이더(range 2-30), "스크래치 시작" 버튼
  - `components/scratch-canvas/PaintCanvas.test.tsx`

크레파스 16색 hex 값:
`흰색 #FFFFFF, 검정 #1A1A1A, 빨강 #E63946, 주황 #F4A261, 노랑 #FFD166, 연두 #A8D5BA, 초록 #2D9E5F, 청록 #06A77D, 파랑 #3A86FF, 남색 #264653, 보라 #7B2D8B, 분홍 #F72585, 갈색 #8B5E3C, 살구색 #FFBA9E, 하늘색 #90E0EF, 회색 #9B9B9B`

- **수용 기준**:
  - [ ] 직접 칠하기 탭 클릭 시 흰 캔버스와 16색 팔레트가 표시된다
  - [ ] 색 스와치 클릭 시 선택 상태(강조 테두리)가 표시된다
  - [ ] 선택된 색으로 캔버스 드래그 시 해당 색의 획이 그려진다
  - [ ] 브러시 크기 슬라이더(2~30px) 조절 시 획 굵기가 즉시 반영된다
  - [ ] 아무것도 칠하지 않아도 "스크래치 시작" 버튼이 활성화 상태로 표시된다
  - [ ] "스크래치 시작" 클릭 시 스크래치 화면으로 이동하고 칠한 내용이 컬러 레이어로 표시된다
  - [ ] 직접 칠하기 화면에 되돌리기(Undo) 버튼이 없다 (불변 규칙: 되돌리기 없음)
- **검증**:
  - `bun run test -- usePaintCanvas` — 색상·브러시 상태 변경
  - `bun run test -- PaintCanvas` — 팔레트·슬라이더·버튼 DOM 확인
  - Browser MCP — 빨강으로 큰 영역 칠한 뒤 스크래치 시작 → 긁으면 빨간 레이어 노출 확인, 증거 `artifacts/scratch-canvas/evidence/task-4-paint.png` 저장

---

### Checkpoint: Tasks 3–4 이후

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 프리셋 선택 → 스크래치 → 긁기 / 직접 칠하기 → 스크래치 → 긁기 두 경로 모두 end-to-end 동작

---

### Task 5: PNG 저장

- **담당 시나리오**: Scenario 6 (full)
- **크기**: S (3 파일)
- **의존성**: Task 2 (ScratchCanvas), Task 3 (color layer dataURL), Task 4 (직접 칠하기 경로 dataURL)
- **참조**:
  - Canvas API — `drawImage`, `toDataURL`, `<a download>` 트릭
- **구현 대상**:
  - `lib/exportCanvas.ts` — `exportAsPng(colorDataURL, overlayCanvas, width, height, filename?)`: 오프스크린 캔버스에 컬러 레이어 + 오버레이 합성 후 PNG 다운로드
  - `lib/exportCanvas.test.ts` — mock canvas로 합성 순서(컬러 먼저, 오버레이 나중) 확인
  - `components/scratch-canvas/ScratchCanvas.tsx` 수정 — "저장" 버튼에 exportAsPng 연결
- **수용 기준**:
  - [ ] "저장" 버튼 클릭 시 PNG 파일이 다운로드된다
  - [ ] 저장된 PNG에 긁힌 영역(컬러 노출)과 미긁힌 검은 영역이 모두 포함된다
  - [ ] PNG 해상도는 선택한 캔버스 크기와 일치한다 (800×800 선택 → 800×800px PNG)
- **검증**:
  - `bun run test -- exportCanvas` — 합성 순서·dataURL 생성 확인
  - Browser MCP — 스크래치 일부 후 "저장" 클릭 → 파일 다운로드 확인, 저장된 PNG를 `artifacts/scratch-canvas/evidence/task-5-export.png`에 저장하여 내용 검증

---

### Task 6: 새로 시작 다이얼로그 + 전체 흐름 연결

- **담당 시나리오**: Scenario 5 (full), 전체 흐름 end-to-end
- **크기**: M (3 파일 수정)
- **의존성**: Tasks 1–5 (전 단계)
- **참조**:
  - shadcn — Dialog (AlertDialog 패턴)
- **구현 대상**:
  - `components/scratch-canvas/ScratchCanvas.tsx` 수정 — "새로 시작" 클릭 시 Dialog 표시, 확인 시 onReset 콜백 호출
  - `components/scratch-canvas/ScratchCanvas.test.tsx` 수정 — Dialog 표시·취소·확인 흐름
  - `app/scratch-canvas/page.tsx` 수정 — SizePicker → PresetPicker/PaintCanvas → ScratchCanvas 전체 state 연결, onReset 시 'size-pick' 단계로 초기화
- **수용 기준**:
  - [ ] 스크래치 화면에서 "새로 시작" 클릭 시 확인 다이얼로그가 표시된다
  - [ ] 다이얼로그에서 "취소" 클릭 시 다이얼로그가 닫히고 스크래치 화면이 유지된다
  - [ ] 다이얼로그에서 "확인" 클릭 시 캔버스 크기 선택 화면으로 이동하고 이전 작업이 초기화된다
- **검증**:
  - `bun run test -- ScratchCanvas` — Dialog 표시·취소·확인 상태 전환
  - `bun run test` — 전체 테스트 통과
  - Browser MCP — 스크래치 도중 새로 시작 → 확인 → 크기 선택 화면 복귀 확인

---

### Checkpoint: Final (Tasks 5–6 이후)

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 전체 흐름 end-to-end: 크기 선택 → 프리셋 선택 → 스크래치 → PNG 저장
- [ ] 전체 흐름 end-to-end: 크기 선택 → 직접 칠하기 → 스크래치 → 새로 시작 → 크기 선택 복귀
- [ ] 모바일 터치 드래그로 스크래치 동작 확인 (Browser MCP 또는 human review)

---

## 미결정 항목

- 프리셋 6종의 구체적인 색상 값(spec에서 테마만 정의됨) — Task 3 구현 시 결정
