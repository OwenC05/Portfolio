'use client'

import type { Ref } from 'react'
import styles from './assistant.module.css'

export interface AssistantEntryProps {
  /** Root's single open action; character activation uses the same one. */
  onOpen: () => void
  /** Root returns focus here when the assistant sheet closes. */
  buttonRef?: Ref<HTMLButtonElement>
}

/** Studio-only HTML entry to the controlled Ask sheet. It owns no state. */
export default function AssistantEntry({
  onOpen,
  buttonRef,
}: AssistantEntryProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.entry}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      Ask about Owen’s work
    </button>
  )
}
