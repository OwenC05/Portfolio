import { describe, it, expect } from 'vitest'
import { descentProgress, altitudeAt, groundY, zoneAt, runPercent, clamp01 } from './descent'
import { slope } from './projects'

describe('clamp01', () => {
  it('passes values in [0, 1] unchanged', () => {
    expect(clamp01(0)).toBe(0)
    expect(clamp01(1)).toBe(1)
    expect(clamp01(0.5)).toBe(0.5)
  })

  it('clamps negative values to 0', () => {
    expect(clamp01(-0.001)).toBe(0)
    expect(clamp01(-100)).toBe(0)
  })

  it('clamps values above 1 to 1', () => {
    expect(clamp01(1.001)).toBe(1)
    expect(clamp01(100)).toBe(1)
  })
})

describe('descentProgress', () => {
  it('returns 0 at the summit (d = 0)', () => {
    expect(descentProgress(0)).toBe(0)
  })

  it('returns 1 at the full run length', () => {
    expect(descentProgress(slope.length)).toBe(1)
  })

  it('clamps below 0 to 0', () => {
    expect(descentProgress(-10)).toBe(0)
  })

  it('clamps beyond slope.length to 1', () => {
    expect(descentProgress(slope.length + 50)).toBe(1)
  })

  it('returns 0.5 at the mid-point', () => {
    expect(descentProgress(slope.length / 2)).toBeCloseTo(0.5)
  })
})

describe('altitudeAt', () => {
  it('returns startAltitude at p = 0 (summit)', () => {
    expect(altitudeAt(0)).toBe(slope.startAltitude)
  })

  it('returns startAltitude minus verticalDrop at p = 1 (base)', () => {
    expect(altitudeAt(1)).toBe(slope.startAltitude - slope.verticalDrop)
    expect(altitudeAt(1)).toBe(1720) // literal oracle, independent of slope constants
  })

  it('interpolates mid-run (literal oracle, exercises rounding path)', () => {
    expect(altitudeAt(0.5)).toBe(2100) // 2480 - 760/2
  })
})

describe('groundY', () => {
  it('is 0 at the summit', () => {
    // -slope.grade * 0 === -0 in JS; toBeCloseTo handles -0 === +0
    expect(groundY(0)).toBeCloseTo(0)
  })

  it('is strictly decreasing (negative) as d grows', () => {
    expect(groundY(1)).toBeLessThan(groundY(0))
    expect(groundY(50)).toBeLessThan(groundY(1))
    expect(groundY(slope.length)).toBeLessThan(groundY(50))
  })

  it('equals -grade * d for several waypoints (literal oracles)', () => {
    expect(groundY(10)).toBeCloseTo(-1.6) // -0.16 * 10
    expect(groundY(100)).toBeCloseTo(-16)
  })
})

describe('runPercent', () => {
  it('rounds progress to the nearest integer percent', () => {
    expect(runPercent(0)).toBe(0)
    expect(runPercent(1)).toBe(100)
    expect(runPercent(0.5)).toBe(50)
    expect(runPercent(0.333)).toBe(33) // Math.round(33.3) = 33
    expect(runPercent(0.666)).toBe(67) // Math.round(66.6) = 67
    expect(runPercent(0.999)).toBe(100) // Math.round(99.9) = 100
  })
})

describe('zoneAt', () => {
  it('returns SUMMIT for p < 0.25', () => {
    expect(zoneAt(0)).toBe('SUMMIT')
    expect(zoneAt(0.24)).toBe('SUMMIT')
  })

  it('returns RIDGE for 0.25 <= p < 0.55', () => {
    expect(zoneAt(0.25)).toBe('RIDGE') // exact boundary: not < 0.25
    expect(zoneAt(0.3)).toBe('RIDGE')
    expect(zoneAt(0.54)).toBe('RIDGE')
  })

  it('returns TREELINE for 0.55 <= p < 0.8', () => {
    expect(zoneAt(0.55)).toBe('TREELINE') // exact boundary: not < 0.55
    expect(zoneAt(0.6)).toBe('TREELINE')
    expect(zoneAt(0.79)).toBe('TREELINE')
  })

  it('returns VALLEY for p >= 0.8', () => {
    expect(zoneAt(0.8)).toBe('VALLEY') // exact boundary: not < 0.8
    expect(zoneAt(0.9)).toBe('VALLEY')
    expect(zoneAt(1)).toBe('VALLEY')
  })
})
