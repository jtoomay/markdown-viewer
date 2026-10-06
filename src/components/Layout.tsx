import { Link, Outlet } from '@tanstack/react-router'
import { useTheme } from '../hooks/useTheme'
import { AccentPicker } from './AccentPicker'
import { HistoryDrawer } from './HistoryDrawer'
import { ThemeToggle } from './ThemeToggle'

const navClass =
  'rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200/60 focus-visible:outline-2 focus-visible:outline-accent dark:text-zinc-400 dark:hover:bg-zinc-800'

export function Layout() {
  const { mode, setMode, accent, setAccent } = useTheme()

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-3">
        <nav className="flex items-center gap-1">
          <span className="mr-2 hidden text-lg font-semibold tracking-tight sm:block">
            <span className="text-accent">#</span> Markdown
          </span>
          <Link to="/" className={navClass} activeProps={{ className: '!text-accent bg-accent/10' }}>
            View Markdown
          </Link>
          <Link to="/editor" className={navClass} activeProps={{ className: '!text-accent bg-accent/10' }}>
            Create Markdown
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <AccentPicker value={accent} onChange={setAccent} />
          <ThemeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <div className="relative min-h-0 flex-1 pb-3 pl-9 pr-3">
        <main className="h-full min-w-0">
          <Outlet />
        </main>
        <HistoryDrawer />
      </div>
    </div>
  )
}
