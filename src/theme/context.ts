import { createContext, use } from 'react'
import type { EditorMode, ThemeMode } from '../lib/prefs'

export interface ThemeValue {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  accent: string
  setAccent: (c: string) => void
  /** Which surface the workspace opens on. */
  defaultMode: EditorMode
  setDefaultMode: (m: EditorMode) => void
}

export const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme(): ThemeValue {
  const value = use(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
