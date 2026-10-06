import { useSaveDocument } from './useDocuments'

export function readerUrl(id: string) {
  return `${window.location.origin}/read?doc=${encodeURIComponent(id)}`
}

/**
 * Opens the full-screen reader in a new browser tab.
 *
 * The document is saved to localStorage first: that save is how the new tab
 * receives the markdown, since it boots as a fresh app instance.
 */
export function useOpenReader() {
  const save = useSaveDocument()

  const open = async (input: { id?: string; markdown: string }) => {
    // Open synchronously — awaiting the save first would drop the click's
    // user activation and the popup blocker would swallow the tab.
    const tab = window.open('', '_blank')
    try {
      const saved = await save.mutateAsync(input)
      const url = readerUrl(saved.id)
      if (tab && !tab.closed) tab.location.href = url
      else window.open(url, '_blank')
      return saved
    } catch (err) {
      tab?.close()
      throw err
    }
  }

  return { open, isPending: save.isPending }
}
