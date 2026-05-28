'use client'

import { useCallback, useEffect, useRef } from 'react'
import { getAudioContext, decodeAudioData } from '@/lib/sound-engine'
import { scratch001Sound } from '@/lib/scratch-001'
import { scratch002Sound } from '@/lib/scratch-002'
import { scratch003Sound } from '@/lib/scratch-003'
import { scratch004Sound } from '@/lib/scratch-004'
import { scratch005Sound } from '@/lib/scratch-005'

const SOUNDS = [scratch001Sound, scratch002Sound, scratch003Sound, scratch004Sound, scratch005Sound]
const TICK_INTERVAL_MS = 60
const MIN_PITCH = 0.85
const MAX_PITCH = 1.15
const VOLUME = 0.5
const FADE_MS = 0.005 // 5ms gain envelope

export function useScratchSound(enabled: boolean) {
  const buffersRef = useRef<AudioBuffer[]>([])
  const lastTickRef = useRef(0)
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const activeGainRef = useRef<GainNode | null>(null)
  const decodedRef = useRef(false)

  useEffect(() => {
    if (!enabled || decodedRef.current) return
    decodedRef.current = true
    Promise.all(SOUNDS.map((s) => decodeAudioData(s.dataUri))).then((buffers) => {
      buffersRef.current = buffers
    })
  }, [enabled])

  const fireSound = useCallback(() => {
    const buffers = buffersRef.current
    if (!buffers.length) return

    const ctx = getAudioContext()
    const buffer = buffers[Math.floor(Math.random() * buffers.length)]
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()

    source.buffer = buffer
    source.playbackRate.value = MIN_PITCH + Math.random() * (MAX_PITCH - MIN_PITCH)

    // Fade in
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + FADE_MS)

    source.connect(gain)
    gain.connect(ctx.destination)

    source.onended = () => {
      if (activeSourceRef.current === source) {
        activeSourceRef.current = null
        activeGainRef.current = null
      }
    }

    source.start(0)
    activeSourceRef.current = source
    activeGainRef.current = gain
  }, [])

  const start = useCallback(() => {
    if (!enabled) return
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    lastTickRef.current = 0
    fireSound()
  }, [enabled, fireSound])

  const tick = useCallback(() => {
    if (!enabled) return
    const now = performance.now()
    if (now - lastTickRef.current < TICK_INTERVAL_MS) return
    lastTickRef.current = now
    fireSound()
  }, [enabled, fireSound])

  const stop = useCallback(() => {
    const source = activeSourceRef.current
    const gain = activeGainRef.current
    if (!source || !gain) return

    const ctx = getAudioContext()
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_MS)

    try {
      source.stop(ctx.currentTime + FADE_MS)
    } catch {
      // Already stopped
    }
    activeSourceRef.current = null
    activeGainRef.current = null
  }, [])

  return { start, tick, stop }
}
