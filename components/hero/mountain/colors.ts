export type Theme = 'light' | 'dark'

export type RidgeColors = {
  snow: string
  rock: string
  fog: string
}

export type MountainTokens = {
  near: RidgeColors
  mid: RidgeColors
  far: RidgeColors
}

const darkBase = {
  snow: '#E6EEF6',
  rock: '#5F6772',
  fog: '#0D1724',
}

const lightBase = {
  snow: '#F4F8FC',
  rock: '#6F7782',
  fog: '#DDE6F2',
}

function lighten(hex: string, amt: number) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0x00ff) + amt
  let b = (num & 0x0000ff) + amt
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
}

export function mountainTokens(theme: Theme = 'dark'): MountainTokens {
  const base = theme === 'light' ? lightBase : darkBase

  return {
    near: {
      snow: base.snow,
      rock: base.rock,
      fog: base.fog,
    },
    mid: {
      snow: lighten(base.snow, theme === 'light' ? -6 : 8),
      rock: lighten(base.rock, theme === 'light' ? 6 : 10),
      fog: theme === 'light' ? lighten(base.fog, -10) : lighten(base.fog, 8),
    },
    far: {
      snow: lighten(base.snow, theme === 'light' ? -14 : 16),
      rock: lighten(base.rock, theme === 'light' ? 12 : 18),
      fog: theme === 'light' ? lighten(base.fog, -18) : lighten(base.fog, 14),
    },
  }
}

