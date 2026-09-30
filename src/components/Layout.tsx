import { Link, Outlet, useNavigate, useSearch } from '@tanstack/react-router'
import { useDeleteDocument, useDocuments } from '../hooks/useDocuments'
import { useTheme } from '../hooks/useTheme'
import type { ThemeMode } from '../lib/storage'
import { AccentPicker } from './AccentPicker'
import { panel } from './ui'

const MODES: ThemeMode[] = ['light', 'system', 'dark']

const navClass =
  'rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'

export function Layout() {
  const { mode, setMode, accent, setAccent } = useTheme()
  const { data: docs = [] } = useDocuments()
  const remove = useDeleteDocument()
  const navigate = useNavigate()
  const { doc: activeId } = useSearch({ strict: false }) as { doc?: string }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="mr-2 text-lg font-semibold tracking-tight">
            <span className="text-accent">#</span> Markdown
          </span>
          <Link to="/" className={navClass} activeProps={{ className: '!text-accent bg-accent/10' }}>
            Viewer
          </Link>
          <Link to="/editor" className={navClass} activeProps={{ className: '!text-accent bg-accent/10' }}>
            Editor
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <AccentPicker value={accent} onChange={setAccent} />
          <div className="flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-800">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-2.5 py-1 capitalize transition ${
                  mode === m ? 'bg-accent text-accent-fg' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className={`${panel} h-fit p-3`}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Saved</h2>
            <Link to="/" className="text-xs text-accent hover:underline">
              + New
            </Link>
          </div>
          {docs.length === 0 && <p className="px-1 text-sm text-zinc-400">No saved documents yet.</p>}
          <ul className="space-y-0.5">
            {docs.map((d) => (
              <li key={d.id} className="group flex items-center">
                <Link
                  to="/"
                  search={{ doc: d.id }}
                  className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    d.id === activeId ? 'bg-accent/10 font-medium text-accent' : ''
                  }`}
                  title={d.title}
                >
                  {d.title}
                </Link>
                <button
                  aria-label={`Delete ${d.title}`}
                  onClick={() => {
                    remove.mutate(d.id)
                    if (d.id === activeId) navigate({ to: '/' })
                  }}
                  className="px-1.5 text-zinc-400 opacity-0 hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
