'use client'

import { useSyncExternalStore } from 'react'

// One shared clock for relative times ("2 min ago"). Reading Date.now() during render is impure;
// this keeps a single value that ticks every 30 s, so every timestamp on screen stays in step.
const TICK_MS = 30_000
let now = Date.now()
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((notify) => notify())
    }, TICK_MS)
  }
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => now,
  )
}
