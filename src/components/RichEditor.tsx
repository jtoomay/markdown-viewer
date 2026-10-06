import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { ReactNode } from 'react'

function Tool({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded-md px-2 py-1 text-sm transition ${
        active ? 'bg-accent text-accent-fg' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  // Re-render on selection/content changes so active states stay in sync.
  useEditorState({ editor, selector: (s) => s.transactionNumber })
  const c = () => editor.chain().focus()
  const a = (name: string, attrs?: object) => editor.isActive(name, attrs)
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 p-2 dark:border-zinc-800">
      {([1, 2, 3] as const).map((level) => (
        <Tool key={level} title={`Heading ${level}`} active={a('heading', { level })} onClick={() => c().toggleHeading({ level }).run()}>
          H{level}
        </Tool>
      ))}
      <Tool title="Paragraph" active={a('paragraph')} onClick={() => c().setParagraph().run()}>¶</Tool>
      <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
      <Tool title="Bold" active={a('bold')} onClick={() => c().toggleBold().run()}><b>B</b></Tool>
      <Tool title="Italic" active={a('italic')} onClick={() => c().toggleItalic().run()}><i>I</i></Tool>
      <Tool title="Strikethrough" active={a('strike')} onClick={() => c().toggleStrike().run()}><s>S</s></Tool>
      <Tool title="Inline code" active={a('code')} onClick={() => c().toggleCode().run()}>{'</>'}</Tool>
      <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
      <Tool title="Bullet list" active={a('bulletList')} onClick={() => c().toggleBulletList().run()}>• List</Tool>
      <Tool title="Numbered list" active={a('orderedList')} onClick={() => c().toggleOrderedList().run()}>1. List</Tool>
      <Tool title="Quote" active={a('blockquote')} onClick={() => c().toggleBlockquote().run()}>❝</Tool>
      <Tool title="Code block" active={a('codeBlock')} onClick={() => c().toggleCodeBlock().run()}>{'{ }'}</Tool>
      <Tool title="Divider" onClick={() => c().setHorizontalRule().run()}>—</Tool>
      <Tool
        title="Link"
        active={a('link')}
        onClick={() => {
          const prev = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('Link URL (empty to remove)', prev ?? 'https://')
          if (url === null) return
          if (url === '') c().unsetLink().run()
          else c().extendMarkRange('link').setLink({ href: url }).run()
        }}
      >
        Link
      </Tool>
    </div>
  )
}

export function RichEditor({
  initialMarkdown,
  onMarkdownChange,
  onReady,
}: {
  initialMarkdown: string
  onMarkdownChange: (md: string) => void
  onReady: (editor: Editor) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: initialMarkdown,
    contentType: 'markdown',
    editorProps: {
      attributes: { class: 'tiptap prose prose-zinc max-w-none p-6 dark:prose-invert' },
    },
    onCreate: ({ editor }) => onReady(editor),
    onUpdate: ({ editor }) => onMarkdownChange(editor.getMarkdown()),
  })

  if (!editor) return null
  return (
    <>
      <Toolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </>
  )
}
