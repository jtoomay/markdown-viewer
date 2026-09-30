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
