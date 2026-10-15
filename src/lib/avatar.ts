import { storage } from './appwrite'

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_AVATARS

/**
 * A URL for an uploaded avatar, or undefined when there is none.
 *
 * Deliberately `getFileView` rather than `getFilePreview`: previews are
 * server-side image transformations, which Appwrite Cloud blocks below its paid
 * plans ("storage_image_transformations_blocked"). So the original file is
 * served and the browser does the sizing, which is why callers render it with a
 * fixed box and `object-cover`. The bucket's 2 MB cap is what bounds the
 * download; move to getFilePreview if the project is ever on a paid plan.
 *
 * Either endpoint returns a plain URL the browser fetches without the SDK's
 * auth headers, which is why avatar files are uploaded with public read.
 */
export function avatarUrl(fileId: string | undefined): string | undefined {
  if (!fileId) return undefined
  return storage.getFileView({ bucketId: BUCKET_ID, fileId })
}

export const AVATARS_BUCKET_ID = BUCKET_ID
