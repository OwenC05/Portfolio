// Alpenglow Dusk — single source of truth for the palette.
// Consumed by R3F materials/lights as hex strings, and mirrored as CSS
// custom properties in app/globals.css. Change a colour here and in globals.css
// together; nothing else should hardcode these values.

export const alpenglow = {
  skyBase: '#1b2350', // deep indigo dusk sky / page background
  valleyShadow: '#3f5fa8', // cool blue shadow cast across the snow
  peakGlow: '#ff7aa8', // alpenglow pink hitting the high peaks
  snow: '#eaf0ff', // lit snow / primary ink on dark
  accentWarm: '#ffd27a', // warm rim light / interface accent
} as const

// Scene-specific derived roles (kept separate so tuning the 3D look never
// touches the brand palette above).
export const scene = {
  fog: '#1b2350',
  terrainSnow: '#c7d4f2', // snow in shadow — dusk-blue, never pure white
  terrainSnowLit: '#f6dbe7', // snow catching the alpenglow
  terrainRock: '#2b3358',
  ridgeFar: '#39406e',
  ridgeMid: '#2f396a',
  // signatures
  trailHot: '#ffd27a', // freshest part of the carve trail
  trailCool: '#ff7aa8', // aged carve fading into pink
  edgeIdle: '#46538c', // un-ridden carve guide
  edgeRidden: '#ff9ec1', // a path you have already carved
  stationIdle: '#8b9ad6',
  stationActive: '#ffd27a',
  // lights
  keyLight: '#ffb3c9', // warm peak-glow key light
  fillLight: '#6f86c9', // cool valley fill
  snowParticle: '#eaf0ff',
} as const

// Altitude grade stops. descentProgress runs 0 (summit) -> 1 (valley floor).
// SkyGrade lerps between these to push the sky from pink alpenglow to night.
export type GradeStop = { top: string; horizon: string; fog: string }
export const gradeStops: { p: number; stop: GradeStop }[] = [
  { p: 0, stop: { top: '#2a2f63', horizon: '#ff7aa8', fog: '#3a3a6a' } }, // SUMMIT — pink alpenglow
  { p: 0.5, stop: { top: '#1b2350', horizon: '#866ba6', fog: '#26305a' } }, // TREELINE — fading
  { p: 1, stop: { top: '#0b0f24', horizon: '#26345f', fog: '#121734' } }, // VALLEY — deep night
]

export type Zone = 'SUMMIT' | 'RIDGE' | 'TREELINE' | 'VALLEY'
export function zoneFor(p: number): Zone {
  if (p < 0.25) return 'SUMMIT'
  if (p < 0.55) return 'RIDGE'
  if (p < 0.8) return 'TREELINE'
  return 'VALLEY'
}

// Ski-trail difficulty grading, reused by signposts + the trail-map fallback.
export type Grade = 'green' | 'blue' | 'black'
export const gradeColor: Record<Grade, string> = {
  green: '#7fd1a6',
  blue: '#6f9bff',
  black: '#e7ecff', // icy white — a true-black diamond would vanish on the dusk sky
}
