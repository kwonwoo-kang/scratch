# Canvas 터치 지원 — touch-action: none

## 규칙

터치 입력을 처리하는 캔버스에 `style={{ touchAction: 'none' }}`을 적용한다.

```tsx
<canvas
  style={{ touchAction: 'none' }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
/>
```

별도 `touchmove` 이벤트 핸들러를 추가하지 않는다.

## 왜

`touch-action: none`이 없으면 브라우저가 touch 이벤트를 scroll 제스처로 처리해 pointer 이벤트가 발화하지 않는다. 반대로 manual `touchmove` 핸들러를 `onPointerMove`와 함께 등록하면 같은 터치에 두 번 실행된다. `touch-action: none` 하나로 pointer 이벤트가 mouse와 touch 모두 커버한다.

## 적용 범위

포인터 이벤트로 드로잉/드래그를 구현하는 모든 캔버스 엘리먼트.
