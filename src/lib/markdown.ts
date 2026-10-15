/**
 * Flips the `[ ]` / `[x]` of the task item beginning at `offset`.
 *
 * The offset comes from the parsed list item rather than from counting checkboxes in
 * document order, so a `- [ ]` written inside a fenced code block — which renders as
 * code, not as a checkbox — can never shift the mapping onto the wrong line.
 */
export function toggleTaskAt(markdown: string, offset: number): string {
  const lineEnd = markdown.indexOf('\n', offset)
  const line = markdown.slice(offset, lineEnd === -1 ? markdown.length : lineEnd)
  const match = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(?=\])/.exec(line)
  if (!match) return markdown
  const at = offset + match[1].length
  return markdown.slice(0, at) + (match[2] === ' ' ? 'x' : ' ') + markdown.slice(at + 1)
}

/**
 * The display title for a document: its first heading, else its first non-blank
 * line. Derived on every save rather than stored, so there is no rename to keep
 * in sync with the body.
 */
export function titleFromMarkdown(markdown: string): string {
  const heading = markdown.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/m)
  const line = heading?.[1] ?? markdown.split('\n').find((l) => l.trim())
  return line?.trim().slice(0, 80) || 'Untitled'
}
