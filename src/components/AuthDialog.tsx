import { AppwriteException } from 'appwrite'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/context'
import { account } from '../lib/appwrite'
import { Button, panel } from './ui'

type Tab = 'signin' | 'signup'

/**
 * Sign in without leaving the workspace.
 *
 * Deliberately a dialog rather than a route: navigating would unmount the
 * editor and throw away whatever a signed-out visitor had typed, which is
 * exactly the moment they are most likely to be signing in.
 */
export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // The form only exists while the dialog is open, so each opening starts from
  // fresh state instead of an effect reaching in to clear the last attempt.
  if (!open) return null
  return <AuthForm onClose={onClose} />
}

function AuthForm({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const message = (err: unknown) =>
    err instanceof AppwriteException ? err.message : 'Something went wrong. Try again.'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (tab === 'signin') await signIn(email, password)
      else await signUp(email, password, name.trim() || email.split('@')[0])
      onClose()
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  const onRecover = async () => {
    if (!email.trim()) {
      setError('Enter your email address first, then choose Forgot password.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await account.createRecovery({ email, url: `${window.location.origin}/recover` })
      setNotice('Check your inbox for a password reset link.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 dark:bg-zinc-950/70"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        className={`${panel} w-full max-w-sm p-5 shadow-xl`}
      >
        <h2 id="auth-title" className="text-base font-semibold">
          {tab === 'signin' ? 'Sign in' : 'Create an account'}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {tab === 'signin'
            ? 'Your documents and preferences follow your account.'
            : 'Saved documents are kept to your account and nobody else’s.'}
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {tab === 'signup' && (
            <Field label="Display name (optional)">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={input}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              ref={tab === 'signin' ? firstFieldRef : undefined}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={input}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className={input}
            />
          </Field>

          {tab === 'signup' && <p className="text-xs text-zinc-500">At least 8 characters.</p>}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setTab(tab === 'signin' ? 'signup' : 'signin')
                setError(null)
                setNotice(null)
              }}
              className="text-sm text-accent hover:underline"
            >
              {tab === 'signin' ? 'Create an account' : 'I already have an account'}
            </button>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Working…' : tab === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </div>

          {tab === 'signin' && (
            <button
              type="button"
              onClick={onRecover}
              disabled={busy}
              className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline disabled:opacity-50 dark:hover:text-zinc-100"
            >
              Forgot password?
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

const input =
  'w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:border-accent dark:border-zinc-800 dark:bg-zinc-950'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}
