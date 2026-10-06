import { useEffect, useRef, useState } from 'react'
import { MarkdownPreview } from '../components/MarkdownPreview'
import { RichEditor } from '../components/RichEditor'
import { Button, panel } from '../components/ui'
import { useDocument, useSaveDocument } from '../hooks/useDocuments'
import { useOpenReader } from '../hooks/useOpenReader'
import { workspaceRoute } from '../router'

const MODES = [
  { id: 'text', label: 'Text' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'editor', label: 'Editor' },
] as const

type Mode = (typeof MODES)[number]['id']

const BODY_ID = 'workspace-body'

// Segmented control, sized to match Button so the two sit on one optical line.
const segmentTrack = 'flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800'

const segment = (active: boolean) =>
  `rounded-md px-3 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent motion-reduce:transition-none ${
    active
      ? 'bg-accent text-accent-fg'
      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
  }`

export function WorkspacePage() {
  const { doc: docId } = workspaceRoute.useSearch()
  const { data: doc } = useDocument(docId)
  // Mode sits above the key boundary below, so switching documents keeps the current view.
  const [mode, setMode] = useState<Mode>('text')

  if (docId && !doc) return null
  // Re-mount when switching documents so the markdown resets with it.
  return (
    <Workspace key={docId ?? 'new'} id={docId} initial={doc?.markdown ?? ''} mode={mode} onMode={setMode} />
  )
}

function Workspace({
  id,
  initial,
  mode,
  onMode,
}: {
  id?: string
  initial: string
  mode: Mode
  onMode: (m: Mode) => void
}) {
  const navigate = workspaceRoute.useNavigate()
  const [markdown, setMarkdown] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  // Set when the rich editor reports back markdown that differs from what is held here.
  const [rewrites, setRewrites] = useState(false)
  const save = useSaveDocument()
  const reader = useOpenReader()
  const empty = !markdown.trim()

  // Carried over from the old Render button, which the mode switch replaced.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return
      e.preventDefault()
      onMode(mode === 'markdown' ? 'text' : 'markdown')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, onMode])

  // Keep the url pointing at the document we just wrote to localStorage.
  const syncId = (newId: string) => {
    if (newId !== id) navigate({ search: { doc: newId }, replace: true })
  }

  const onSave = async () => {
    const doc = await save.mutateAsync({ id, markdown })
    syncId(doc.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onOpenReader = async () => {
    const doc = await reader.open({ id, markdown })
    syncId(doc.id)
  }

  return (
    <section className={`${panel} flex h-full min-h-0 flex-col overflow-hidden`}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
        <ModeSwitch mode={mode} onChange={onMode} />
        <div className="flex items-center gap-2">
          <Button onClick={onCopy} disabled={empty}>
            {copied ? 'Copied ✓' : 'Copy markdown'}
          </Button>
          <Button
            onClick={onOpenReader}
            disabled={empty || reader.isPending}
            title="Saves the document, then opens it full width in a new tab"
          >
            ⛶ Full screen ↗
          </Button>
          <Button variant="primary" onClick={onSave} disabled={empty || save.isPending}>
            {saved ? 'Saved ✓' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Exactly one surface is mounted at a time: leaving a mode unmounts it. */}
      <div
        id={BODY_ID}
        role="tabpanel"
        aria-labelledby={`mode-${mode}`}
        className="flex min-h-0 flex-1 flex-col"
      >
        {mode === 'text' && (
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            placeholder="Paste markdown here…"
            className="min-h-0 w-full flex-1 resize-none overflow-auto bg-transparent px-4 py-6 font-mono text-sm outline-none"
          />
        )}
        {mode === 'markdown' && (
          <div className="min-h-0 flex-1 overflow-auto py-6">
            <MarkdownPreview markdown={markdown} />
          </div>
        )}
        {mode === 'editor' && (
          <>
            {rewrites && <RewriteNotice />}
            <RichEditor
              initialMarkdown={markdown}
              onMarkdownChange={setMarkdown}
              onParsed={(asUnderstood) => setRewrites(asUnderstood.trim() !== markdown.trim())}
            />
          </>
        )}
      </div>
    </section>
  )
}

// The old two-pane layout showed the editor's markdown output live beside it, so a
// dropped table was visible as it happened. With one surface mounted at a time that
// loss is silent, so say it before the first keystroke.
function RewriteNotice() {
  return (
    <p className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
      Typing here rewrites the document in the editor's own markdown. Anything it can't
      represent — tables, footnotes, raw HTML — is dropped. Stay in Text to keep them.
    </p>
  )
}

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const i = MODES.findIndex((m) => m.id === mode)
    const next = MODES[(i + step + MODES.length) % MODES.length].id
    onChange(next)
    ref.current?.querySelector<HTMLButtonElement>(`#mode-${next}`)?.focus()
  }

  return (
    <div ref={ref} role="tablist" aria-label="View" onKeyDown={onKeyDown} className={segmentTrack}>
      {MODES.map((m) => (
        <button
          key={m.id}
          id={`mode-${m.id}`}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          aria-controls={BODY_ID}
          tabIndex={mode === m.id ? 0 : -1}
          onClick={() => onChange(m.id)}
          className={segment(mode === m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
