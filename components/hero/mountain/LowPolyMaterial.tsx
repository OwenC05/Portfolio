import { memo } from 'react'

type Props = {
  roughness?: number
  metalness?: number
  gloss?: number
} & JSX.IntrinsicElements['meshStandardMaterial']

/**
 * Lightweight helper around MeshStandardMaterial with flat shading + vertex colors.
 * Snow/rock blending is baked into geometry vertex colors.
 */
export default memo(function LowPolyMaterial({ roughness = 0.74, metalness = 0.0, gloss, ...rest }: Props) {
  // If gloss is provided, map to roughness inversely (simple heuristic)
  const r = typeof gloss === 'number' ? Math.max(0.04, 1 - gloss) : roughness
  return (
    <meshStandardMaterial
      flatShading
      vertexColors
      color={undefined as any}
      roughness={r}
      metalness={metalness}
      {...rest}
    />
  )
})

