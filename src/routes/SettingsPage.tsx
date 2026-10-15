import { useNavigate } from '@tanstack/react-router'
import { AppwriteException, ID } from 'appwrite'
import { useRef, useState } from 'react'
import { useAuth } from '../auth/context'
import { AccentPicker } from '../components/AccentPicker'
import { Avatar } from '../components/UserMenu'
import { Button, column, panel } from '../components/ui'
import { useTheme } from '../theme/context'
import { account, storage } from '../lib/appwrite'
import { AVATARS_BUCKET_ID } from '../lib/avatar'
import { deleteAccountAndData } from '../lib/deleteAccount'
import { squareAvatar } from '../lib/image'
import { prefsStore, type EditorMode, type ThemeMode } from '../lib/prefs'
import { Permission, Role } from 'appwrite'

const MODES: { id: EditorMode; label: string }[] = [
  { id: 'text', label: 'Text' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'editor', label: 'Editor' },
]

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

const input =
  'w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:border-accent dark:border-zinc-800 dark:bg-zinc-950'

const message = (err: unknown) =>
  err instanceof AppwriteException ? err.message : 'Something went wrong. Try again.'

export function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) return null
  if (!user) {
    return (
      <Section>
        <p className="text-sm text-zinc-500">Sign in to manage your profile.</p>
      </Section>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className={`${column} space-y-4 py-6`}>
        <h1 className="text-xl font-semibold tracking-tight">Profile settings</h1>
        <ProfileCard key={`profile-${user.$id}`} />
        <AppearanceCard />
        <EmailCard />
        <PasswordCard />
        <DangerCard
          onDeleted={async () => {
            await signOut()
            void navigate({ to: '/' })
          }}
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className={`${panel} p-4`}>
      {title && <h2 className="mb-3 text-sm font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

function Status({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error)
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    )
  if (notice) return <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>
  return null
}

function ProfileCard() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const saveName = async () => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await account.updateName({ name: name.trim() })
      await refresh()
      setNotice('Display name updated.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    const previous = user.prefs?.avatarFileId
    try {
      // Cropped and scaled here: the stored file is what every page load
      // downloads, since previews are a paid feature.
      const prepared = await squareAvatar(file)
      const created = await storage.createFile({
        bucketId: AVATARS_BUCKET_ID,
        fileId: ID.unique(),
        file: prepared,
        // Public read: the preview URL is fetched by the browser without the
        // SDK's auth headers, so an owner-only file would not render.
        permissions: [
          Permission.read(Role.any()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      })
      await prefsStore.patch({ avatarFileId: created.$id })
      await refresh()
      if (previous) {
        await storage
          .deleteFile({ bucketId: AVATARS_BUCKET_ID, fileId: previous })
          .catch((err: unknown) => console.error('[avatar] could not remove the old file', err))
      }
      setNotice('Avatar updated.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  const removeAvatar = async () => {
    const current = user.prefs?.avatarFileId
    if (!current) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await prefsStore.patch({ avatarFileId: undefined })
      await storage
        .deleteFile({ bucketId: AVATARS_BUCKET_ID, fileId: current })
        .catch((err: unknown) => console.error('[avatar] could not remove the file', err))
      await refresh()
      setNotice('Avatar removed.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Profile">
      <div className="flex items-center gap-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-full text-xl">
          <Avatar user={user} size={64} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => fileRef.current?.click()} disabled={busy}>
            {user.prefs?.avatarFileId ? 'Replace image' : 'Upload image'}
          </Button>
          {user.prefs?.avatarFileId && (
            <Button onClick={removeAvatar} disabled={busy}>
              Remove
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void uploadAvatar(file)
            }}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500">PNG, JPG, GIF or WebP, up to 2 MB.</p>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-medium text-zinc-500">Display name</span>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
          <Button variant="primary" onClick={saveName} disabled={busy || name === user.name}>
            Save
          </Button>
        </div>
      </label>
      <div className="mt-2">
        <Status error={error} notice={notice} />
      </div>
    </Section>
  )
}

function AppearanceCard() {
  const { mode, setMode, accent, setAccent, defaultMode, setDefaultMode } = useTheme()

  return (
    <Section title="Editor preferences">
      <div className="space-y-4">
        <Row label="Theme">
          <div className="flex gap-1.5">
            {THEMES.map((t) => (
              <Button
                key={t.id}
                variant={mode === t.id ? 'primary' : 'ghost'}
                onClick={() => setMode(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </Row>
        <Row label="Accent">
          <AccentPicker value={accent} onChange={setAccent} />
        </Row>
        <Row label="Default view">
          <div className="flex gap-1.5">
            {MODES.map((m) => (
              <Button
                key={m.id}
                variant={defaultMode === m.id ? 'primary' : 'ghost'}
                onClick={() => setDefaultMode(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </Row>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Saved to your account, so they apply on every device you sign in on.
      </p>
    </Section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-zinc-500">{label}</span>
      {children}
    </div>
  )
}

function EmailCard() {
  const { user, refresh } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await account.updateEmail({ email, password })
      await refresh()
      setPassword('')
      setNotice('Email updated.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Email">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">New email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">Current password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={input}
          />
        </label>
        <Status error={error} notice={notice} />
        <Button type="submit" variant="primary" disabled={busy}>
          Update email
        </Button>
      </form>
    </Section>
  )
}

function PasswordCard() {
  const [password, setPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await account.updatePassword({ password, oldPassword })
      setPassword('')
      setOldPassword('')
      setNotice('Password updated.')
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Password">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">Current password</span>
          <input
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={input}
          />
        </label>
        <Status error={error} notice={notice} />
        <Button type="submit" variant="primary" disabled={busy}>
          Update password
        </Button>
      </form>
    </Section>
  )
}

function DangerCard({ onDeleted }: { onDeleted: () => Promise<void> }) {
  const { user } = useAuth()
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteAccountAndData(user?.prefs)
      await onDeleted()
    } catch (err) {
      setError(message(err))
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-zinc-900">
      <h2 className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
      <p className="text-sm text-zinc-500">
        Deletes every document you have saved and closes this account. This cannot be undone, and{' '}
        <strong className="font-medium text-zinc-700 dark:text-zinc-300">
          this email address can never be used to sign up again
        </strong>
        .
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-500">
          Type <code className="font-mono">delete</code> to confirm
        </span>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
      </label>
      <div className="mt-3 space-y-2">
        <Status error={error} />
        <Button
          onClick={run}
          disabled={busy || confirm.trim().toLowerCase() !== 'delete'}
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {busy ? 'Deleting…' : 'Delete account'}
        </Button>
      </div>
    </section>
  )
}
