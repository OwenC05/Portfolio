'use client'

import Link from 'next/link'
import { forwardRef } from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
}

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { asChild, variant = 'solid', className, children, ...rest },
  ref
) {
  const base =
    'inline-flex items-center justify-center rounded-full h-10 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
  const variants = {
    solid: 'bg-[var(--ink)] text-white hover:bg-[color-mix(in_oklab,var(--ink),white_12%)]',
    outline:
      'bg-transparent text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)]/30',
    ghost: 'bg-transparent text-[var(--ink)] hover:bg-[var(--line)]/40',
  } as const

  if (asChild) {
    const { href, ...linkProps } = (rest as unknown as {
      href?: string
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
    const typedHref = (href ?? '#') as unknown as Parameters<typeof Link>[0]['href']
    return (
      <Link href={typedHref} {...linkProps} className={cn(base, variants[variant], className)}>
        {children}
      </Link>
    )
  }

  return (
    <button ref={ref} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  )
})
