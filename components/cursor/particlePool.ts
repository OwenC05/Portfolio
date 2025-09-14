import type { Particle, ParticleInit, ParticlePool } from './types'

export function createParticlePool(max: number): ParticlePool {
  let capacity = Math.max(1, max)
  const items: Particle[] = new Array(capacity)
  const alive: number[] = []
  const free: number[] = []

  // init arrays
  for (let i = 0; i < capacity; i++) {
    items[i] = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 2,
      kind: 'dot',
      spin: 0,
      spinVel: 0,
      drift: 0,
      gravity: 18,
      alive: false,
    }
    free.push(i)
  }

  function setMax(n: number) {
    n = Math.max(1, n | 0)
    if (n === capacity) return
    if (n > capacity) {
      for (let i = capacity; i < n; i++) {
        items[i] = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          life: 0,
          maxLife: 1,
          size: 2,
          kind: 'dot',
          spin: 0,
          spinVel: 0,
          drift: 0,
          gravity: 18,
          alive: false,
        }
        free.push(i)
      }
      capacity = n
      return
    }
    // shrink: mark extra items free drop
    while (alive.length > n) {
      const idx = alive.pop()!
      items[idx].alive = false
      free.push(idx)
    }
    capacity = n
    // no need to physically truncate arrays
  }

  function getMax() {
    return capacity
  }

  function aliveCount() {
    return alive.length
  }

  function resetItem(p: Particle) {
    p.vx = 0
    p.vy = 0
    p.life = 0
    p.maxLife = 1
    p.size = 2
    p.kind = 'dot'
    p.spin = 0
    p.spinVel = 0
    p.drift = 0
    p.gravity = 18
  }

  function spawn(init: ParticleInit): Particle | null {
    let idx: number | undefined = free.pop()
    if (idx === undefined) {
      // recycle oldest
      idx = alive.shift()
      if (idx === undefined) return null
    }
    const p = items[idx]
    p.alive = true
    p.x = init.x
    p.y = init.y
    // randomized defaults blended with provided init
    p.vx = init.vx ?? 0
    p.vy = init.vy ?? 0
    p.life = 0
    p.maxLife = init.maxLife ?? (0.6 + Math.random() * 0.6) // 0.6..1.2s
    p.size = init.size ?? (1.6 + Math.random() * 2.4)
    p.kind = init.kind ?? (Math.random() < 0.1 ? 'flake' : 'dot')
    p.spin = init.spin ?? 0
    p.spinVel = init.spinVel ?? (p.kind === 'flake' ? (Math.random() * 1.2 - 0.6) : 0)
    p.drift = init.drift ?? (Math.random() * 18 - 9) // px/s^2
    p.gravity = init.gravity ?? (14 + Math.random() * 12)
    alive.push(idx)
    return p
  }

  function update(dt: number) {
    // iterate alive and compact if any died
    for (let i = 0; i < alive.length; ) {
      const idx = alive[i]
      const p = items[idx]
      // physics
      p.vx += p.drift * dt
      p.vy += p.gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.kind === 'flake') p.spin += p.spinVel * dt
      p.life += dt
      if (p.life >= p.maxLife || !isFinite(p.x) || !isFinite(p.y)) {
        p.alive = false
        free.push(idx)
        // remove by swapping end
        alive[i] = alive[alive.length - 1]
        alive.pop()
      } else {
        i++
      }
    }
  }

  function forEachAlive(fn: (p: Particle) => void) {
    for (let i = 0; i < alive.length; i++) {
      fn(items[alive[i]])
    }
  }

  function clear() {
    while (alive.length) {
      const idx = alive.pop()!
      items[idx].alive = false
      resetItem(items[idx])
      free.push(idx)
    }
  }

  return { setMax, getMax, aliveCount, spawn, update, forEachAlive, clear }
}

