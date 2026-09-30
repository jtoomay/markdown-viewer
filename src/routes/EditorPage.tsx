import type { Editor } from '@tiptap/react'
import { useRef, useState } from 'react'
import { RichEditor } from '../components/RichEditor'
import { Button, panel } from '../components/ui'
import { useDocument, useSaveDocument } from '../hooks/useDocuments'
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
  const save = useSaveDocument()

  const onEditorChange = (md: string) => {
    setMarkdown(md)
    setDraft(md)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onSave = async () => {
    const saved = await save.mutateAsync({ id, markdown })
    if (saved.id !== id) navigate({ search: { doc: saved.id }, replace: true })
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
            <Button onClick={onSave} disabled={!markdown.trim()}>Save</Button>
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
