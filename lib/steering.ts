// Pure steering integration for the run. Frame-rate independent (delta-correct
// exponential smoothing), zero allocations, no three/React deps — so it's
// unit-testable and survives any framework upgrade.
//
// Model: the rider always slides downhill (gravity). The player only steers
// laterally; hard carving scrubs a little downhill speed, which is what makes
// it feel like edging a snowboard rather than strafing a spaceship.

export type SteerState = {
  d: number // distance travelled down the slope (0 -> slope.length)
  x: number // lateral position (− = research/left, + = build/right)
  vx: number // smoothed lateral velocity
  speed: number // current downhill speed
}

export type SteerConfig = {
  baseSpeed: number // downhill units / sec when going straight
  maxStrafe: number // peak lateral speed at full steer
  steerDecay: number // exponential approach rate for vx (higher = snappier)
  halfWidth: number // lateral clamp (slope half-width)
  carveDrag: number // 0..1, how much a hard carve scrubs downhill speed
}

export const defaultSteerConfig: SteerConfig = {
  baseSpeed: 7.5,
  maxStrafe: 10,
  steerDecay: 6,
  halfWidth: 15,
  carveDrag: 0.35,
}

export const initSteerState = (cfg: SteerConfig = defaultSteerConfig): SteerState => ({
  d: 0,
  x: 0,
  vx: 0,
  speed: cfg.baseSpeed,
})

/** Delta-correct exponential approach: identical feel at 30/60/144fps. */
const damp = (current: number, target: number, decay: number, dt: number): number =>
  target + (current - target) * Math.exp(-decay * dt)

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v

/** Advance the steering state by dt seconds given steer input in [-1, 1]. */
export function stepSteering(
  s: SteerState,
  steerInput: number,
  rawDt: number,
  cfg: SteerConfig = defaultSteerConfig,
): SteerState {
  const dt = clamp(rawDt, 0, 0.05) // cap big jumps (tab refocus)
  const input = clamp(steerInput, -1, 1)

  const targetVx = input * cfg.maxStrafe
  let vx = damp(s.vx, targetVx, cfg.steerDecay, dt)
  let x = s.x + vx * dt

  // Bleed velocity against the slope edges so you don't stick.
  if (x > cfg.halfWidth) {
    x = cfg.halfWidth
    vx *= 0.25
  } else if (x < -cfg.halfWidth) {
    x = -cfg.halfWidth
    vx *= 0.25
  }

  const carve = Math.abs(vx) / cfg.maxStrafe
  const speed = cfg.baseSpeed * (1 - cfg.carveDrag * carve)
  const d = s.d + speed * dt

  return { d, x, vx, speed }
}

/** Board orientation derived from motion — for the visual mesh + carve trail. */
export function boardAngles(s: SteerState, cfg: SteerConfig = defaultSteerConfig) {
  const norm = clamp(s.vx / cfg.maxStrafe, -1, 1)
  return {
    yaw: Math.atan2(s.vx, Math.max(0.001, s.speed)) * 0.9, // point where it's heading
    roll: -norm * 0.5, // lean into the carve (radians)
  }
}
