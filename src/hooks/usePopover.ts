import { useEffect, useRef, useState } from 'react'

// Open/close state for a small popover: closes on Escape or a pointer press outside the ref'd element.
export function usePopover<T extends HTMLElement>() {
  const [open, setOpen] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return { open, setOpen, ref }
}
