// Avatars are prepared in the browser because Appwrite Cloud blocks server-side
// image transformations below its paid plans. Without this, the full upload is
// downloaded on every page load just to be drawn 32px wide.

/** Stored edge length. Large enough for a 64px avatar on a 3x display. */
const AVATAR_SIZE = 512

const TYPES = [
  { mime: 'image/webp', ext: 'webp', quality: 0.85 },
  { mime: 'image/jpeg', ext: 'jpg', quality: 0.9 },
] as const

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
}

/**
 * Centre-crops to a square and scales down to at most AVATAR_SIZE.
 *
 * Returns the original file if the image cannot be decoded or re-encoded —
 * a larger upload is a better outcome than refusing to set an avatar, and the
 * bucket's own size cap still applies.
 */
export async function squareAvatar(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    // from-image honours EXIF orientation, so phone photos are not sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch (err) {
    console.error('[avatar] could not decode the image; uploading it unchanged', err)
    return file
  }

  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const size = Math.min(AVATAR_SIZE, side)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)

    for (const { mime, ext, quality } of TYPES) {
      const blob = await toBlob(canvas, mime, quality)
      // A browser without an encoder for this type silently hands back a PNG,
      // so check what actually came out rather than trusting the request.
      if (blob && blob.type === mime) {
        return new File([blob], `avatar.${ext}`, { type: mime })
      }
    }
    return file
  } finally {
    bitmap.close()
  }
}
