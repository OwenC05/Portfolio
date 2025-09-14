export type MountainTheme = {
  snow: string
  rockMid: string
  rockShadow: string
  fog: string
}

export type ThemeMode = 'light' | 'dark'

const darkTheme: MountainTheme = {
  snow: '#E6EEF6',
  rockMid: '#5E6672',
  rockShadow: '#3B414A',
  fog: '#0C1420',
}

const lightTheme: MountainTheme = {
  snow: '#F5FAFF',
  rockMid: '#6C7480',
  rockShadow: '#4A515A',
  fog: '#E8EEF6',
}

export function getMountainTheme(mode: ThemeMode = 'dark'): MountainTheme {
  return mode === 'light' ? lightTheme : darkTheme
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function tint(hex: string, amt: number) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0x00ff) + amt
  let b = (num & 0x0000ff) + amt
  r = clamp(r, 0, 255)
  g = clamp(g, 0, 255)
  b = clamp(b, 0, 255)
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
}

export function layerTheme(base: MountainTheme, layer: 'near' | 'mid' | 'far'): MountainTheme {
  if (layer === 'near') return base
  if (layer === 'mid') {
    return {
      snow: tint(base.snow, 8),
      rockMid: tint(base.rockMid, 10),
      rockShadow: tint(base.rockShadow, 8),
      fog: tint(base.fog, 10),
    }
  }
  // far
  return {
    snow: tint(base.snow, 16),
    rockMid: tint(base.rockMid, 18),
    rockShadow: tint(base.rockShadow, 14),
    fog: tint(base.fog, 16),
  }
}

