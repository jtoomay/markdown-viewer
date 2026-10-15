import { createContext, use } from 'react'
import type { Models } from 'appwrite'
import type { AppPrefs } from '../lib/prefs'

export type AppUser = Models.User<AppPrefs>

export interface AuthValue {
  user: AppUser | null
  /** True until the first `account.get()` settles, so nothing flashes signed-out. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  /** Re-reads the account after a profile or preference change. */
  refresh: () => Promise<void>
  /** Opens the sign-in dialog. Anything that needs an account calls this. */
  promptSignIn: () => void
  signInPromptOpen: boolean
  closeSignInPrompt: () => void
}

// Kept apart from the provider component so the module exports only hooks and
// types, which keeps fast refresh working on the provider file.
export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
