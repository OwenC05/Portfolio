import type { StudioViewConfiguration } from './types';

/**
 * Art-owned framing for the enclosed studio. Heading zero faces -Z, positive yaw
 * looks right (+X), positive pitch looks up; angles are degrees. The eye never
 * translates, so every occlusion relationship in the room is authored for this point.
 * Rationale and sightline arithmetic: design/studio-v2/scene-art-direction.md.
 */
export const STUDIO_VIEW: StudioViewConfiguration = {
  // About 1.35 m above the floor at two units per metre, one metre back from the desk edge.
  eye: [-0.7, 2.8, 3.4],
  desktopFov: 58,
  mobileFov: 64,
  desktopHome: { yaw: -4, pitch: -6 },
  mobileHome: { yaw: -13, pitch: -8 },
  yawBounds: [-38, 58],
  pitchBounds: [-16, 12],
  near: 0.1,
  far: 30,
};
