import { createContext, useContext, type InputHTMLAttributes } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toggleTaskAt } from '../lib/markdown'
import { column } from './ui'

// Where the enclosing list item starts in the source. The checkbox is generated from
// the `[ ]` marker and carries no position of its own, so it reads the item's.
const ItemOffset = createContext<number | null>(null)

export function MarkdownPreview({
  markdown,
  onChange,
}: {
  markdown: string
  // Omit to leave the checkboxes read only, as the reader does.
  onChange?: (markdown: string) => void
}) {
  if (!markdown.trim()) {
    return (
      <p className={`${column} text-sm text-zinc-400`}>
        Nothing to show yet. Switch to Text and paste some markdown.
      </p>
    )
  }

  const components: Components = {
    li({ node, children, ...props }) {
      return (
        <ItemOffset.Provider value={node?.position?.start.offset ?? null}>
          <li {...props}>{children}</li>
        </ItemOffset.Provider>
      )
    },
    input({ node: _node, ...props }) {
      return <TaskCheckbox {...props} source={markdown} onToggleTask={onChange} />
    },
  }

  return (
    <article className={`${column} prose prose-zinc dark:prose-invert`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}

function TaskCheckbox({
  source,
  onToggleTask,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  source: string
  onToggleTask?: (markdown: string) => void
}) {
  const offset = useContext(ItemOffset)
  if (props.type !== 'checkbox' || !onToggleTask || offset === null) return <input {...props} />
  return (
    <input
      {...props}
      disabled={false}
      onChange={() => onToggleTask(toggleTaskAt(source, offset))}
      className="task-checkbox"
    />
  )
}
