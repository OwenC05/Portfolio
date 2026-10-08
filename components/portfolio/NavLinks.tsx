'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav aria-label="Main navigation">
      <Link
        href="/projects"
        aria-current={
          pathname === '/projects'
            ? 'page'
            : pathname.startsWith('/projects/')
              ? 'location'
              : undefined
        }
      >
        Work
      </Link>
      <Link
        href="/about"
        aria-current={pathname === '/about' ? 'page' : undefined}
      >
        About
      </Link>
      <Link
        href="/contact"
        aria-current={pathname === '/contact' ? 'page' : undefined}
      >
        Contact
      </Link>
    </nav>
  )
}
