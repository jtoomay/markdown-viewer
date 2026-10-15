// Appearance and editor preferences, stored on the Appwrite account rather
// than in this browser, so they follow the user between devices.

import { account } from './appwrite'

export type ThemeMode = 'light' | 'dark'
export type EditorMode = 'text' | 'markdown' | 'editor'

export interface AppPrefs {
  theme?: ThemeMode
  accent?: string
  defaultMode?: EditorMode
  avatarFileId?: string
}

export const DEFAULT_ACCENT = '#6366f1'

export function systemTheme(): ThemeMode {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Appearance for a visitor with no account, or before their prefs arrive. */
export function defaultPrefs(): Required<Pick<AppPrefs, 'theme' | 'accent' | 'defaultMode'>> {
  return { theme: systemTheme(), accent: DEFAULT_ACCENT, defaultMode: 'text' }
}

export const prefsStore = {
  async get(): Promise<AppPrefs> {
    return await account.getPrefs<AppPrefs>()
  },

  /**
   * Appwrite replaces the whole prefs object on write, so read-merge-write is
   * required: a bare update would silently drop every key not passed here.
   */
  async patch(changes: AppPrefs): Promise<AppPrefs> {
    const current = await account.getPrefs<AppPrefs>()
    const next = { ...current, ...changes }
    await account.updatePrefs<AppPrefs>({ prefs: next })
    return next
  },
}
