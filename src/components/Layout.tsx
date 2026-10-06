import { Outlet } from '@tanstack/react-router'
import { useTheme } from '../hooks/useTheme'
import { AccentPicker } from './AccentPicker'
import { HistoryDrawer } from './HistoryDrawer'
import { ThemeToggle } from './ThemeToggle'

export function Layout() {
  const { mode, setMode, accent, setAccent } = useTheme()

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Identity and appearance only — the workspace header owns content and actions. */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-3">
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-accent">#</span> Markdown
        </span>
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
