const PRESETS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

export function AccentPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Accent color">
      {PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Accent ${c}`}
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          className={`size-5 rounded-full ring-offset-2 ring-offset-zinc-50 transition dark:ring-offset-zinc-950 ${
            value.toLowerCase() === c ? 'ring-2 ring-zinc-500' : 'hover:scale-110'
          }`}
        />
      ))}
      <input
        type="color"
        aria-label="Custom accent color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
      />
    </div>
  )
}
