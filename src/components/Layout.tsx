import { Link, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../auth/context'
import { useTheme } from '../theme/context'
import { AccentPicker } from './AccentPicker'
import { HistoryDrawer } from './HistoryDrawer'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

function MenuIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

export function Layout() {
  const { mode, setMode, accent, setAccent } = useTheme()
  const { promptSignIn } = useAuth()
  // The drawer's trigger now lives in the header, so its open state is owned here.
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Identity and appearance only — the workspace header owns content and actions. */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="History"
            aria-haspopup="dialog"
            aria-expanded={historyOpen}
            aria-controls="history-panel"
            onClick={() => setHistoryOpen(true)}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-200/60 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <MenuIcon />
          </button>
          {/* Clears ?doc= as well as the path, so this always lands on a blank document. */}
          <Link
            to="/"
            search={{}}
            aria-label="Markdown Viewer home"
            className="truncate rounded-lg text-lg font-semibold tracking-tight transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            <span className="text-accent">#</span> Markdown
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <AccentPicker value={accent} onChange={setAccent} />
          <ThemeToggle mode={mode} onChange={setMode} />
          <UserMenu onSignIn={promptSignIn} />
        </div>
      </header>

      {/* No left gutter any more: the drawer is opened from the header, not an edge tab. */}
      <div className="relative min-h-0 flex-1 px-3 pb-3">
        <main className="h-full min-w-0">
          <Outlet />
        </main>
        <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
    </div>
  )
}
