import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

export function Button({
  variant = 'ghost',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles =
    variant === 'primary'
      ? 'bg-accent text-accent-fg hover:opacity-90'
      : 'border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

export const panel =
  'rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'

// The reading column for rendered prose. Merging the panes into one container
// doubled the available width, so the measure is set here rather than falling out of
// the old split. 44rem is a 42rem column plus its two 1rem gutters, so text lands in
// the same place whether the element pads itself or not. Raw markdown is source
// rather than prose, so the Text surface spans the full container instead.
export const column = 'mx-auto w-full max-w-[44rem] px-4'
