import * as THREE from 'three';
import { PROJECT_IDS, type ProjectId } from '@/lib/studio-contract';
import type { StudioModel } from './types';

const MIN_TOUCH_TARGET = 44;
const EPSILON = 1e-6;

function visible(object: THREE.Object3D, camera: THREE.Camera) {
  if (!object.layers.test(camera.layers)) return false;
  for (let parent: THREE.Object3D | null = object; parent; parent = parent.parent) {
    if (!parent.visible) return false;
  }
  return true;
}

function materialAt(hit: THREE.Intersection<THREE.Object3D>) {
  const material = (hit.object as THREE.Mesh).material;
  return Array.isArray(material) ? material[hit.face?.materialIndex ?? 0] : material;
}

function depth(point: THREE.Vector3, camera: THREE.Camera) {
  return -point.clone().applyMatrix4(camera.matrixWorldInverse).z;
}

function inClip(hit: THREE.Intersection, camera: THREE.PerspectiveCamera) {
  const z = depth(hit.point, camera);
  return Number.isFinite(z) && z >= camera.near && z <= camera.far;
}

function frontFacing(hit: THREE.Intersection, ray: THREE.Ray) {
  if (!hit.face) return false;
  const normal = hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
  return normal.dot(ray.direction) < -EPSILON;
}

// Clip the actual projected triangles, not an unbounded screen-space AABB.
function clipPolygon(points: THREE.Vector3[], axis: 'x' | 'y' | 'z', limit: number, sign: number) {
  const result: THREE.Vector3[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const da = (a[axis] - limit) * sign;
    const db = (b[axis] - limit) * sign;
    if (da >= 0) result.push(a);
    if ((da >= 0) !== (db >= 0)) result.push(a.clone().lerp(b, da / (da - db)));
  }
  return result;
}

function projectedTriangles(surface: THREE.Mesh, camera: THREE.PerspectiveCamera, width: number, height: number) {
  const geometry = surface.geometry;
  const attribute = geometry.getAttribute('position');
  if (!attribute) return [];
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i < attribute.count; i++) {
    const point = new THREE.Vector3().fromBufferAttribute(attribute, i).applyMatrix4(surface.matrixWorld);
    // Conservative whole-surface rejection prevents the near/camera-plane
    // singularity from creating an enormous touch region in a side view.
    const z = depth(point, camera);
    if (!Number.isFinite(z) || z <= camera.near + EPSILON) return [];
    vertices.push(point);
  }
  const polygons: THREE.Vector2[][] = [];
  const index = geometry.index;
  const count = index?.count ?? attribute.count;
  const start = geometry.drawRange.start;
  const end = Math.min(count, start + geometry.drawRange.count);
  for (let i = start; i + 2 < end; i += 3) {
    const group = geometry.groups.find((item) => i >= item.start && i < item.start + item.count);
    const material = Array.isArray(surface.material) ? surface.material[group?.materialIndex ?? 0] : surface.material;
    if (!material?.visible || material.opacity <= 0 || material.side === THREE.BackSide) continue;
    const triangle = [0, 1, 2].map((offset) => vertices[index ? index.getX(i + offset) : i + offset]);
    const normal = new THREE.Vector3().subVectors(triangle[1], triangle[0]).cross(new THREE.Vector3().subVectors(triangle[2], triangle[0]));
    if (normal.dot(new THREE.Vector3().subVectors(camera.position, triangle[0])) <= EPSILON) continue;
    let polygon = triangle.map((point) => point.clone().project(camera));
    if (polygon.some((point) => ![point.x, point.y, point.z].every(Number.isFinite))) continue;
    for (const axis of ['x', 'y', 'z'] as const) {
      polygon = clipPolygon(polygon, axis, -1, 1);
      polygon = clipPolygon(polygon, axis, 1, -1);
    }
    if (polygon.length < 3) continue;
    const pixels = polygon.map((point) => new THREE.Vector2((point.x + 1) * width / 2, (1 - point.y) * height / 2));
    const area = pixels.reduce((sum, point, i) => {
      const next = pixels[(i + 1) % pixels.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0);
    if (Math.abs(area) > EPSILON) polygons.push(pixels);
  }
  return polygons;
}

function closestOnPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let nearest = polygon[0];
  let distance = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const edge = b.clone().sub(a);
    const t = THREE.MathUtils.clamp(point.clone().sub(a).dot(edge) / (edge.lengthSq() || 1), 0, 1);
    const candidate = a.clone().addScaledVector(edge, t);
    if (candidate.distanceToSquared(point) < distance) {
      nearest = candidate;
      distance = candidate.distanceToSquared(point);
    }
  }
  // Move very slightly inside the clipped triangle for stable edge raycasts.
  const center = polygon.reduce((sum, vertex) => sum.add(vertex), new THREE.Vector2()).multiplyScalar(1 / polygon.length);
  return nearest.clone().lerp(center, 1e-5);
}

/** CPU-testable perspective picker. Coordinates and expansion are CSS pixels. */
export function pickProject(model: StudioModel, camera: THREE.PerspectiveCamera, x: number, y: number, width: number, height: number, expandTouch: boolean): ProjectId | null {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0 || x < 0 || y < 0 || x > width || y > height) return null;
  model.scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  const targets = PROJECT_IDS.flatMap((id) => model.targets.filter((target) => target.id === id && visible(target.surface, camera)));
  const occluders = model.occluders.filter((object) => visible(object, camera));
  const raycaster = new THREE.Raycaster();
  raycaster.layers.mask = camera.layers.mask;
  function cast(px: number, py: number) {
    raycaster.setFromCamera(new THREE.Vector2(px / width * 2 - 1, 1 - py / height * 2), camera);
  }
  function opaqueHits(objects = occluders) {
    return raycaster.intersectObjects(objects, false).filter((hit) => {
      const material = materialAt(hit);
      return material?.visible && !material.transparent && material.opacity >= 1 && inClip(hit, camera);
    });
  }
  function exact() {
    const blocker = opaqueHits()[0];
    const hit = raycaster.intersectObjects(targets.map((target) => target.surface), false).find((candidate) => {
      const material = materialAt(candidate);
      return material?.visible && material.opacity > 0 && inClip(candidate, camera);
    });
    if (hit) {
      // A visible back of another target still blocks surfaces behind it.
      if (frontFacing(hit, raycaster.ray) && (!blocker || blocker.distance >= hit.distance - EPSILON)) return hit;
    }
    return undefined;
  }
  cast(x, y);
  const hit = exact();
  if (hit) return targets.find((target) => target.surface === hit.object)!.id;
  if (!expandTouch) return null;
  const inputRay = raycaster.ray.clone();
  // Selection eligibility and occlusion are separate: an opaque rendered back
  // of another target may cover the finger while leaving the sample ray clear.
  const inputBlocker = opaqueHits([...occluders, ...targets.map((target) => target.surface)])[0];
  const point = new THREE.Vector2(x, y);
  let nearest: ProjectId | null = null;
  let nearestDistance = Infinity;
  for (const id of PROJECT_IDS) {
    const target = targets.find((candidate) => candidate.id === id);
    if (!target) continue;
    const polygons = projectedTriangles(target.surface, camera, width, height);
    if (!polygons.length) continue;
    const bounds = new THREE.Box2().setFromPoints(polygons.flat());
    const center = bounds.getCenter(new THREE.Vector2());
    const size = bounds.getSize(new THREE.Vector2());
    if (Math.abs(x - center.x) > Math.max(size.x, MIN_TOUCH_TARGET) / 2 + EPSILON
      || Math.abs(y - center.y) > Math.max(size.y, MIN_TOUCH_TARGET) / 2 + EPSILON) continue;
    const distance = center.distanceToSquared(point);
    if (distance >= nearestDistance - EPSILON) continue;
    // A projected rectangle alone does not establish visibility. Require a
    // nearby point on the actual surface to win a fresh depth-tested ray.
    for (const polygon of polygons) {
      const sample = closestOnPolygon(point, polygon);
      cast(sample.x, sample.y);
      const visibleHit = exact();
      if (visibleHit?.object !== target.surface || !visibleHit.face) continue;
      if (inputBlocker) {
        const normal = visibleHit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(target.surface.matrixWorld));
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, visibleHit.point);
        const extended = inputRay.intersectPlane(plane, new THREE.Vector3());
        // Foreground at the user's actual finger cannot be bypassed by
        // finding an unobstructed sample just beside it.
        if (!extended || inputBlocker.distance < inputRay.origin.distanceTo(extended) + EPSILON) continue;
      }
      nearest = id;
      nearestDistance = distance;
      break;
    }
  }
  return nearest;
}
