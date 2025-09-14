import { memo, useMemo } from 'react'
import RidgedTerrainMaterial from './RidgedTerrainMaterial'
import { MountainTheme } from './theme'

export type LayerProps = {
  width?: number
  depth?: number
  segX?: number
  segZ?: number
  amp: number
  terraceSteps: number
  seed: number
  xScale?: number
  yOffset?: number
  zOffset: number
  fogStrength?: number
}

type Props = {
  theme: MountainTheme
  time: number
  wind: number
  layers: [LayerProps, LayerProps, LayerProps]
  debug?: boolean
}

const defaults = { width: 1000, depth: 190, segX: 320, segZ: 64 }

export default memo(function RidgedTerrain({ theme, time, wind, layers, debug = false }: Props) {
  return (
    <group>
      {layers.map((L, i) => (
        <group key={i} position={[0, (L.yOffset ?? -6) + i * 0.0, L.zOffset]} scale={[L.xScale ?? 1.15, 1, 1]}>
          <mesh rotation-x={-Math.PI / 2}>
            <planeGeometry args={[L.width ?? defaults.width, L.depth ?? defaults.depth, L.segX ?? defaults.segX, L.segZ ?? defaults.segZ]} />
            {debug ? (
              <meshBasicMaterial color="#3b82f6" wireframe={true} />
            ) : (
              <RidgedTerrainMaterial
                uAmp={L.amp}
                uTerraceSteps={L.terraceSteps}
                uSeed={L.seed}
                uTime={time}
                uWind={wind}
                uSnow={theme.snow}
                uRockMid={theme.rockMid}
                uRockShadow={theme.rockShadow}
                uFog={theme.fog}
                uFogNear={10}
                uFogFar={70}
                uFogStrength={L.fogStrength ?? 1.0}
              />
            )}
          </mesh>
        </group>
      ))}
    </group>
  )
})
