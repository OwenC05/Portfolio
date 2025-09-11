'use client'

import * as React from 'react'

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  intent?: 'green' | 'blue' | 'red' | 'black' | 'default'
}

export function Badge({ className, intent = 'default', ...props }: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps['intent']>, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    green: 'bg-emerald-100 text-emerald-700 border border-emerald-200', // easy run
    blue: 'bg-sky-100 text-sky-700 border border-sky-200', // intermediate
    red: 'bg-rose-100 text-rose-700 border border-rose-200', // advanced
    black: 'bg-slate-900 text-white border border-slate-800', // expert
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        styles[intent],
        className
      )}
      {...props}
    />
  )
}

