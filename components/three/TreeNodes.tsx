"use client"

import { Html } from '@react-three/drei'
import { useProjectsStore } from '@/lib/projectsStore'
import { projectTree, ProjectNode } from '@/app/projects/data'
import { findNode, getChildren } from '@/lib/tree'

const allNodes = (() => {
  const out: ProjectNode[] = []
  const q: ProjectNode[] = [projectTree]
  while (q.length) {
    const n = q.shift()!
    out.push(n)
    n.left && q.push(n.left)
    n.right && q.push(n.right)
  }
  return out
})()

export default function TreeNodes() {
  const { layout, currentId, mode } = useProjectsStore((s) => ({
    layout: s.layout,
    currentId: s.currentId,
    mode: s.mode,
  }))
  const setTarget = useProjectsStore((s) => s.setTarget)

  const positions = layout?.nodeWorldPos || {}

  const canInteract = mode === 'idle'

  return (
    <group>
      {allNodes.map((n) => {
        const p = positions[n.id]
        if (!p) return null
        const isCurrent = n.id === currentId
        return (
          <group key={n.id} position={p}>
            {/* Signpost */}
            <mesh castShadow onClick={() => {
              if (!canInteract || !currentId) return
              const curNode = findNode(projectTree, currentId)
              if (!curNode) return
              const [left, right] = getChildren(curNode)
              if (left?.id === n.id || right?.id === n.id) setTarget(n.id, 'ride')
            }}>
              <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
              <meshStandardMaterial color={isCurrent ? '#0ea5e9' : '#64748b'} />
            </mesh>
            {/* flag */}
            <mesh castShadow position={[0.0, 0.5, 0.0]}>
              <boxGeometry args={[0.6, 0.25, 0.02]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
            <Html position={[0.0, 0.9, 0]} center transform distanceFactor={10}>
              <div className="pointer-events-auto select-none rounded-2xl bg-white/80 backdrop-blur px-3 py-1 text-xs shadow border border-white/40 text-gray-800">
                {n.title}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
