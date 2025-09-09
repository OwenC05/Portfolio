
import { ReactNode } from 'react'

interface SlopeSectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function SlopeSection({ children, className = '', id }: SlopeSectionProps) {
  return (
    <section id={id} className={`snap-start ${className}`}>
      <div className="slope-section">
        {children}
      </div>
    </section>
  )
}
