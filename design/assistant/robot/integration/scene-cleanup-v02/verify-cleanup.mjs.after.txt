// Real Three resources/parser; no WebGL context or synthetic cleanup owner.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { realAsset, cardsModule } from './test-support.mjs';

function countsFor(values) {
  const counts = new Map();
  for (const value of values) if (!counts.has(value)) {
    counts.set(value, 0);
    value.addEventListener('dispose', () => counts.set(value, counts.get(value) + 1));
  }
  return counts;
}

test('G2 cleanup: root detach failure still drains every imported identity once', async () => {
  const asset = await realAsset();
  new THREE.Group().add(asset.root);
  const counts = countsFor(asset.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
  let detached = 0;
  const fault = () => { detached++; throw new Error('root detach failure'); };
  asset.root.addEventListener('removed', fault);
  assert.throws(() => asset.dispose(), /root detach failure/);
  const firstObserved = [...counts.values()];
  asset.dispose(); asset.dispose();
  assert.equal(detached, 1); assert.equal(asset.root.parent, null);
  const observed = [...counts.values()];
  // Release the private fixture if the candidate failed the assertion contract.
  asset.root.removeEventListener('removed', fault); asset.dispose();
  assert.equal(counts.size, 28);
  assert.deepEqual(firstObserved, Array(28).fill(1));
  assert.deepEqual(observed, Array(28).fill(1));
});

for (const fault of ['none', 'card0', 'card1', 'card2', 'card3', 'first', 'remaining', 'material', 'all']) {
  test(`G2 cleanup: card owner completes independent releases once with ${fault} throwing`, () => {
    const tray = new THREE.Group(), owned = cardsModule.createCards(tray);
    const resources = [owned.cards[0].geometry, owned.cards[1].geometry, owned.cards[0].material];
    const counts = countsFor(resources), detachCounts = [0, 0, 0, 0];
    const throwers = [];
    owned.cards.forEach((card, i) => {
      const callback = () => { detachCounts[i]++; if (fault === `card${i}` || fault === 'all') throw new Error(`detach ${i}`); };
      card.addEventListener('removed', callback); throwers.push([card, 'removed', callback]);
    });
    resources.forEach((resource, i) => {
      if (fault !== ['first', 'remaining', 'material'][i] && fault !== 'all') return;
      const callback = () => { throw new Error(`dispose ${i}`); };
      resource.addEventListener('dispose', callback); throwers.push([resource, 'dispose', callback]);
    });
    let error;
    try { owned.dispose(); owned.dispose(); owned.dispose(); } catch (caught) { error = caught; }
    const observed = [...counts.values()], parents = owned.cards.map((card) => card.parent);
    // Fixture recovery is outside the candidate owner and after observations.
    for (const [target, event, callback] of throwers) target.removeEventListener(event, callback);
    owned.cards.forEach((card) => card.removeFromParent());
    for (const resource of resources) if (counts.get(resource) === 0) resource.dispose();
    assert.equal(error, undefined);
    assert.deepEqual(observed, [1, 1, 1]);
    assert.deepEqual(detachCounts, [1, 1, 1, 1]);
    assert.ok(parents.every((parent) => parent === null));
  });
}
