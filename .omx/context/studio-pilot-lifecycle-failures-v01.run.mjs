async (page) => {
  // BEGIN PNG MUTATOR (also extracted by the CPU-only static check)
  function corruptEmbeddedPNG(input) {
    const bytes = Uint8Array.from(input), view = new DataView(bytes.buffer);
    const require = (condition, message) => { if (!condition) throw new Error(`PNG decoder case blocked: ${message}`); };
    const integer = value => Number.isSafeInteger(value) && value >= 0;
    require(bytes.length >= 20, 'truncated GLB');
    require(view.getUint32(0, true) === 0x46546c67 && view.getUint32(4, true) === 2 && view.getUint32(8, true) === bytes.length, 'GLB header/version/length');
    const chunks = [];
    for (let offset = 12; offset < bytes.length;) {
      require(offset + 8 <= bytes.length, 'chunk header bounds');
      const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
      require(length % 4 === 0 && offset + 8 + length <= bytes.length, 'chunk payload bounds/alignment');
      chunks.push({ offset, start: offset + 8, length, type });
      offset += 8 + length;
    }
    require(chunks.length === 2 && chunks[0].type === 0x4e4f534a && chunks[1].type === 0x004e4942, 'expected JSON then BIN only');
    const [jsonChunk, bin] = chunks;
    const jsonText = new TextDecoder().decode(bytes.subarray(jsonChunk.start, jsonChunk.start + jsonChunk.length));
    const gltf = JSON.parse(jsonText);
    require(gltf.buffers?.length === 1 && !gltf.buffers[0].uri && integer(gltf.buffers[0].byteLength) && gltf.buffers[0].byteLength <= bin.length && bin.length - gltf.buffers[0].byteLength <= 3, 'embedded buffer bounds');
    for (const item of gltf.bufferViews || []) require(item.buffer === 0 && integer(item.byteOffset ?? 0) && integer(item.byteLength) && (item.byteOffset ?? 0) + item.byteLength <= gltf.buffers[0].byteLength, 'bufferView bounds');
    require(gltf.images?.length > 0 && gltf.images.every(image => image.mimeType === 'image/png' && !image.uri && integer(image.bufferView)), 'only embedded PNG images supported');
    const imageIndex = 0, image = gltf.images[imageIndex], imageView = gltf.bufferViews?.[image.bufferView];
    require(!!imageView, 'image bufferView missing');
    const start = bin.start + (imageView.byteOffset ?? 0), end = start + imageView.byteLength;
    require(end - start >= 33 && [137,80,78,71,13,10,26,10].every((value, i) => bytes[start + i] === value), 'PNG signature');
    const pngChunks = [];
    let idat, ended = false;
    for (let offset = start + 8; offset < end;) {
      require(offset + 12 <= end, 'PNG chunk header bounds');
      const length = view.getUint32(offset), type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
      require(offset + 12 + length <= end, 'PNG chunk payload bounds');
      pngChunks.push({ offset, length, type });
      if (type === 'IDAT' && !idat && length > 0) idat = { offset, length };
      offset += 12 + length;
      if (type === 'IEND') { require(length === 0 && offset === end, 'PNG end boundary'); ended = true; }
    }
    require(ended && pngChunks[0]?.type === 'IHDR' && pngChunks[0].length === 13 && !!idat, 'PNG IHDR/IDAT/IEND required');
    // Set zlib CMF to 0: compression method 0 is invalid (PNG requires deflate=8).
    // Recompute IDAT CRC so rejection concerns image stream decoding, not chunk CRC.
    const changedOffset = idat.offset + 8, crcOffset = changedOffset + idat.length;
    for (const [index, other] of gltf.bufferViews.entries()) {
      if (index === image.bufferView) continue;
      const otherStart = bin.start + (other.byteOffset ?? 0), otherEnd = otherStart + other.byteLength;
      require(otherEnd <= changedOffset || otherStart >= crcOffset + 4, 'image mutation overlaps another bufferView');
    }
    require(bytes[changedOffset] !== 0, 'source already has invalid zlib header');
    const originalByte = bytes[changedOffset];
    bytes[changedOffset] = 0;
    let crc = 0xffffffff;
    for (let i = idat.offset + 4; i < crcOffset; i++) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    view.setUint32(crcOffset, (crc ^ 0xffffffff) >>> 0);
    const outsideMutationUnchanged = bytes.every((value, i) => i === changedOffset || (i >= crcOffset && i < crcOffset + 4) || value === input[i]);
    require(outsideMutationUnchanged && bytes.length === input.length, 'mutation escaped payload/CRC bounds');
    return { bytes, evidence: { imageIndex, imageBufferView: image.bufferView, glbLength: bytes.length, jsonLength: jsonChunk.length, binLength: bin.length, imageLength: imageView.byteLength, width: view.getUint32(start + 16), height: view.getUint32(start + 20), changedOffset, originalByte, replacementByte: 0, crcOffset, crcRecomputed: true, containerAndJSONUnchanged: outsideMutationUnchanged, pngSignatureIHDRAndChunkHeadersUnchanged: outsideMutationUnchanged, bufferBoundsPreserved: true, pngChunks } };
  }
  // END PNG MUTATOR
  const config = {"previewMode":"development","scope":"Only delayed-unmount and context-loss-panel execute; no production or total resource-disposal claim.","hashes":{"loader":"B5CD61C682DD69D2336B10B508B516999E72D73A00EDBD6E2CEBCF0323D39D11","glb":"2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E","controller":"CC76055EA4BFE596E0D3AB49C84CA55C55B8A9BAD3B33627E08ADEB78F0969F0"},"artifactDir":"C:\\Users\\Owenc\\orca\\Portfolio\\.omx\\artifacts\\visual-ralph\\portfolio-immersive-v2\\pilot-runtime-v01\\lifecycle-failures","baseURL":"http://127.0.0.1:4181","glbs":["/studio/pilot-right-limit-v03.glb"],"sceneJS":["/_next/static/chunks/_app-pages-browser_components_studio_StudioScene_tsx.js"]};
  if (!config?.baseURL || !config.previewMode || !config.hashes || !config.sceneJS?.length || !config.glbs?.length || !config.artifactDir) throw new Error('Supply final v2 config; see README.md');
  const absolute = value => new URL(value, config.baseURL).href;
  const browser = page.context().browser(), checks = [];
  const cases = [
    ...config.sceneJS.map(url => ({ mode: 'lazy-chunk', url })),
    ...config.glbs.flatMap(url => ['glb-network', 'glb-decode', 'embedded-png-decode', 'delayed-unmount'].map(mode => ({ mode, url }))),
    { mode: 'webgl-creation' }, { mode: 'context-loss-panel' },
  ];
  for (const [index, scenario] of cases.filter(item => ['delayed-unmount', 'context-loss-panel'].includes(item.mode)).entries()) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const p = await context.newPage(), errors = [], consoleErrors = [], routeEvents = [];
    let release, injectionBlocked;
    const gate = new Promise(resolve => { release = resolve; });
    p.on('pageerror', error => errors.push(String(error)));
    p.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    try {
      await p.addInitScript(() => { window.__v2DocumentToken = Math.random(); });
      if (scenario.url) await context.route(absolute(scenario.url), async route => {
        routeEvents.push({ event: 'intercepted', url: route.request().url() });
        try {
          if (scenario.mode === 'delayed-unmount') {
            const response = await route.fetch();
            routeEvents.push({ event: 'response-held', status: response.status() });
            await gate;
            await route.fulfill({ response });
          } else if (scenario.mode === 'embedded-png-decode') {
            const response = await route.fetch();
            if (response.status() !== 200) throw new Error(`PNG decoder case blocked: upstream HTTP ${response.status()}`);
            const body = await response.body();
            const mutation = corruptEmbeddedPNG(body);
            body.set(mutation.bytes);
            // route.fetch() body is decoded; do not replay wire compression headers.
            const headers = { ...response.headers() };
            delete headers['content-encoding']; delete headers['content-length'];
            delete headers.etag; delete headers['content-md5'];
            await route.fulfill({ status: 200, headers, body });
            routeEvents.push({ event: 'embedded-png-corrupted', ...mutation.evidence });
          } else if (scenario.mode === 'glb-decode') {
            // HTTP success with invalid GLB bytes exercises the loader's decode rejection.
            // This is not embedded PNG/JPEG corruption coverage.
            await route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid glTF binary payload' });
          } else await route.abort('failed');
          routeEvents.push({ event: 'completed' });
        } catch (error) {
          injectionBlocked = String(error);
          routeEvents.push({ event: 'route-error', error: injectionBlocked });
          await route.abort('failed').catch(() => {});
        }
      });
      if (scenario.mode === 'webgl-creation') await p.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          return type === 'webgl' || type === 'webgl2' ? null : original.call(this, type, ...args);
        };
      });
      await p.goto(absolute('/studio'));
      if (scenario.mode === 'delayed-unmount') {
        const deadline = Date.now() + 15000;
        while (!routeEvents.some(e => e.event === 'response-held') && Date.now() < deadline) await p.waitForTimeout(50);
        if (!routeEvents.some(e => e.event === 'response-held')) throw new Error('Configured GLB was not requested/held; do not claim asset coverage');
        await p.waitForFunction(() => !!window.next?.router);
        const token = await p.evaluate(() => window.__v2DocumentToken);
        await p.evaluate(() => window.next.router.push('/'));
        await p.locator('#studio').waitFor({ state: 'detached' });
        release();
        await p.waitForTimeout(1000);
        const state = await p.evaluate(() => ({ token: window.__v2DocumentToken, canvases: document.querySelectorAll('canvas').length, studio: !!document.querySelector('#studio'), pathname: location.pathname }));
        checks.push({ scenario, routeEvents, errors, consoleErrors, state, pass: state.token === token && state.pathname === '/' && !state.studio && state.canvases === 0 && errors.length === 0, limitation: 'Same-document unmount before delayed response. DOM/error observation only: parsed-resource disposal and late ImageBitmap/texture ownership require S adapter CPU tests and instrumented lifecycle review. A cancelled delivery is recorded, not proof of parse completion.' });
        continue;
      }
      let loss;
      if (scenario.mode === 'context-loss-panel') {
        await p.locator('[data-scene-status="ready"]').waitFor();
        const projectsToggle = p.getByRole('button', { name: 'Projects', exact: true });
        if (await projectsToggle.isVisible() && await projectsToggle.getAttribute('aria-expanded') === 'false') {
          await projectsToggle.click();
        }
        await p.locator('#studio-shortcut-dissertation').click();
        await p.locator('dialog[open]').waitFor();
        loss = await p.evaluate(() => {
          const gl = document.querySelector('canvas').getContext('webgl2');
          const extension = gl.getExtension('WEBGL_lose_context');
          if (!extension) return { supported: false };
          window.__v2LostContext = gl;
          extension.loseContext();
          return { supported: true };
        });
        if (!loss.supported) throw new Error('WEBGL_lose_context unavailable; coverage blocked');
      }
      await p.locator('[data-scene-status="unavailable"]').waitFor();
      if (injectionBlocked) throw new Error(injectionBlocked);
      if (scenario.mode === 'embedded-png-decode' && !routeEvents.some(event => event.event === 'embedded-png-corrupted')) throw new Error('PNG decoder case blocked: corruption not delivered');
      const fallback = await p.evaluate(() => ({ status: document.querySelector('[data-scene-status]').dataset.sceneStatus, canvases: document.querySelectorAll('canvas').length, guidance: document.querySelector('[role="status"]')?.textContent, lost: window.__v2LostContext?.isContextLost() }));
      if (scenario.mode !== 'context-loss-panel') await p.locator('#studio-shortcut-dissertation').click();
      await p.locator('dialog[open] #panel-project-dissertation-heading').waitFor();
      const panel = await p.evaluate(() => ({ focus: document.activeElement.id, text: document.querySelector('dialog[open]').textContent, hash: location.hash }));
      await p.screenshot({ path: `${config.artifactDir}/${index}-${scenario.mode}.png` });
      await p.keyboard.press('Escape');
      await p.locator('dialog[open]').waitFor({ state: 'detached' });
      const closed = await p.evaluate(() => ({ focus: document.activeElement.id, pathname: location.pathname, hash: location.hash }));
      checks.push({ scenario, routeEvents, fallback, panel, closed, loss, errors, consoleErrors, pass: fallback.status === 'unavailable' && fallback.canvases === 0 && /reload/i.test(fallback.guidance || '') && panel.focus === 'panel-project-dissertation-heading' && panel.text.length > 100 && closed.focus === 'studio-shortcut-dissertation' && closed.pathname === '/studio' && (!scenario.url || routeEvents.some(e => e.event === 'intercepted')) && (scenario.mode !== 'context-loss-panel' || fallback.lost === true) });
    } catch (error) {
      checks.push({ scenario, pass: false, error: String(error), routeEvents, errors, consoleErrors });
    } finally { release(); await context.close(); }
  }
  return { config, checks, failures: checks.filter(check => !check.pass), note: 'Expected injected failure console output is preserved for review; it is not blanket-suppressed. No product hooks or source changes. This is graphics-failure panel usability, not the full v2 history/noJS acceptance suite.' };
}

