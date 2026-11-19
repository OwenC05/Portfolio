async (page) => {
  const config = /* PILOT_CAPTURE_CONFIG */ null;
  if (!config?.baseURL || !config?.artifactDir) throw new Error('Root must bind the preview and a fresh evidence directory');
  const records = [];
  for (const [width, height] of [[1440, 900], [390, 844], [320, 844]]) {
    const context = await page.context().browser().newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const p = await context.newPage();
    const errors = [], responses = [];
    p.on('pageerror', error => errors.push(String(error)));
    p.on('response', response => {
      if (response.url().includes('/studio/pilot-right-limit-v03.glb')) responses.push({ url: response.url(), status: response.status(), headers: response.headers() });
    });
    const settle = () => p.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    const pose = () => p.locator('canvas').evaluate(canvas => ({ ...canvas.dataset }));
    const click = async (name, count = 1) => { for (let i = 0; i < count; i++) await p.getByRole('button', { name, exact: true }).click(); await settle(); };
    const capture = async name => {
      await p.mouse.move(0, 0);
      await settle();
      const state = await p.evaluate(() => ({ status: document.querySelector('[data-scene-status]')?.dataset.sceneStatus, width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, scrollY, canvasCount: document.querySelectorAll('canvas').length, pose: { ...document.querySelector('canvas')?.dataset } }));
      const filename = `${name}-${width}.png`;
      await p.screenshot({ path: `${config.artifactDir}/${filename}`, fullPage: false });
      records.push({ filename, ...state, responses: [...responses], errors: [...errors] });
    };
    try {
      await p.goto(new URL('/studio', config.baseURL).href);
      await p.locator('[data-scene-status="ready"]').waitFor({ timeout: 30000 });
      await settle();
      if (!responses.some(response => response.status === 200)) throw new Error('Required GLB response was not observed');
      await capture('home');
      await click('Look right', 8);
      await click('Look up', 4);
      await capture('right-up');
      await click('Look down', 4);
      await capture('right-down');
      await click('Reset view');
      await click('Look right', width === 1440 ? 5 : 6);
      const beforeMusic = await pose();
      const box = await p.locator('canvas').boundingBox();
      if (!box) throw new Error('Canvas bounds unavailable');
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      await p.mouse.move(x, y);
      await p.mouse.down();
      // One trusted move crosses the drag threshold without dropping a pending first step.
      await p.mouse.move(x + (Number(beforeMusic.studioYaw) - 44) / 0.12, y + (-8 - Number(beforeMusic.studioPitch)) / 0.12);
      await p.mouse.up();
      await settle();
      const music = await pose();
      if (Math.abs(Number(music.studioYaw) - 44) > 0.2 || Math.abs(Number(music.studioPitch) + 8) > 0.2) throw new Error(`Music pose mismatch: ${JSON.stringify(music)}`);
      await capture('music');
      await click('Reset view');
      const toggle = p.getByRole('button', { name: 'Projects', exact: true });
      if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
      await p.locator('#studio-shortcut-dissertation').click();
      await p.locator('dialog[open] #panel-project-dissertation-heading').waitFor();
      await capture('project-open');
    } finally { await context.close(); }
  }
  return { config, records, scope: 'Actual imported-pilot render capture only; no full-room, production, lifecycle or performance acceptance.' };
}
