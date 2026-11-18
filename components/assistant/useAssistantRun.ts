'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  INITIAL_SNAPSHOT,
  type AssistantActions,
  type AssistantSession,
} from '@/lib/assistant/run-state'
import { createAssistantRunOwner } from '@/lib/assistant/run-transport'

/** Mount once per page surface; pass this same snapshot to HTML and scene consumers. */
export function useAssistantRun({
  generationEnabled = false,
} = {}): AssistantSession {
  const ownerRef = useRef<ReturnType<typeof createAssistantRunOwner> | null>(
    null
  )
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT)

  useLayoutEffect(() => {
    const owner = createAssistantRunOwner({
      generationEnabled,
      onChange(next) {
        // React may apply queued updates after a new run, close or effect lifetime.
        setSnapshot((current) =>
          ownerRef.current === owner && owner.getSnapshot() === next
            ? next
            : current
        )
      },
    })
    ownerRef.current = owner
    setSnapshot(INITIAL_SNAPSHOT)
    return () => {
      ownerRef.current = null
      owner.dispose()
    }
  }, [generationEnabled])

  const actions = useMemo<AssistantActions>(
    () =>
      Object.freeze({
        submit: (question: string) =>
          ownerRef.current?.actions.submit(question),
        cancel: () => ownerRef.current?.actions.cancel(),
        close: () => ownerRef.current?.actions.close(),
        select: (runId: string, key: string | null) =>
          ownerRef.current?.actions.select(runId, key),
      }),
    []
  )

  return { snapshot, actions }
}
