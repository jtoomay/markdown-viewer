import type { Editor } from '@tiptap/react'
import { useRef, useState } from 'react'
import { RichEditor } from '../components/RichEditor'
import { Button, panel } from '../components/ui'
import { useDocument, useSaveDocument } from '../hooks/useDocuments'
import { useOpenReader } from '../hooks/useOpenReader'
import { editorRoute } from '../router'

export function EditorPage() {
  const { doc: docId } = editorRoute.useSearch()
  const { data: doc } = useDocument(docId)
  if (docId && !doc) return null
  return <EditorInner key={docId ?? 'new'} id={docId} initial={doc?.markdown ?? ''} />
}

function EditorInner({ id, initial }: { id?: string; initial: string }) {
  const navigate = editorRoute.useNavigate()
  const editorRef = useRef<Editor | null>(null)
  const [markdown, setMarkdown] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const save = useSaveDocument()
  const reader = useOpenReader()

  const onEditorChange = (md: string) => {
    setMarkdown(md)
    setDraft(md)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

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

  const onOpenFullscreen = async () => {
    const doc = await reader.open({ id, markdown })
    syncId(doc.id)
  }

  const applyDraft = () => {
    editorRef.current?.commands.setContent(draft, { contentType: 'markdown' })
    setMarkdown(draft)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className={`${panel} flex min-h-[70vh] flex-col`}>
        <RichEditor
          initialMarkdown={initial}
          onMarkdownChange={onEditorChange}
          onReady={(e) => (editorRef.current = e)}
        />
      </section>
      <section className={`${panel} flex min-h-[70vh] flex-col`}>
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Markdown output</span>
          <div className="flex gap-2">
            {draft !== markdown && <Button onClick={applyDraft}>Apply to editor</Button>}
            <Button
              onClick={onOpenFullscreen}
              disabled={!markdown.trim() || reader.isPending}
              title="Saves the document, then opens it full width in a new tab"
            >
              ⛶ Full screen ↗
            </Button>
            <Button onClick={onSave} disabled={!markdown.trim() || save.isPending}>
              {saved ? 'Saved ✓' : 'Save'}
            </Button>
            <Button variant="primary" onClick={copy}>{copied ? 'Copied ✓' : 'Copy markdown'}</Button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          placeholder="Markdown generated from the editor appears here. You can also paste markdown and click Apply."
          className="min-h-[60vh] flex-1 resize-none bg-transparent p-4 font-mono text-sm outline-none"
        />
      </section>
    </div>
  )
}
