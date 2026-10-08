/** Scoped progressive enhancement: native links and the neutral scene work without it. */
export function enhanceAlpineHero(hero: HTMLElement): (() => void) | undefined {
  const scene = hero.querySelector<HTMLElement>('[data-alpine-scene]')
  if (!scene || typeof window.matchMedia !== 'function') return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const fine = window.matchMedia('(pointer: fine)')
  const desktop = window.matchMedia('(min-width: 62rem)')
  const anchors = Array.from(
    hero.querySelectorAll<HTMLAnchorElement>('[data-alpine-stop]')
  )
  const segments = Array.from(
    hero.querySelectorAll<SVGPathElement>('[data-route-segment]')
  )
  let cx = 0,
    cy = 0,
    tx = 0,
    ty = 0,
    frame = 0
  let pointer: { x: number; y: number } | null = null
  let pointerHold: HTMLAnchorElement | null = null
  let focusHold: HTMLAnchorElement | null = null
  let inView = visible(),
    active = true,
    attached = false
  const max = 8,
    padding = 12

  function visible() {
    const r = hero.getBoundingClientRect()
    return (
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth
    )
  }
  function enabled() {
    return (
      active &&
      !document.hidden &&
      inView &&
      desktop.matches &&
      fine.matches &&
      !reduce.matches
    )
  }
  function held() {
    return !!(pointerHold || focusHold)
  }
  function cancel() {
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
  }
  function apply() {
    scene!.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`
  }
  function reset() {
    cancel()
    cx = cy = tx = ty = 0
    apply()
  }
  function highlight() {
    const anchor = focusHold || pointerHold
    const skill = anchor?.getAttribute('href')?.slice(1) ?? ''
    if (skill) hero.dataset.activeSkill = skill
    else delete hero.dataset.activeSkill
    segments.forEach((segment) =>
      segment.classList.toggle(
        'is-active',
        segment.dataset.routeSegment === skill
      )
    )
  }
  function freeze() {
    cancel()
    highlight()
  }
  function schedule() {
    if (enabled() && !held() && !frame && (tx !== cx || ty !== cy))
      frame = window.requestAnimationFrame(tick)
  }
  function tick() {
    frame = 0
    if (!enabled() || held()) return
    cx += (tx - cx) * 0.15
    cy += (ty - cy) * 0.15
    if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
      cx = tx
      cy = ty
    }
    apply()
    schedule()
  }
  function inside(r: DOMRect, p: typeof pointer, pad: number) {
    return (
      p &&
      p.x >= r.left - pad &&
      p.x <= r.right + pad &&
      p.y >= r.top - pad &&
      p.y <= r.bottom + pad
    )
  }
  function resume() {
    highlight()
    if (!enabled() || held()) return
    const r = hero.getBoundingClientRect()
    if (pointer && inside(r, pointer, 0) && r.width && r.height) {
      tx =
        Math.max(-1, Math.min(1, ((pointer.x - r.left) / r.width) * 2 - 1)) *
        max
      ty =
        Math.max(-1, Math.min(1, ((pointer.y - r.top) / r.height) * 2 - 1)) *
        max
    } else tx = ty = 0
    schedule()
  }
  function onPointer(event: PointerEvent) {
    if (
      event.pointerType &&
      event.pointerType !== 'mouse' &&
      event.pointerType !== 'pen'
    )
      return
    pointer = { x: event.clientX, y: event.clientY }
    if (
      pointerHold &&
      !inside(pointerHold.getBoundingClientRect(), pointer, padding)
    )
      pointerHold = null
    resume()
  }
  function onEnter(event: Event) {
    const e = event as PointerEvent
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen')
      return
    if (!desktop.matches || !fine.matches) return
    pointer = { x: e.clientX, y: e.clientY }
    pointerHold = e.currentTarget as HTMLAnchorElement
    freeze()
  }
  function onFocus(event: Event) {
    focusHold = event.currentTarget as HTMLAnchorElement
    freeze()
  }
  function onBlur(event: Event) {
    const next = (event as FocusEvent).relatedTarget as HTMLAnchorElement | null
    focusHold = next && anchors.includes(next) ? next : null
    if (held()) freeze()
    else resume()
  }
  function revalidate() {
    // Preference changes override a held pose. Inverse changes never start autoplay.
    reset()
    pointer = null
    pointerHold = null
    focusHold =
      anchors.find((anchor) => anchor === document.activeElement) ?? null
    inView = visible()
    highlight()
  }
  function onVisibility() {
    cancel()
  }
  const observer =
    typeof window.IntersectionObserver === 'function'
      ? new window.IntersectionObserver((entries) => {
          inView = entries[0].isIntersecting
          if (!inView) cancel()
        })
      : null
  function attach() {
    if (attached) return
    attached = true
    // Track exits beyond the hero only to release its padded holds; never intercept input.
    document.addEventListener('pointermove', onPointer, { passive: true })
    hero.addEventListener('pointerleave', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', revalidate, { passive: true })
    ;[reduce, fine, desktop].forEach((mq) =>
      mq.addEventListener('change', revalidate)
    )
    anchors.forEach((anchor) => {
      anchor.addEventListener('pointerenter', onEnter)
      anchor.addEventListener('focus', onFocus)
      anchor.addEventListener('blur', onBlur)
    })
    observer?.observe(hero)
  }
  function detach() {
    attached = false
    document.removeEventListener('pointermove', onPointer)
    hero.removeEventListener('pointerleave', onPointer)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', revalidate)
    ;[reduce, fine, desktop].forEach((mq) =>
      mq.removeEventListener('change', revalidate)
    )
    anchors.forEach((anchor) => {
      anchor.removeEventListener('pointerenter', onEnter)
      anchor.removeEventListener('focus', onFocus)
      anchor.removeEventListener('blur', onBlur)
    })
    observer?.disconnect()
  }
  function onHide() {
    active = false
    cancel()
    detach()
  }
  function onShow(event: PageTransitionEvent) {
    if (event.persisted) {
      active = true
      revalidate()
      attach()
    }
  }
  window.addEventListener('pagehide', onHide)
  window.addEventListener('pageshow', onShow)
  attach()
  return () => {
    active = false
    cancel()
    detach()
    window.removeEventListener('pagehide', onHide)
    window.removeEventListener('pageshow', onShow)
    pointerHold = focusHold = null
    reset()
    highlight()
  }
}
