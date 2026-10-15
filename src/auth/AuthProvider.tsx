import { useQueryClient } from '@tanstack/react-query'
import { AppwriteException, ID } from 'appwrite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { account } from '../lib/appwrite'
import type { AppPrefs } from '../lib/prefs'
import { AuthContext, type AppUser } from './context'

/** A signed-out visitor is the normal case, so a 401 here is not an error. */
async function currentUser(): Promise<AppUser | null> {
  try {
    return await account.get<AppPrefs>()
  } catch (err) {
    if (err instanceof AppwriteException && (err.code === 401 || err.code === 403)) return null
    throw err
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [signInPromptOpen, setSignInPromptOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    let active = true
    currentUser()
      .catch((err: unknown) => {
        console.error('[auth] could not read the current session', err)
        return null
      })
      .then((u) => {
        if (!active) return
        setUser(u)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const refresh = useCallback(async () => {
    setUser(await currentUser())
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await account.createEmailPasswordSession({ email, password })
    setUser(await account.get<AppPrefs>())
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      await account.create({ userId: ID.unique(), email, password, name })
      // Appwrite does not sign you in on signup, and does not require email
      // verification to log in, so go straight to a session.
      await account.createEmailPasswordSession({ email, password })
      setUser(await account.get<AppPrefs>())
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      await account.deleteSession({ sessionId: 'current' })
    } finally {
      setUser(null)
      // Drop every cached document so the next account never sees them.
      queryClient.clear()
    }
  }, [queryClient])

  const promptSignIn = useCallback(() => setSignInPromptOpen(true), [])
  const closeSignInPrompt = useCallback(() => setSignInPromptOpen(false), [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refresh,
      promptSignIn,
      signInPromptOpen,
      closeSignInPrompt,
    }),
    [user, loading, signIn, signUp, signOut, refresh, promptSignIn, signInPromptOpen, closeSignInPrompt],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
