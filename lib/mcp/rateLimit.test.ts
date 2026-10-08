import { expect, it } from 'vitest'
import { createRateLimit } from './rateLimit'
it('bounds the process bucket, refills and tolerates backwards clocks', () => {
  let time = 0
  const take = createRateLimit(2, 120, () => time)
  expect(take().allowed).toBe(true)
  expect(take().allowed).toBe(true)
  expect(take()).toEqual({ allowed: false, retryAfter: 1 })
  time = 500
  expect(take().allowed).toBe(true)
  time = 0
  expect(take().allowed).toBe(false)
  time = 1500
  expect(take().allowed).toBe(true)
  expect(take().allowed).toBe(true)
  expect(take().allowed).toBe(false)
})
