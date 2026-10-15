import { Link } from '@tanstack/react-router'
import { useAuth, type AppUser } from '../auth/context'
import { avatarUrl } from '../lib/avatar'
import { usePopover } from '../hooks/usePopover'
import { Button } from './ui'

function initials(user: AppUser): string {
  const source = user.name?.trim() || user.email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '?').toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? '')
}

/** The avatar itself: the uploaded image when there is one, initials otherwise. */
export function Avatar({ user, size = 32 }: { user: AppUser; size?: number }) {
  const url = avatarUrl(user.prefs?.avatarFileId)
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="size-full rounded-full object-cover"
      />
    )
  }
  return (
    <span
      aria-hidden
      className="grid size-full place-items-center rounded-full bg-accent text-accent-fg"
      style={{ fontSize: size * 0.4 }}
    >
      {initials(user)}
    </span>
  )
}

export function UserMenu({ onSignIn }: { onSignIn: () => void }) {
  const { user, loading, signOut } = useAuth()
  const { open, setOpen, ref } = usePopover<HTMLDivElement>()

  // Render nothing rather than a Sign in button that would flip to an avatar a
  // moment later, which reads as a glitch on every page load.
  if (loading) return <div className="size-8" aria-hidden />

  if (!user) {
    return (
      <Button onClick={onSignIn} variant="primary">
        Sign in
      </Button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Account: ${user.name || user.email}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-8 place-items-center overflow-hidden rounded-full text-sm font-semibold ring-2 ring-transparent transition hover:ring-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none dark:hover:ring-zinc-700"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-200 px-2.5 py-2 dark:border-zinc-800">
            {user.name && <p className="truncate text-sm font-medium">{user.name}</p>}
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={item}
          >
            Profile settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
            className={`${item} w-full text-left`}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

const item =
  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-zinc-100 motion-reduce:transition-none dark:hover:bg-zinc-800'
