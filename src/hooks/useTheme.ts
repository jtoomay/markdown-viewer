import { useCallback, useEffect, useState } from 'react'
import { settingsStore, type ThemeMode } from '../lib/storage'

function readableOn(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#18181b' : '#ffffff'
}

export function applyAppearance(mode: ThemeMode, accent: string) {
  const dark =
    mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-fg', readableOn(accent))
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(settingsStore.getTheme)
  const [accent, setAccentState] = useState(settingsStore.getAccent)

  useEffect(() => {
    applyAppearance(mode, accent)
    if (mode !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyAppearance(mode, accent)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode, accent])

  const setMode = useCallback((m: ThemeMode) => {
    settingsStore.setTheme(m)
    setModeState(m)
  }, [])
  const setAccent = useCallback((c: string) => {
    settingsStore.setAccent(c)
    setAccentState(c)
  }, [])

  return { mode, setMode, accent, setAccent }
}
