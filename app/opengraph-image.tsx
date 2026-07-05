import { ImageResponse } from 'next/og'
import { alpenglow } from '@/lib/theme'
import { site } from '@/lib/content'

export const alt = 'Owen Cheung — Applied AI · Snowboard Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: alpenglow.snow,
          background: `linear-gradient(135deg, ${alpenglow.peakGlow} 0%, ${alpenglow.valleyShadow} 45%, ${alpenglow.skyBase} 100%)`,
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 4, color: alpenglow.accentWarm, display: 'flex' }}>
          OWEN CHEUNG
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16, lineHeight: 1.05, display: 'flex' }}>
          {site.tagline}
        </div>
        <div style={{ fontSize: 30, marginTop: 24, opacity: 0.85, display: 'flex' }}>
          {site.sub}
        </div>
      </div>
    ),
    { ...size },
  )
}
