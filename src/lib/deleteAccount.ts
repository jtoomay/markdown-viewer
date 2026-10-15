import { account, storage, tablesDB } from './appwrite'
import { AVATARS_BUCKET_ID } from './avatar'
import { documentStore } from './documents'
import type { AppPrefs } from './prefs'

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_DOCUMENTS

/**
 * Erases the account's content, then closes the account itself.
 *
 * Appwrite has no client API for deleting your own user: `account.updateStatus()`
 * blocks it permanently instead, and a blocked account's email can never be
 * reused. Everything the user actually stored is deleted first, so what remains
 * is an empty, unreachable user record. Removing that record too needs a server
 * API key, which belongs in an Appwrite Function rather than in this bundle.
 */
export async function deleteAccountAndData(prefs: AppPrefs | undefined): Promise<void> {
  const docs = await documentStore.list()
  await Promise.all(
    docs.map((d) =>
      tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: TABLE_ID, rowId: d.id }),
    ),
  )

  if (prefs?.avatarFileId) {
    // A missing or already-deleted avatar must not block closing the account.
    await storage
      .deleteFile({ bucketId: AVATARS_BUCKET_ID, fileId: prefs.avatarFileId })
      .catch((err: unknown) => console.error('[account] could not delete avatar', err))
  }

  await account.updateStatus()
}
