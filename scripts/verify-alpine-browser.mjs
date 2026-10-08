// Production browser QA. Uses an existing Playwright installation, never installs dependencies.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs PLAYWRIGHT_EXECUTABLE=/path/to/chromium node scripts/verify-alpine-browser.mjs http://127.0.0.1:3006
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.argv[2] || 'http://127.0.0.1:3006')
assert(['127.0.0.1', 'localhost'].includes(base.hostname), 'Use a local production preview')
const out = new URL('../.omx/artifacts/alpine-production/browser/', import.meta.url)
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) })
const routes = ['/', '/about', '/projects', '/contact', '/projects/lexisnexis-applied-ai', '/projects/lexisnexis-ml', '/projects/typeforge', '/agents']
const report = { renders: [], checks: [], errors: [], limitations: ['Automated Chromium checks and visual review, not an exhaustive accessibility audit or field performance measurement.', '200% layout zoom emulated with CSS zoom.'] }
async function check(name, fn) {
  try { report.checks.push({ name, pass: true, detail: await fn() }) }
  catch (e) { report.checks.push({ name, pass: false, error: e.message }); report.errors.push(`${name}: ${e.message}`) }
}
async function ready(p, route) { const res = await p.goto(new URL(route, base).href); assert.equal(res.status(), 200); await p.evaluate(() => document.fonts.ready); }
const file = route => route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')
try {
  for (const width of [320, 390, 768, 1100, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const p = await context.newPage()
    const errors = []
    p.on('pageerror', e => errors.push(e.message))
    for (const route of routes) {
      await check(`${route} ${width}: layout and semantics`, async () => {
        await ready(p, route)
        const info = await p.evaluate(() => {
          const visible = e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0
          const rect = e => { const r = e.getBoundingClientRect(); return { width: r.width, height: r.height } }
          return {
            title: document.title,
            h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
            main: document.querySelectorAll('main').length,
            overflow: document.documentElement.scrollWidth - innerWidth,
            fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
            targets: [...document.querySelectorAll('.site-header a, .footer-bottom a, .text-link, .alpine-link')].filter(visible).map(e => ({ text: e.textContent.trim(), ...rect(e) })),
            current: [...document.querySelectorAll('.site-header [aria-current]')].map(e => ({ href: e.getAttribute('href'), state: e.getAttribute('aria-current') })),
            prototypeLinks: [...document.links].filter(e => /round-\d|refined\/|baseline\/|index\.html/.test(e.getAttribute('href'))).length,
            canvas: document.querySelectorAll('canvas').length,
            bodyColor: getComputedStyle(document.body).color,
            bodyBackground: getComputedStyle(document.body).backgroundColor,
          }
        })
        report.renders.push({ route, width, ...info })
        assert.equal(info.h1.length, 1); assert.equal(info.main, 1); assert(info.overflow <= 1, `horizontal overflow ${info.overflow}`)
        assert(info.fonts.some(f => /Hanken/.test(f))); assert(info.fonts.some(f => /Inter/.test(f)))
        assert(info.targets.every(t => t.width >= 44 && t.height >= 44), JSON.stringify(info.targets.filter(t => t.width < 44 || t.height < 44)))
        assert.equal(info.prototypeLinks, 0); assert.equal(info.canvas, 0)
        if (route.startsWith('/projects')) assert(info.current.some(n => n.href === '/projects' && n.state === (route === '/projects' ? 'page' : 'location')))
        if (route === '/contact') assert.equal(await p.locator('.footer-top').isVisible(), false)
        if ([390, 1440].includes(width)) {
          await p.screenshot({ path: new URL(`${file(route)}-${width}-full.png`, out).pathname, fullPage: true })
          if (route === '/') await p.screenshot({ path: new URL(`home-${width}-viewport.png`, out).pathname })
        }
        return { h1: info.h1[0], overflow: info.overflow }
      })
    }
    await check(`${width}: no browser exceptions`, () => assert.deepEqual(errors, []))
    await context.close()
  }
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await c.newPage()
  await ready(p, '/')
  const transform = () => p.locator('[data-alpine-scene]').evaluate(e => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return { x: m.m41, y: m.m42 } })
  await check('Desktop bounded background motion and stable identity', async () => {
    const identity = await p.locator('.alpine-identity').boundingBox()
    await p.mouse.move(1400, 600); await p.waitForTimeout(600)
    const t = await transform(); assert(Math.abs(t.x) <= 8 && Math.abs(t.y) <= 8); assert(Math.abs(t.x) + Math.abs(t.y) > .1)
    assert.deepEqual(await p.locator('.alpine-identity').boundingBox(), identity)
    return t
  })
  await check('Focused skill freezes background and follows native anchor', async () => {
    const skill = p.locator('[data-alpine-stop]').first(); await skill.focus()
    const before = await transform(); await p.mouse.move(10, 600); await p.waitForTimeout(250); assert.deepEqual(await transform(), before)
    assert.equal(await p.locator('[data-alpine-hero]').getAttribute('data-active-skill'), 'research')
    const focus = await skill.evaluate(e => getComputedStyle(e).outlineStyle); assert.notEqual(focus, 'none')
    await p.keyboard.press('Enter'); await p.waitForURL('**/#research'); assert(await p.locator('#research').evaluate(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }))
  })
  await check('Runtime reduced motion disables transform', async () => {
    await ready(p, '/'); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.mouse.move(1400, 600); await p.waitForTimeout(100)
    assert.deepEqual(await transform(), { x: 0, y: 0 })
  })
  await check('Pointer hold freezes and highlights a skill', async () => {
    await p.emulateMedia({ reducedMotion: 'no-preference' }); await ready(p, '/')
    const stop = p.locator('[data-alpine-stop]').nth(1); await stop.hover(); const before = await transform(); await p.waitForTimeout(250)
    assert.deepEqual(await transform(), before); assert.equal(await p.locator('[data-alpine-hero]').getAttribute('data-active-skill'), 'ai-systems')
  })
  await check('200% layout zoom remains readable', async () => {
    for (const route of ['/', '/about', '/projects', '/contact']) {
      await ready(p, route); await p.evaluate(() => { document.documentElement.style.zoom = '2' })
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route)
      await p.screenshot({ path: new URL(`${file(route)}-zoom.png`, out).pathname, fullPage: true })
    }
  })
  await c.close()
  for (const route of routes) await check(`${route}: no-JavaScript reading and navigation`, async () => {
    const c = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }), p = await c.newPage()
    try { await ready(p, route); assert.equal(await p.locator('h1').count(), 1); assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await p.locator('.site-header a[href="/about"]').click(); await p.waitForURL('**/about'); }
    finally { await c.close() }
  })
  await check('Mobile touch and missing artwork retain usable skills', async () => {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }), p = await c.newPage()
    try { await p.route('**/*off-piste-terrain*', r => r.abort()); await ready(p, '/'); assert.equal(await p.locator('.alpine-waypoints a').count(), 3); await p.locator('.alpine-waypoints a').nth(2).click(); await p.waitForURL('**/#data-modelling'); assert(await p.locator('#data-modelling').evaluate(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })); await p.screenshot({ path: new URL('mobile-no-art.png', out).pathname, fullPage: true }) }
    finally { await c.close() }
  })
} finally {
  await browser.close()
  await writeFile(new URL('report.json', out), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ renders: report.renders.length, checks: report.checks.length, errors: report.errors }, null, 2))
  if (report.errors.length) process.exitCode = 1
}
