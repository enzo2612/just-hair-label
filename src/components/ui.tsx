import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border border-line bg-paper', className)}
      {...props}
    />
  )
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'gold' | 'success' | 'warn' }) {
  const tones: Record<string, string> = {
    default: 'bg-paper-soft text-ink-dim',
    gold: 'bg-gold-soft text-gold',
    success: 'bg-success-soft text-success',
    warn: 'bg-warn-soft text-warn',
  }
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide', tones[tone])}>
      {children}
    </span>
  )
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: HTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'
  const variants: Record<string, string> = {
    primary: 'bg-ink text-paper hover:bg-ink/90',
    ghost: 'border border-line bg-paper text-ink hover:bg-paper-soft',
  }
  return <button className={clsx(base, variants[variant], className)} {...props} />
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">{eyebrow}</p>}
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-dim">{description}</p>}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card className="px-5 py-8 text-center text-sm text-ink-dim">{children}</Card>
  )
}

export function Spinner() {
  return <div className="py-12 text-center text-sm text-ink-dim">Chargement…</div>
}
