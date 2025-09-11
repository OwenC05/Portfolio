'use client'

import * as React from 'react'

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, asChild, ...props }: DivProps & { asChild?: boolean }) {
  const Comp: React.ElementType = 'div'
  return (
    <Comp
      className={cn(
        'rounded-2xl border border-[var(--line)] bg-white shadow-sm transition-shadow hover:shadow-lg focus-within:shadow-lg',
        'relative',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: DivProps) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-tight tracking-[-0.01em]', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}
