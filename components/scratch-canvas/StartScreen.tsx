'use client'

import { Button } from '@/components/ui/button'

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-2xl mx-auto min-h-screen justify-center">
      <h1 className="text-3xl font-bold text-foreground">스크래치 캔버스</h1>

      <img
        src="/scratch-sample.png"
        alt="스크래치 예시"
        className="max-w-sm w-full rounded-xl shadow-md"
      />

      <ol className="flex flex-col gap-2 text-sm text-muted-foreground text-left list-none">
        <li>1. 캔버스 크기를 고르세요</li>
        <li>2. 배경 색을 칠하세요</li>
        <li>3. 손가락으로 긁어 그림을 드러내세요</li>
      </ol>

      <Button size="lg" onClick={onStart}>
        시작하기
      </Button>
    </div>
  )
}
