import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button, panel } from '../components/ui'
import { MarkdownPreview } from '../components/MarkdownPreview'
import { useDocument, useSaveDocument } from '../hooks/useDocuments'
import { useOpenReader } from '../hooks/useOpenReader'
import { viewerRoute } from '../router'

export function ViewerPage() {
  const { doc: docId } = viewerRoute.useSearch()
  const { data: doc } = useDocument(docId)
  // Re-mount the inner component when switching documents so local state resets.
  if (docId && !doc) return null
  return <ViewerInner key={docId ?? 'new'} id={docId} initial={doc?.markdown ?? ''} />
}

function ViewerInner({ id, initial }: { id?: string; initial: string }) {
  const navigate = viewerRoute.useNavigate()
  const [source, setSource] = useState(initial)
  const [rendered, setRendered] = useState(initial)
  const [saved, setSaved] = useState(false)
  const save = useSaveDocument()
  const reader = useOpenReader()

  const render = () => setRendered(source)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        setRendered(source)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [source])

  // Keep the url pointing at the document we just wrote to localStorage.
  const syncId = (newId: string) => {
    if (newId !== id) navigate({ search: { doc: newId }, replace: true })
  }

  const onSave = async () => {
    setRendered(source)
    const doc = await save.mutateAsync({ id, markdown: source })
    syncId(doc.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const onOpenFullscreen = async () => {
    setRendered(source)
    const doc = await reader.open({ id, markdown: source })
    syncId(doc.id)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={`${panel} flex min-h-[70vh] flex-col`}>
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Markdown</span>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={!source.trim() || save.isPending}>
              {saved ? 'Saved ✓' : 'Save'}
            </Button>
            <Button variant="primary" onClick={render} title="Ctrl/⌘ + Enter">
              Render <kbd className="text-[10px] opacity-70">⌃↵</kbd>
            </Button>
          </div>
        </div>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          placeholder="Paste markdown here…"
          className="min-h-[60vh] flex-1 resize-none bg-transparent p-4 font-mono text-sm outline-none"
        />
      </section>
      <section className={`${panel} flex min-h-[70vh] flex-col`}>
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Document</span>
          <div className="flex items-center gap-2">
            <Link
              to="/editor"
              search={id ? { doc: id } : {}}
              className="px-2 text-xs text-accent hover:underline"
            >
              Open in editor →
            </Link>
            <Button
              onClick={onOpenFullscreen}
              disabled={!source.trim() || reader.isPending}
              title="Saves the document, then opens it full width in a new tab"
            >
              ⛶ Full screen ↗
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <MarkdownPreview markdown={rendered} />
        </div>
      </section>
    </div>
  )
}
