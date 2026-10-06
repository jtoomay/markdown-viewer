import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { column } from './ui'

export function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <p className={`${column} text-sm text-zinc-400`}>
        Nothing to show yet. Switch to Text and paste some markdown.
      </p>
    )
  }
  return (
    <article className={`${column} prose prose-zinc dark:prose-invert`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
