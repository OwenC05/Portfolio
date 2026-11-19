async (page) => {
  const base = 'http://127.0.0.1:4193';
  const out = 'C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/verification-g1/ask';
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await context.newPage(), checks = [], errors = [], captures = [];
  p.on('pageerror', error => errors.push(String(error)));
  const check = (name, pass, evidence) => checks.push({ name, pass: !!pass, evidence });
  const state = () => p.evaluate(() => ({
    status: document.querySelector('[role=status]')?.textContent,
    article: document.querySelector('article')?.innerText,
    pipeline: document.querySelector('section[aria-labelledby$="-map"] ol')?.innerText,
    sources: document.querySelectorAll('[data-run-id][data-hit-key]').length,
    quotes: [...document.querySelectorAll('blockquote')].map(e => e.textContent),
    open: document.querySelectorAll('button[aria-controls][aria-expanded=true]').length,
    focusedRow: document.activeElement?.closest('[data-run-id]')?.id ?? null,
    focusTag: document.activeElement?.tagName,
    focusText: document.activeElement?.tagName === "BODY" ? null : document.activeElement?.textContent?.slice(0, 180),
    noMatch: document.body.innerText.includes('No matching published passages'),
    overflow: document.documentElement.scrollWidth > innerWidth,
    viewport: [innerWidth, innerHeight], dpr: devicePixelRatio
  }));
  const cleared = s => s.sources === 0 && s.quotes.length === 0 && s.open === 0 && !s.pipeline.includes('731 ms') && !s.status.includes('947 ms');
  const ask = async question => { await p.getByRole('textbox', { name: 'Your question' }).fill(question); await p.getByRole('textbox', { name: 'Your question' }).press('Control+Enter'); };
  const capture = async name => { await p.screenshot({ path: `${out}/${name}.png` }); captures.push({ name, path: `${out}/${name}.png`, state: await state() }); };
  const flush = () => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const run = async (name, fn) => { try { await fn(); } catch (error) { check(name, false, { error: String(error), state: await state() }); } };
  let hits;
  try {
    await p.goto(`${base}/ask`);
    await p.getByRole('textbox', { name: 'Your question' }).waitFor();
    check('Hydrated source-only page', await p.getByText('Generated answers are not enabled', { exact: false }).count() === 1, await state());
    const responsePromise = p.waitForResponse(r => r.url() === `${base}/api/assistant` && r.request().method() === 'POST');
    await ask('What has Owen worked on at LexisNexis?');
    const response = await responsePromise;
    const events = (await response.text()).trim().split('\n').map(JSON.parse);
    hits = events.find(e => e.type === 'retrieval')?.hits;
    await p.waitForFunction(() => document.querySelector('[role=status]').textContent.startsWith('Finished in'));
    check('Real source-only stream and exact citations', hits?.length > 0 && !events.some(e => e.type === 'generation') && (await state()).quotes.every(q => hits.some(h => h.text === q)), { events, status: response.status() });

    await run('React layout-effect source focus', async () => {
      await p.getByRole('button', { name: /^Show passage 1$/i }).click();
      const s = await state(), row = await p.locator('[data-run-id]').first().getAttribute('id');
      check('Show passage focuses current row and expands it', s.focusedRow === row && s.open === 1, s);
      await p.getByRole('button', { name: /^Show passage 1$/i }).click();
      check('Already selected passage still receives focus', (await state()).focusedRow === row, await state());
      await p.locator('svg g[class*="nodeGroup"]').last().click();
      const last = await p.locator('[data-run-id]').last().getAttribute('id');
      check('Graph selection focuses matching current passage', (await state()).focusedRow === last, await state());
    });
    for (const width of [1440, 390, 320]) {
      await p.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await capture(`focused-real-${width}-top`);
      await p.locator('article').scrollIntoViewIfNeeded();
      await capture(`focused-real-${width}-citations`);
      check(`${width}px has readable source text and no horizontal overflow`, !(await state()).overflow && (await p.locator('blockquote').first().innerText()).length > 0, await state());
    }
    await p.setViewportSize({ width: 1440, height: 900 });
    // Hold fetch resolution and stream chunks independently; delayed old fetch ignores abort on purpose.
    await p.evaluate(() => {
      window.__g1RealFetch = window.fetch;
      window.__g1Requests = [];
      window.fetch = (url, options) => {
        if (String(url) !== '/api/assistant') return window.__g1RealFetch(url, options);
        const request = { question: JSON.parse(options.body).question.trim(), signal: options.signal, released: false };
        const stream = new ReadableStream({ start(c) { request.controller = c; }, cancel() { request.cancelled = true; } });
        const promise = new Promise(resolve => { request.release = () => { request.released = true; resolve(new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } })); }; });
        window.__g1Requests.push(request);
        return promise;
      };
    });
    const start = async question => { const n = await p.evaluate(() => window.__g1Requests.length); await ask(question); await p.waitForFunction(n => window.__g1Requests.length > n, n); return n; };
    const emit = async (index, events, { release = true, close = false, raw = null } = {}) => {
      await p.evaluate(({ index, events, release, close, raw }) => {
        const r = window.__g1Requests[index]; if (release && !r.released) r.release();
        for (const e of events) r.controller.enqueue(new TextEncoder().encode(JSON.stringify(e.type === 'retrieval-start' ? { ...e, question: r.question } : e) + '\n'));
        if (raw !== null) r.controller.enqueue(new TextEncoder().encode(raw));
        if (close) r.controller.close();
      }, { index, events, release, close, raw }); await flush();
    };
    const head = n => emit(n, [{ type: 'retrieval-start' }, { type: 'retrieval', hits, durationMs: 731 }]);
    const answer = { type: 'answer', answer: { mode: 'sources', text: '', citations: hits.map(h => ({ sourceId: h.sourceId, chunkId: h.chunkId, title: h.title, href: h.href, quote: h.text })) } };
    const done = { type: 'done', durationMs: 947 };
    await run('Cancel populated pending stream', async () => {
      const n = await start('Cancel fixture');
      check('New run immediately clears previous sources and answer', cleared(await state()), await state());
      await head(n); await emit(n, [answer]);
      await p.getByRole('button', { name: /^Show passage 1$/i }).click();
      check('Pending retrieved response is selected before cancellation', (await state()).open === 1, await state());
      await p.getByRole('button', { name: /^Cancel$/i }).focus(); await p.keyboard.press('Enter'); await flush();
      const s = await state(); check('Cancel clears hits, citations, selection, answer and timings', cleared(s) && s.status.startsWith('Cancelled.') && !s.pipeline.includes('sources only'), s);
      check('Keyboard cancel does not return focus to removed source', !s.focusedRow && await p.evaluate(n => window.__g1Requests[n].signal.aborted, n), s);
      await capture('cancel-cleared');
    });
    await run('Error after populated answer', async () => {
      const n = await start('Error fixture'); await head(n); await emit(n, [answer]);
      await emit(n, [], { raw: 'not-json\n' });
      const s = await state(); check('Malformed trailing chunk clears all visible result state', cleared(s) && s.status.includes('could not read'), s);
    });
    await run('Truncated response', async () => {
      const n = await start('Truncated fixture'); await head(n); await emit(n, [], { raw: '{"type":"answer"', close: true });
      const s = await state(); check('Truncated JSON is an error with cleared sources/timings', cleared(s) && s.status.includes('could not read'), s);
    });
    await run('Premature EOF after retrieval', async () => {
      const n = await start('EOF fixture'); await head(n); await emit(n, [], { close: true });
      const s = await state(); check('EOF without answer clears retrieval and is not no-match', cleared(s) && !s.noMatch && !s.status.startsWith('Finished'), s);
    });
    await run('Zero hits pending until abstention', async () => {
      const n = await start('Zero pending fixture'); await emit(n, [{ type: 'retrieval-start' }, { type: 'retrieval', hits: [], durationMs: 731 }]);
      const pending = await state(); check('Zero retrieval remains waiting without abstention UI', pending.status.includes('Waiting for the answer') && !pending.noMatch && !pending.article.includes('not supported'), pending);
      await capture('zero-hits-pending');
      await emit(n, [{ type: 'answer', answer: { mode: 'abstained', text: 'ZERO ABSTENTION', citations: [] } }, done], { close: true });
      const completed = await state(); check('Valid abstention completes zero-result state', completed.status.startsWith('Finished') && completed.article.includes('ZERO ABSTENTION') && completed.sources === 0, completed);
    });
    await run('Rapid resubmit and ignored-abort fetch', async () => {
      const old = await start('Old delayed fixture'); const current = await start('New fixture');
      await emit(current, [{ type: 'retrieval-start' }, { type: 'retrieval', hits: [], durationMs: 2 }, { type: 'answer', answer: { mode: 'abstained', text: 'CURRENT RESPONSE', citations: [] } }, { type: 'done', durationMs: 3 }], { close: true });
      await emit(old, [{ type: 'retrieval-start' }, { type: 'retrieval', hits, durationMs: 731 }, answer, done], { close: true });
      const s = await state(); check('Late old fetch cannot restore hits, answer, timings or focus', s.article.includes('CURRENT RESPONSE') && cleared(s) && !s.focusedRow, s);
      check('Superseded request received abort', await p.evaluate(n => window.__g1Requests[n].signal.aborted, old));
    });
    await run('Post-done event clears result', async () => {
      const n = await start('Post-done fixture'); await head(n); await emit(n, [answer, done]);
      await emit(n, [{ type: 'retrieval', hits, durationMs: 731 }], { close: true });
      const s = await state(); check('Nonblank content after done fails and clears current result', cleared(s) && s.status.includes('inconsistent'), s);
    });
    await run('Source focus cannot jump into new run', async () => {
      const n = await start('Focus old fixture'); await head(n); await emit(n, [answer, done], { close: true });
      await p.evaluate(() => {
        [...document.querySelectorAll('button')].find(b => b.textContent === 'Show passage 1').click();
        document.querySelector('form').requestSubmit();
      }); await flush();
      const s = await state(); check('Selection and resubmit in one task leave no old row focus', cleared(s) && !s.focusedRow, s);
    });
    check('No React hydration or runtime page errors', errors.length === 0, errors);
    return { testedAt: new Date().toISOString(), origin: base, checks, captures, errors, browser: await p.evaluate(() => navigator.userAgent), limits: ['Controlled streams test client semantics, not model quality.', 'No generated answer mode enabled.', 'Keyboard/browser focus observed; no screen-reader or physical-device audit.'] };
  } finally { await context.close(); }
}
