# Canvas 포인터 이벤트 좌표 스케일링

## 규칙

Canvas 포인터 이벤트 핸들러에서 좌표를 계산할 때 반드시 CSS 픽셀을 캔버스 내부 해상도로 변환한다.

```ts
const rect = e.currentTarget.getBoundingClientRect()
const scaleX = e.currentTarget.width / rect.width
const scaleY = e.currentTarget.height / rect.height
const x = (e.clientX - rect.left) * scaleX
const y = (e.clientY - rect.top) * scaleY
```

## 왜

`getBoundingClientRect()`는 CSS 픽셀(렌더링 크기)을 반환하고, `canvas.width/height`는 내부 버퍼 해상도다. 캔버스가 CSS로 축소 표시될 때(displayWidth < canvas.width) 스케일 없이 그리면 좌표가 어긋난다. 예: 1200×1200 캔버스를 800px로 표시할 때 scale=0.667 — 오른쪽 끝 클릭이 실제 캔버스의 2/3 지점에 그려진다.

## 적용 범위

Canvas API로 포인터 이벤트 기반 드로잉을 구현하는 모든 컴포넌트/훅.
