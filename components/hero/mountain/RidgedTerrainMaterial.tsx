import { memo, useMemo } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]

export type RidgedMaterialProps = {
  uScaleX?: number
  uScaleZ?: number
  uAmp?: number
  uTerraceSteps?: number
  uSeed?: number
  uTime?: number
  uWind?: number
  uLightDir?: Vec3
  uSnow?: string
  uRockMid?: string
  uRockShadow?: string
  uFog?: string
  uFogNear?: number
  uFogFar?: number
  uFogStrength?: number
}

const VERT = /* glsl */`
  precision highp float;
  uniform float uScaleX; uniform float uScaleZ; uniform float uAmp; uniform float uTerraceSteps; uniform float uSeed; uniform float uTime; uniform float uWind;
  varying vec3 vWorldPos;
  varying float vHeight;
  // 2D hash & value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float ridged(float n){
    n = 2.0*n - 1.0; // to -1..1
    n = 1.0 - abs(n);
    return n*n; // sharper peaks
  }
  float fbmRidged(vec2 p){
    float sum = 0.0; float amp = 0.5; float freq = 1.0; 
    for(int i=0;i<5;i++){
      float n = ridged(noise(p*freq + uSeed*0.123));
      sum += amp * n;
      freq *= 2.0; amp *= 0.5;
    }
    return clamp(sum, 0.0, 1.0);
  }
  float terrace(float h, float steps){
    if(steps <= 0.5) return h;
    float t = floor(h*steps)/steps;
    // soften the step slightly to avoid banding
    return mix(t, h, 0.25);
  }
  void main(){
    vec3 pos = position;
    float baseY = pos.y;
    vec2 p = vec2(pos.x * uScaleX, baseY * uScaleZ + uTime * uWind);
    float h = fbmRidged(p);
    float ht = terrace(h, uTerraceSteps);
    pos.y = baseY + ht * uAmp;
    vHeight = ht;
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uSnow; uniform vec3 uRockMid; uniform vec3 uRockShadow; uniform vec3 uFog;
  uniform vec3 uLightDir;
  uniform float uFogNear; uniform float uFogFar; uniform float uFogStrength;
  varying vec3 vWorldPos; varying float vHeight;
  void main(){
    // Flat-like normal via derivatives
    vec3 dx = dFdx(vWorldPos); vec3 dy = dFdy(vWorldPos);
    vec3 N = normalize(cross(dx, dy));
    if(!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotL = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    // Base rock shading between shadow/mid by lighting
    vec3 rock = mix(uRockShadow, uRockMid, 0.35 + 0.65 * NdotL);

    // Snow mask: higher elevation + gentle slopes
    float slope = 1.0 - abs(N.y); // 0=flat up, 1=vertical
    float snowByHeight = smoothstep(0.45, 0.78, vHeight);
    float snowBySlope = 1.0 - smoothstep(0.22, 0.55, slope);
    float snowMask = clamp(snowByHeight * snowBySlope, 0.0, 1.0);

    vec3 col = mix(rock, uSnow, snowMask);
    col += uSnow * fres * 0.06; // very subtle rim on snow/edges

    // Fog by distance
    float dist = distance(cameraPosition, vWorldPos);
    float fogF = smoothstep(uFogNear, uFogFar, dist) * uFogStrength;
    col = mix(col, uFog, fogF);

    gl_FragColor = vec4(col, 1.0);
  }
`

export default memo(function RidgedTerrainMaterial({
  uScaleX = 0.015,
  uScaleZ = 0.04,
  uAmp = 22,
  uTerraceSteps = 8,
  uSeed = 42,
  uTime = 0,
  uWind = 0.03,
  uLightDir = [-0.45, 0.78, 0.43],
  uSnow = '#E6EEF6',
  uRockMid = '#5E6672',
  uRockShadow = '#3B414A',
  uFog = '#0C1420',
  uFogNear = 10,
  uFogFar = 70,
  uFogStrength = 1.0,
}: RidgedMaterialProps) {
  const uniforms = useMemo(() => ({
    uScaleX: { value: uScaleX },
    uScaleZ: { value: uScaleZ },
    uAmp: { value: uAmp },
    uTerraceSteps: { value: uTerraceSteps },
    uSeed: { value: uSeed },
    uTime: { value: uTime },
    uWind: { value: uWind },
    uLightDir: { value: new THREE.Vector3(...uLightDir) },
    uSnow: { value: new THREE.Color(uSnow).convertSRGBToLinear() },
    uRockMid: { value: new THREE.Color(uRockMid).convertSRGBToLinear() },
    uRockShadow: { value: new THREE.Color(uRockShadow).convertSRGBToLinear() },
    uFog: { value: new THREE.Color(uFog).convertSRGBToLinear() },
    uFogNear: { value: uFogNear },
    uFogFar: { value: uFogFar },
    uFogStrength: { value: uFogStrength },
  }), [])

  // Update uniforms on prop change
  uniforms.uScaleX.value = uScaleX
  uniforms.uScaleZ.value = uScaleZ
  uniforms.uAmp.value = uAmp
  uniforms.uTerraceSteps.value = uTerraceSteps
  uniforms.uSeed.value = uSeed
  uniforms.uTime.value = uTime
  uniforms.uWind.value = uWind
  uniforms.uLightDir.value.set(...uLightDir)
  uniforms.uSnow.value.set(uSnow).convertSRGBToLinear()
  uniforms.uRockMid.value.set(uRockMid).convertSRGBToLinear()
  uniforms.uRockShadow.value.set(uRockShadow).convertSRGBToLinear()
  uniforms.uFog.value.set(uFog).convertSRGBToLinear()
  uniforms.uFogNear.value = uFogNear
  uniforms.uFogFar.value = uFogFar
  uniforms.uFogStrength.value = uFogStrength

  return (
    <shaderMaterial
      key="ridged-terrain-material"
      vertexShader={VERT}
      fragmentShader={FRAG}
      uniforms={uniforms as any}
      extensions={{ derivatives: true } as any}
      side={THREE.DoubleSide}
      transparent={false}
      depthWrite={true}
    />
  )
})

