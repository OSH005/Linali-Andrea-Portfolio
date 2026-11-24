'use client'
import { useSyncExternalStore } from 'react'

const KEY = 'la-motion'
const EVENT = 'la-motion'

function read(): boolean {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'on' || v === 'off') return v === 'on'
  } catch {}
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

function setOn(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? 'on' : 'off')
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

/** Motion preference: server and first hydration render say off; the client then reads storage or the OS setting. */
export function useMotion() {
  const on = useSyncExternalStore(subscribe, read, () => false)
  return { on, setOn }
}
