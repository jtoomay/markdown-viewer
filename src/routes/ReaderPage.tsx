import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MarkdownPreview } from '../components/MarkdownPreview'
import { Button } from '../components/ui'
import { useDocument } from '../hooks/useDocuments'
import { readerRoute } from '../router'

export function ReaderPage() {
  const { doc: docId } = readerRoute.useSearch()
  const { data: doc } = useDocument(docId)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!doc) return
    document.title = `${doc.title} — Markdown Viewer`
    return () => {
      document.title = 'Markdown Viewer'
    }
  }, [doc])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => {})
  }

  if (!docId) return <Empty>No document selected.</Empty>
  // useDocument resolves to null when the id isn't in localStorage, undefined while loading.
  if (doc === undefined) return null
  if (doc === null) return <Empty>That document isn’t saved in this browser.</Empty>

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <h1 className="truncate text-sm font-medium" title={doc.title}>
          <span className="text-accent">#</span> {doc.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            search={{ doc: doc.id }}
            className="rounded-lg px-2 py-1 text-xs text-accent hover:underline"
          >
            ← Back to editing
          </Link>
          <Button onClick={toggleFullscreen} title="Toggle browser full screen">
            {fullscreen ? 'Exit full screen' : '⛶ Full screen'}
          </Button>
        </div>
      </header>
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <MarkdownPreview markdown={doc.markdown} />
      </main>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-zinc-500">{children}</p>
      <Link to="/" className="text-sm text-accent hover:underline">
        Go to the viewer →
      </Link>
    </div>
  )
}
