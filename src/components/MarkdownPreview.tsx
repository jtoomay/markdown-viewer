import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <p className="text-sm text-zinc-400">
        Nothing rendered yet. Paste markdown on the left and press Render (Ctrl/⌘ + Enter).
      </p>
    )
  }
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
