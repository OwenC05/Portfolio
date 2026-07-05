// Pure descent math — no framework/three dependency, so it's trivially testable
// and unaffected by any upgrade. Maps the rider's distance down the slope to a
// 0..1 progress, an altitude readout, the ground height, and a named zone.

import { slope } from './projects'
import { zoneFor, type Zone } from './theme'

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/** 0 at the summit, 1 at the base of the run. */
export const descentProgress = (d: number): number => clamp01(d / slope.length)

/** Metres above sea level for the telemetry HUD. */
export const altitudeAt = (p: number): number =>
  Math.round(slope.startAltitude - p * slope.verticalDrop)

/** The slope drops in y as you travel down it (z increases). */
export const groundY = (d: number): number => -slope.grade * d

/** Named band of the mountain, drives telemetry + sky copy. */
export const zoneAt = (p: number): Zone => zoneFor(p)

/** Whole-run percentage, integer, for the HUD. */
export const runPercent = (p: number): number => Math.round(p * 100)

export type { Zone }
