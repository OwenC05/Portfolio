import { describe, it, expect } from 'vitest'
import {
  initSteerState,
  stepSteering,
  boardAngles,
  defaultSteerConfig,
  type SteerState,
} from './steering'

describe('initSteerState', () => {
  it('returns zeroed position/velocity with baseSpeed', () => {
    const s = initSteerState()
    expect(s.d).toBe(0)
    expect(s.x).toBe(0)
    expect(s.vx).toBe(0)
    expect(s.speed).toBe(defaultSteerConfig.baseSpeed)
  })

  it('uses a custom config baseSpeed', () => {
    const cfg = { ...defaultSteerConfig, baseSpeed: 5 }
    const s = initSteerState(cfg)
    expect(s.speed).toBe(5)
  })
})

describe('stepSteering', () => {
  it('straight input (0) advances d by baseSpeed*dt with x and vx unchanged', () => {
    // With steerInput=0: targetVx=0, vx stays 0, carve=0, speed=baseSpeed
    const s0 = initSteerState()
    const dt = 0.016
    const s1 = stepSteering(s0, 0, dt)
    expect(s1.d).toBeCloseTo(defaultSteerConfig.baseSpeed * dt)
    expect(s1.x).toBe(0)
    expect(s1.vx).toBe(0)
  })

  it('caps rawDt > 0.05 to 0.05 (tab-refocus spike guard)', () => {
    const s0 = initSteerState()
    const sCapped = stepSteering(s0, 0.5, 1.0) // rawDt=1.0 → clamped to 0.05
    const sExact = stepSteering(s0, 0.5, 0.05) // rawDt exactly at cap
    expect(sCapped.d).toBeCloseTo(sExact.d)
    expect(sCapped.x).toBeCloseTo(sExact.x)
    expect(sCapped.vx).toBeCloseTo(sExact.vx)
    expect(sCapped.speed).toBeCloseTo(sExact.speed)
  })

  it('clamps steerInput > 1 to 1', () => {
    const s0 = initSteerState()
    const sOver = stepSteering(s0, 2.0, 0.05)
    const sMax = stepSteering(s0, 1.0, 0.05)
    expect(sOver.vx).toBeCloseTo(sMax.vx)
    expect(sOver.x).toBeCloseTo(sMax.x)
  })

  it('clamps steerInput < -1 to -1', () => {
    const s0 = initSteerState()
    const sUnder = stepSteering(s0, -2.0, 0.05)
    const sMin = stepSteering(s0, -1.0, 0.05)
    expect(sUnder.vx).toBeCloseTo(sMin.vx)
    expect(sUnder.x).toBeCloseTo(sMin.x)
  })

  it('clamps x to +halfWidth and bleeds edge velocity under sustained right steer', () => {
    let s = initSteerState()
    for (let i = 0; i < 200; i++) {
      s = stepSteering(s, 1, 0.05)
    }
    expect(s.x).toBe(defaultSteerConfig.halfWidth)
    // velocity must be below maxStrafe due to repeated 0.25× bleed
    expect(Math.abs(s.vx)).toBeLessThan(defaultSteerConfig.maxStrafe)
  })

  it('clamps x to -halfWidth under sustained left steer', () => {
    let s = initSteerState()
    for (let i = 0; i < 200; i++) {
      s = stepSteering(s, -1, 0.05)
    }
    expect(s.x).toBe(-defaultSteerConfig.halfWidth)
  })

  it('hard carve scrubs downhill speed below baseSpeed (carveDrag)', () => {
    // After many full-steer steps vx → maxStrafe, carve → 1, speed → baseSpeed*(1-carveDrag)
    let s = initSteerState()
    for (let i = 0; i < 100; i++) {
      s = stepSteering(s, 1, 0.05)
    }
    expect(s.speed).toBeLessThan(defaultSteerConfig.baseSpeed)
  })
})

describe('boardAngles', () => {
  it('roll is 0 and yaw is 0 when vx is 0', () => {
    const s: SteerState = { d: 0, x: 0, vx: 0, speed: 7.5 }
    const ang = boardAngles(s)
    // -(+0) * 0.5 === -0 in JS; toBeCloseTo handles -0 === +0
    expect(ang.roll).toBeCloseTo(0)
    // atan2(0, 7.5)*0.9 = 0
    expect(ang.yaw).toBe(0)
  })

  it('roll sign is opposite the normalized vx (positive vx → negative roll)', () => {
    // Steering right (vx > 0): norm > 0, roll = -norm*0.5 < 0
    const sRight: SteerState = { d: 10, x: 5, vx: 5, speed: 7 }
    expect(boardAngles(sRight).roll).toBeLessThan(0)

    // Steering left (vx < 0): norm < 0, roll = -norm*0.5 > 0
    const sLeft: SteerState = { d: 10, x: -5, vx: -5, speed: 7 }
    expect(boardAngles(sLeft).roll).toBeGreaterThan(0)
  })

  it('roll magnitude corresponds to clamped |vx| / maxStrafe * 0.5', () => {
    // vx = maxStrafe → norm = 1 → roll = -0.5
    const sFull: SteerState = {
      d: 0,
      x: 0,
      vx: defaultSteerConfig.maxStrafe,
      speed: defaultSteerConfig.baseSpeed,
    }
    expect(boardAngles(sFull).roll).toBeCloseTo(-0.5)

    // vx = maxStrafe/2 → norm = 0.5 → roll = -0.25
    const sHalf: SteerState = {
      d: 0,
      x: 0,
      vx: defaultSteerConfig.maxStrafe / 2,
      speed: defaultSteerConfig.baseSpeed,
    }
    expect(boardAngles(sHalf).roll).toBeCloseTo(-0.25)
  })
})
