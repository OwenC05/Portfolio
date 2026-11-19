import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const stage=process.argv[2];
if(stage==='tests'){
 const path='components/studio/scene/verify-controller.mjs',source=readFileSync(path,'utf8');
 const expectation='  assert.equal(h.renderers[0].dpr, 2);';assert.equal(source.split(expectation).length,2);
 const anchor="test('real Three raycasting uses the offset canvas, supports touch, and ignores drags', async () => {";assert.equal(source.split(anchor).length,2);
 const added=`test('renderer density preserves low native ratios and CSS-space picking through desktop and small resizes', async () => {
  const h = harness();
  h.window.devicePixelRatio = 1.25;
  const controller = h.mount();
  await h.flush();
  const pose = cameraPose(h);
  const desktopPoint = h.pointFor(1);
  for (const [width, height, viewportWidth, nativeDpr, renderDpr] of [
    [900, 620, 1440, 1.25, 1.25],
    [390, 520, 390, 0.75, 0.75],
    [900, 620, 1440, 1.25, 1.25],
    [900, 620, 1440, 2, 1.5],
  ]) {
    Object.assign(h.rect, { width, height });
    Object.assign(h.window, { innerWidth: viewportWidth, devicePixelRatio: nativeDpr });
    h.observers[0].callback([]);
    await h.flush();
    assert.equal(h.renderers[0].dpr, renderDpr);
    assert.equal(h.window.devicePixelRatio, nativeDpr, 'Only renderer density changes');
    assert.deepEqual(h.renderers[0].size, [width, height], 'Renderer receives CSS dimensions');
    assert.deepEqual(cameraPose(h), pose, 'Density and aspect changes preserve the fixed eye and look');
    const point = h.pointFor(1);
    if (width === 900) assert.deepEqual(point, desktopPoint, 'Desktop CSS target stays fixed across density changes');
    for (const pointerType of ['mouse', 'pen', 'touch']) assert.equal(tap(h, point, pointerType), 'copilot');
  }
  controller.dispose();
  h.assertReleased();
});

`;
 const eol=source.includes('\r\n')?'\r\n':'\n';
 writeFileSync(path,source.replace(expectation,'  assert.equal(h.renderers[0].dpr, 1.5);').replace(anchor,added.replaceAll('\n',eol)+anchor));
}else if(stage==='source'){
 const path='components/studio/scene/controller.ts',source=readFileSync(path,'utf8');
 const old='Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)';assert.equal(source.split(old).length,2);
 writeFileSync(path,source.replace(old,'Math.min(window.devicePixelRatio || 1, 1.5)'));
}else throw Error('Pass tests or source');
