import * as THREE from 'three'

// Shared, mutable per-frame player state. Written by <Player/>, read by
// <CarveTrail/> and <Stations/>. A module singleton keeps the hot path out of
// React entirely — no props, no re-renders.
export const playerState = {
  d: 0, // distance down the slope
  x: 0, // lateral position
  vx: 0, // lateral velocity
  speed: 0,
  yaw: 0,
  roll: 0,
  riding: false,
  pos: new THREE.Vector3(), // rider centre (camera target)
  contact: new THREE.Vector3(), // board–snow contact (carve-trail anchor)
}

export type PlayerStateRef = typeof playerState
