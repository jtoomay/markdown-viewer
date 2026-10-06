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
