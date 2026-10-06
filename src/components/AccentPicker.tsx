import { usePopover } from '../hooks/usePopover'

const PRESETS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

const swatch =
  'size-5 shrink-0 rounded-full transition duration-200 ease-out motion-reduce:transition-none hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500'

export function AccentPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const { open, setOpen, ref } = usePopover<HTMLDivElement>()
  const choices = PRESETS.filter((c) => c !== value.toLowerCase())

  const pick = (c: string) => {
    onChange(c)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex items-center">
      {/* Expanded swatches fan out to the left of the dot, so the header never reflows. */}
      <div
        inert={!open}
        className="absolute right-full top-1/2 mr-2 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-sm transition duration-200 ease-out motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-900"
        style={{
          opacity: open ? 1 : 0,
          transform: `translateY(-50%) translateX(${open ? 0 : 8}px)`,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {choices.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-label={`Use accent ${c}`}
            onClick={() => pick(c)}
            style={{ backgroundColor: c, transitionDelay: open ? `${i * 20}ms` : '0ms', opacity: open ? 1 : 0 }}
            className={swatch}
          />
        ))}
        <label
          title="Custom color"
          className={`${swatch} relative cursor-pointer overflow-hidden bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-zinc-500`}
        >
          <input
            type="color"
            aria-label="Custom accent color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setOpen(false)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      </div>
      <button
        type="button"
        aria-label="Accent color"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{ backgroundColor: value }}
        className="size-6 rounded-full ring-2 ring-zinc-300 ring-offset-2 ring-offset-zinc-50 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 motion-reduce:transition-none dark:ring-zinc-700 dark:ring-offset-zinc-950"
      />
    </div>
  )
}
