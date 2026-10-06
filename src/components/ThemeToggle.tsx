import { usePopover } from '../hooks/usePopover'
import type { ThemeMode } from '../lib/storage'

function Icon({ mode }: { mode: ThemeMode }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  return mode === 'dark' ? (
    <svg {...common}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ) : (
    <svg {...common}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
]

export function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const { open, setOpen, ref } = usePopover<HTMLDivElement>()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Theme: ${mode}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-200/60 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Icon mode={mode} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-32 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.mode}
              type="button"
              role="menuitemradio"
              aria-checked={mode === o.mode}
              onClick={() => {
                onChange(o.mode)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition motion-reduce:transition-none hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                mode === o.mode ? 'font-medium text-accent' : ''
              }`}
            >
              <Icon mode={o.mode} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
