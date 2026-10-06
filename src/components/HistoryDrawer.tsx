import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useDeleteDocument, useDocuments } from '../hooks/useDocuments'

// A left-edge tab that opens the saved-document list as an overlay, so the editors never lose width.
export function HistoryDrawer() {
  const [open, setOpen] = useState(false)
  const { data: docs = [] } = useDocuments()
  const remove = useDeleteDocument()
  const navigate = useNavigate()
  const { doc: activeId } = useSearch({ strict: false }) as { doc?: string }
  const tabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      tabRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-10 bg-zinc-950/20 dark:bg-zinc-950/50"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <aside
        id="history-panel"
        ref={panelRef}
        tabIndex={-1}
        aria-label="History"
        inert={!open}
        className={`absolute inset-y-0 left-0 z-20 flex w-72 max-w-[85vw] flex-col rounded-r-xl border border-l-0 border-zinc-200 bg-white p-3 shadow-xl outline-none transition-transform duration-200 ease-out motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">History</h2>
          <Link to="/" onClick={() => setOpen(false)} className="text-sm text-accent hover:underline">
            New document
          </Link>
        </div>
        {docs.length === 0 && (
          <p className="px-1 text-sm text-zinc-500">Nothing saved yet. Press Save to keep a document here.</p>
        )}
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto">
          {docs.map((d) => (
            <li key={d.id} className="group flex items-center">
              <Link
                to="."
                search={{ doc: d.id }}
                onClick={() => setOpen(false)}
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
                  if (d.id === activeId) navigate({ to: '.', search: {} })
                }}
                className="px-1.5 text-zinc-400 opacity-0 hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <button
        ref={tabRef}
        type="button"
        aria-expanded={open}
        aria-controls="history-panel"
        onClick={() => setOpen(!open)}
        className={`absolute left-0 top-4 z-30 flex items-center gap-2 rounded-r-lg border border-l-0 border-zinc-200 bg-white px-1.5 py-3 text-sm font-medium text-zinc-600 transition-[translate] duration-200 ease-out hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 [writing-mode:vertical-rl] ${
          open ? 'translate-x-72 max-sm:translate-x-[min(18rem,85vw)]' : ''
        }`}
      >
        <span className="rotate-180">History</span>
        {docs.length > 0 && (
          <span className="rounded-full bg-accent/15 px-1 py-0.5 text-xs text-accent [writing-mode:horizontal-tb]">
            {docs.length}
          </span>
        )}
      </button>
    </>
  )
}
