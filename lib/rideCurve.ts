import * as THREE from 'three'

// Returns a sampler that maps t in [0,1] to a point at approx-constant speed.
export function createConstantSpeedSampler(curve: THREE.Curve<THREE.Vector3>, segments = 400) {
  const lengths = curve.getLengths(segments)
  const total = lengths[lengths.length - 1]
  const lookup: number[] = []
  for (let i = 0; i <= segments; i++) lookup[i] = lengths[i] / total

  const tmp = new THREE.Vector3()
  return (t: number) => {
    // Use getPointAt which uses arc-length parameterization internally
    curve.getPointAt(Math.min(1, Math.max(0, t)), tmp)
    return tmp.clone()
  }
}

