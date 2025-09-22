export type MountainTheme = {
  snow: string
  rockMid: string
  rockShadow: string
  fog: string
}

export type ThemeMode = 'light' | 'dark'

const darkTheme: MountainTheme = {
  snow: '#E6EEF6',
  rockMid: '#43526A',
  rockShadow: '#5A6A84',
  fog: '#0D1724',
}

const lightTheme: MountainTheme = {
  snow: '#F5FAFF',
  rockMid: '#7586A3',
  rockShadow: '#9BAAC2',
  fog: '#E6EDF6',
}

function readVar(styles: CSSStyleDeclaration | null, name: string, fallback: string) {
  if (!styles) return fallback
  const value = styles.getPropertyValue(name)
  return value ? value.trim() || fallback : fallback
}

export function getMountainTheme(mode: ThemeMode = 'dark'): MountainTheme {
  const fallback = mode === 'light' ? lightTheme : darkTheme
  if (typeof window === 'undefined') {
    return fallback
  }
  const styles = getComputedStyle(document.documentElement)
  return {
    snow: readVar(styles, '--snow', fallback.snow),
    rockMid: readVar(styles, '--terrainNear', fallback.rockMid),
    rockShadow: readVar(styles, '--terrainFar', fallback.rockShadow),
    fog: readVar(styles, '--fog', fallback.fog),
  }
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
  return {
    snow: tint(base.snow, 16),
    rockMid: tint(base.rockMid, 18),
    rockShadow: tint(base.rockShadow, 14),
    fog: tint(base.fog, 16),
  }
}
