export type ParticleKind = 'dot' | 'flake'

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  kind: ParticleKind
  spin: number
  spinVel: number
  drift: number
  gravity: number
  alive: boolean
}

export type ParticleInit = Partial<Omit<Particle, 'alive'>> & Pick<Particle, 'x' | 'y'>

export type ParticlePool = {
  setMax: (n: number) => void
  getMax: () => number
  aliveCount: () => number
  spawn: (init: ParticleInit) => Particle | null
  update: (dt: number) => void
  forEachAlive: (fn: (p: Particle) => void) => void
  clear: () => void
}

export type CursorSettings = {
  maxParticles: number
  baseRate: number
  ratePerSpeed: number
  clickBurstMin: number
  clickBurstMax: number
  dprMax: number
}

export const defaultSettings: CursorSettings = {
  maxParticles: 90,
  baseRate: 5, // particles/sec at idle
  ratePerSpeed: 0.025, // per px/sec
  clickBurstMin: 8,
  clickBurstMax: 12,
  dprMax: 1.75,
}

