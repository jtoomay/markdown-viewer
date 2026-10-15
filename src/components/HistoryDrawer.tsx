import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useAuth } from '../auth/context'
import { useDeleteDocument, useDocuments } from '../hooks/useDocuments'
import { Button } from './ui'

// Saved documents, opened from the header's hamburger as an overlay so the
// editors never lose width.
export function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, promptSignIn } = useAuth()
  const { data: docs = [] } = useDocuments()
  const remove = useDeleteDocument()
  const navigate = useNavigate()
  const { doc: activeId } = useSearch({ strict: false }) as { doc?: string }
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      // Focus returns to the header trigger that opened this.
      document.querySelector<HTMLButtonElement>('button[aria-controls="history-panel"]')?.focus()
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-10 bg-zinc-950/20 dark:bg-zinc-950/50"
          onClick={onClose}
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
          {user && (
            <Link to="/" search={{}} onClick={onClose} className="text-sm text-accent hover:underline">
              New document
            </Link>
          )}
        </div>

        {!user ? (
          <div className="space-y-3 px-1">
            <p className="text-sm text-zinc-500">
              Sign in to save documents and pick them back up on any device.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                onClose()
                promptSignIn()
              }}
            >
              Sign in
            </Button>
          </div>
        ) : (
          <>
            {docs.length === 0 && (
              <p className="px-1 text-sm text-zinc-500">
                Nothing saved yet. Press Save to keep a document here.
              </p>
            )}
            <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto">
              {docs.map((d) => (
                <li key={d.id} className="group flex items-center">
                  <Link
                    to="."
                    search={{ doc: d.id }}
                    onClick={onClose}
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
          </>
        )}
      </aside>
    </>
  )
}
