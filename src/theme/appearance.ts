import type { ThemeMode } from '../lib/prefs'

function readableOn(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#18181b' : '#ffffff'
}

export function applyAppearance(mode: ThemeMode, accent: string) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-fg', readableOn(accent))
}
