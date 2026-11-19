import * as THREE from 'three';
import type { GLTFParser } from 'three/addons/loaders/GLTFLoader.js';

/** Request-private owner, including allocations resolving after parse rejects. */
export class RobotResources {
  private entries = new Set<THREE.BufferGeometry | THREE.Material>();
  private released = new WeakSet<object>();
  private closed = false;

  collect(value: unknown): void {
    if (value instanceof THREE.BufferGeometry || value instanceof THREE.Material) {
      if (this.released.has(value)) return;
      if (this.closed) this.release(value); else this.entries.add(value);
    } else if (value instanceof THREE.Object3D) {
      value.traverse((node) => {
        if (node instanceof THREE.Mesh) { this.collect(node.geometry); this.collect(node.material); }
      });
    } else if (Array.isArray(value)) value.forEach((item) => this.collect(item));
  }

  track<T>(promise: Promise<T>): Promise<T> {
    return promise.then((value) => { this.collect(value); return value; });
  }

  private release(value: THREE.BufferGeometry | THREE.Material) {
    if (this.released.has(value)) return;
    this.released.add(value);
    try { value.dispose(); } catch { /* Continue independent releases. */ }
  }

  dispose() {
    this.closed = true;
    this.entries.forEach((value) => this.release(value));
    this.entries.clear();
  }
}

/** Installed r187 hooks: collect geometry even if a sibling material rejects. */
export function ownParser(parser: GLTFParser, owner: RobotResources) {
  const dependency = parser.getDependency.bind(parser);
  parser.getDependency = (type, index) => owner.track(dependency(type, index));
  const geometries = parser.loadGeometries.bind(parser);
  parser.loadGeometries = (primitives) => owner.track(geometries(primitives));
  const assign = parser.assignFinalMaterial.bind(parser);
  parser.assignFinalMaterial = (mesh) => {
    try { assign(mesh); } finally { owner.collect(mesh); }
  };
}
