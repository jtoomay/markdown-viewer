// All document persistence. Replaces the old localStorage store: same four
// async methods and the same MarkdownDoc shape, so callers did not change.

import { AppwriteException, ID, type Models, Permission, Query, Role } from 'appwrite'
import { tablesDB } from './appwrite'
import { titleFromMarkdown } from './markdown'

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_DOCUMENTS

export interface MarkdownDoc {
  id: string
  title: string
  markdown: string
  createdAt: number
  updatedAt: number
}

// Appwrite's built-in $id/$createdAt/$updatedAt stand in for three columns we
// would otherwise store and maintain ourselves.
interface DocRow extends Models.Row {
  title: string
  markdown: string
}

const toDoc = (row: DocRow): MarkdownDoc => ({
  id: row.$id,
  title: row.title,
  markdown: row.markdown,
  createdAt: Date.parse(row.$createdAt),
  updatedAt: Date.parse(row.$updatedAt),
})

/**
 * Read, update and delete for the owner only. Row security is on, so these are
 * also what makes `list` return one user's documents and nobody else's — the
 * filtering is enforced by Appwrite, not by a query we could forget to write.
 */
const ownerOnly = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

export const documentStore = {
  async list(): Promise<MarkdownDoc[]> {
    const { rows } = await tablesDB.listRows<DocRow>({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.orderDesc('$updatedAt'), Query.limit(100)],
    })
    return rows.map(toDoc)
  },

  async get(id: string): Promise<MarkdownDoc | null> {
    try {
      const row = await tablesDB.getRow<DocRow>({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id,
      })
      return toDoc(row)
    } catch (err) {
      // A document that is missing, or that belongs to someone else, is "not
      // found" to this caller. ReaderPage distinguishes null from undefined.
      if (err instanceof AppwriteException && (err.code === 404 || err.code === 401)) return null
      throw err
    }
  },

  async save(input: { id?: string; markdown: string; userId: string }): Promise<MarkdownDoc> {
    const row = await tablesDB.upsertRow<DocRow>({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: input.id ?? ID.unique(),
      data: { title: titleFromMarkdown(input.markdown), markdown: input.markdown },
      permissions: ownerOnly(input.userId),
    })
    return toDoc(row)
  },

  async remove(id: string): Promise<void> {
    await tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: TABLE_ID, rowId: id })
  },
}
