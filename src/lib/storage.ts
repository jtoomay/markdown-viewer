// All persistence goes through this file so a database can replace localStorage later.

export interface MarkdownDoc {
  id: string
  title: string
  markdown: string
  createdAt: number
  updatedAt: number
}

const KEYS = {
  docs: 'mdv:documents',
  theme: 'mdv:theme',
  accent: 'mdv:accent',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function titleFromMarkdown(markdown: string): string {
  const heading = markdown.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/m)
  const line = heading?.[1] ?? markdown.split('\n').find((l) => l.trim())
  return line?.trim().slice(0, 80) || 'Untitled'
}

export const documentStore = {
  async list(): Promise<MarkdownDoc[]> {
    return read<MarkdownDoc[]>(KEYS.docs, []).sort((a, b) => b.updatedAt - a.updatedAt)
  },
  async get(id: string): Promise<MarkdownDoc | null> {
    return read<MarkdownDoc[]>(KEYS.docs, []).find((d) => d.id === id) ?? null
  },
  async save(input: { id?: string; markdown: string }): Promise<MarkdownDoc> {
    const docs = read<MarkdownDoc[]>(KEYS.docs, [])
    const now = Date.now()
    const existing = input.id ? docs.find((d) => d.id === input.id) : undefined
    const doc: MarkdownDoc = {
      id: existing?.id ?? crypto.randomUUID(),
      title: titleFromMarkdown(input.markdown),
      markdown: input.markdown,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    write(KEYS.docs, [doc, ...docs.filter((d) => d.id !== doc.id)])
    return doc
  },
  async remove(id: string): Promise<void> {
    write(
      KEYS.docs,
      read<MarkdownDoc[]>(KEYS.docs, []).filter((d) => d.id !== id),
    )
  },
}

export type ThemeMode = 'light' | 'dark' | 'system'

export const settingsStore = {
  getTheme: () => read<ThemeMode>(KEYS.theme, 'system'),
  setTheme: (t: ThemeMode) => write(KEYS.theme, t),
  getAccent: () => read<string>(KEYS.accent, '#6366f1'),
  setAccent: (c: string) => write(KEYS.accent, c),
}
