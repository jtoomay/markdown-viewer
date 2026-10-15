import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/context'
import { defaultPrefs, prefsStore, type AppPrefs, type EditorMode, type ThemeMode } from '../lib/prefs'
import { applyAppearance } from './appearance'
import { ThemeContext } from './context'

/**
 * Appearance, read from and written back to the signed-in account.
 *
 * One instance for the whole app: the header toggle and the settings page are
 * two views of the same state, so a change in either is immediately reflected
 * in the other.
 *
 * Signed out there is nowhere to persist to, so it is ordinary state that
 * resets on reload. Signed in, the account's prefs win once they arrive, which
 * is why a hard reload can briefly show the OS colour scheme first.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [mode, setModeState] = useState<ThemeMode>(() => defaultPrefs().theme)
  const [accent, setAccentState] = useState<string>(() => defaultPrefs().accent)
  const [defaultMode, setDefaultModeState] = useState<EditorMode>(() => defaultPrefs().defaultMode)
  // Which account the current values came from, so switching users re-reads.
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    const fallback = defaultPrefs()
    if (!user) {
      // Signing out hands the app back to an anonymous visitor, so drop the
      // previous account's appearance instead of leaving it applied until
      // the next reload.
      if (loadedFor.current !== null) {
        loadedFor.current = null
        setModeState(fallback.theme)
        setAccentState(fallback.accent)
        setDefaultModeState(fallback.defaultMode)
      }
      return
    }
    if (loadedFor.current === user.$id) return
    loadedFor.current = user.$id
    setModeState(user.prefs?.theme ?? fallback.theme)
    setAccentState(user.prefs?.accent ?? fallback.accent)
    setDefaultModeState(user.prefs?.defaultMode ?? fallback.defaultMode)
  }, [user])

  useEffect(() => {
    applyAppearance(mode, accent)
  }, [mode, accent])

  // Persist only when signed in. A failed write should not revert the control
  // the user just moved, so it is logged rather than surfaced.
  const persist = useCallback(
    (changes: AppPrefs) => {
      if (!user) return
      prefsStore.patch(changes).catch((err: unknown) => {
        console.error('[prefs] could not save preferences', err)
      })
    },
    [user],
  )

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m)
      persist({ theme: m })
    },
    [persist],
  )

  const setAccent = useCallback(
    (c: string) => {
      setAccentState(c)
      persist({ accent: c })
    },
    [persist],
  )

  const setDefaultMode = useCallback(
    (m: EditorMode) => {
      setDefaultModeState(m)
      persist({ defaultMode: m })
    },
    [persist],
  )

  const value = useMemo(
    () => ({ mode, setMode, accent, setAccent, defaultMode, setDefaultMode }),
    [mode, setMode, accent, setAccent, defaultMode, setDefaultMode],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
