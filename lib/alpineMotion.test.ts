import { afterEach, describe, expect, it, vi } from 'vitest'
import { enhanceAlpineHero } from '../components/portfolio/alpineMotion'

function setup(initialReduce = false) {
  const rect = (left: number, top: number, width: number, height: number) => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  })
  const hero = Object.assign(new EventTarget(), {
    dataset: {} as Record<string, string>,
    getBoundingClientRect: () => rect(0, 0, 1000, 600),
  })
  const scene = { style: { transform: '' } }
  const anchors = ['research', 'ai-systems', 'data-modelling'].map((id, i) =>
    Object.assign(new EventTarget(), {
      getAttribute: () => `#${id}`,
      getBoundingClientRect: () => rect(300 + i * 100, 200, 80, 50),
    })
  )
  const segments = anchors.map((anchor) => ({
    dataset: { routeSegment: anchor.getAttribute().slice(1) },
    classList: { toggle: vi.fn() },
  }))
  Object.assign(hero, {
    querySelector: () => scene,
    querySelectorAll: (selector: string) =>
      selector.includes('segment') ? segments : anchors,
  })
  const doc = Object.assign(new EventTarget(), {
    activeElement: null as EventTarget | null,
    hidden: false,
  })
  const media = [initialReduce, true, true].map((matches) =>
    Object.assign(new EventTarget(), { matches })
  )
  let query = 0,
    id = 0
  const queue = new Map<number, FrameRequestCallback>()
  let intersection: (entries: { isIntersecting: boolean }[]) => void = () => {}
  const win = Object.assign(new EventTarget(), {
    innerWidth: 1440,
    innerHeight: 900,
    matchMedia: () => media[query++],
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      queue.set(++id, callback)
      return id
    },
    cancelAnimationFrame: (key: number) => queue.delete(key),
    IntersectionObserver: class {
      constructor(callback: typeof intersection) {
        intersection = callback
      }
      observe() {}
      disconnect() {}
    },
  })
  vi.stubGlobal('window', win)
  vi.stubGlobal('document', doc)
  const cleanup = enhanceAlpineHero(hero as unknown as HTMLElement)!
  const emit = (target: EventTarget, type: string, fields = {}) =>
    target.dispatchEvent(Object.assign(new Event(type), fields))
  const move = (x: number, y: number) =>
    emit(doc, 'pointermove', { clientX: x, clientY: y, pointerType: 'mouse' })
  const step = () => {
    const pending = [...queue.values()]
    queue.clear()
    pending.forEach((callback) => callback(0))
  }
  const settle = () => {
    let count = 0
    while (queue.size && count++ < 150) step()
    expect(queue.size).toBe(0)
  }
  const change = (index: number, matches: boolean) => {
    media[index].matches = matches
    emit(media[index], 'change')
  }
  return {
    hero,
    scene,
    anchors,
    doc,
    win,
    queue,
    cleanup,
    emit,
    move,
    step,
    settle,
    change,
    intersection: (isIntersecting: boolean) =>
      intersection([{ isIntersecting }]),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('Alpine motion lifecycle', () => {
  it('bounds both axes at 8px and stops the idle frame loop', () => {
    const h = setup()
    expect(h.queue.size).toBe(0)
    h.move(1000, 600)
    h.settle()
    expect(h.scene.style.transform).toBe('translate3d(8.00px,8.00px,0)')
    h.move(0, 0)
    h.settle()
    expect(h.scene.style.transform).toBe('translate3d(-8.00px,-8.00px,0)')
    h.cleanup()
  })
  it('freezes the rendered moving pose throughout a 12px padded pointer region', () => {
    const h = setup()
    h.move(1000, 600)
    h.step()
    const pose = h.scene.style.transform
    h.emit(h.anchors[0], 'pointerenter', {
      clientX: 340,
      clientY: 225,
      pointerType: 'mouse',
    })
    expect(h.queue.size).toBe(0)
    h.move(390, 230)
    expect(h.scene.style.transform).toBe(pose)
    expect(h.queue.size).toBe(0)
    h.move(393, 230)
    expect(h.queue.size).toBe(1)
    h.cleanup()
  })
  it('retains independent keyboard focus after pointer engagement ends', () => {
    const h = setup()
    h.move(1000, 600)
    h.step()
    h.emit(h.anchors[0], 'focus')
    const pose = h.scene.style.transform
    h.emit(h.anchors[1], 'pointerenter', {
      clientX: 440,
      clientY: 225,
      pointerType: 'mouse',
    })
    h.move(800, 500)
    expect(h.queue.size).toBe(0)
    expect(h.scene.style.transform).toBe(pose)
    expect(h.hero.dataset.activeSkill).toBe('research')
    h.emit(h.anchors[0], 'blur', { relatedTarget: null })
    expect(h.queue.size).toBe(1)
    h.cleanup()
  })
  it('immediately neutralizes live reduced motion and supports initial reduce → normal without autoplay', () => {
    const h = setup(true)
    h.move(1000, 600)
    expect(h.queue.size).toBe(0)
    h.change(0, false)
    expect(h.queue.size).toBe(0)
    h.move(1000, 600)
    h.step()
    h.emit(h.anchors[0], 'focus')
    h.change(0, true)
    expect(h.scene.style.transform).toBe('translate3d(0.00px,0.00px,0)')
    expect(h.queue.size).toBe(0)
    h.move(0, 0)
    expect(h.queue.size).toBe(0)
    h.cleanup()
  })
  it('cancels hidden/offscreen work and does not resume an idle animation automatically', () => {
    const h = setup()
    h.move(1000, 600)
    h.doc.hidden = true
    h.emit(h.doc, 'visibilitychange')
    expect(h.queue.size).toBe(0)
    h.doc.hidden = false
    h.emit(h.doc, 'visibilitychange')
    expect(h.queue.size).toBe(0)
    h.move(0, 0)
    h.intersection(false)
    expect(h.queue.size).toBe(0)
    h.move(1000, 600)
    expect(h.queue.size).toBe(0)
    h.intersection(true)
    expect(h.queue.size).toBe(0)
    h.cleanup()
  })
  it('resets on resize and disables coarse/mobile motion', () => {
    const h = setup()
    h.move(1000, 600)
    h.step()
    h.emit(h.win, 'resize')
    expect(h.scene.style.transform).toBe('translate3d(0.00px,0.00px,0)')
    h.change(1, false)
    h.move(1000, 600)
    expect(h.queue.size).toBe(0)
    h.change(1, true)
    h.change(2, false)
    h.move(1000, 600)
    expect(h.queue.size).toBe(0)
    h.cleanup()
  })
  it('restores once after BFCache and removes every listener on React unmount', () => {
    const h = setup()
    h.move(1000, 600)
    h.emit(h.win, 'pagehide')
    expect(h.queue.size).toBe(0)
    h.move(0, 0)
    expect(h.queue.size).toBe(0)
    h.emit(h.win, 'pageshow', { persisted: true })
    h.move(1000, 600)
    h.settle()
    expect(h.scene.style.transform).toBe('translate3d(8.00px,8.00px,0)')
    h.cleanup()
    expect(h.scene.style.transform).toBe('translate3d(0.00px,0.00px,0)')
    h.emit(h.win, 'pageshow', { persisted: true })
    h.move(0, 0)
    h.emit(h.anchors[0], 'focus')
    expect(h.queue.size).toBe(0)
    expect(h.hero.dataset.activeSkill).toBeUndefined()
  })
})
