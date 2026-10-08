import { ImageResponse } from 'next/og'

export const alt =
  'Owen Cheung — AI engineering & data science. Research-minded. Built to be useful.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 76px',
        background: '#F5F8F9',
        color: '#19232B',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #A9B9C0',
          paddingBottom: 24,
          fontSize: 22,
        }}
      >
        <span>OWEN CHEUNG</span>
        <span>AI ENGINEERING & DATA SCIENCE</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 80,
          lineHeight: 1.08,
          letterSpacing: -3,
        }}
      >
        <span style={{ color: '#976446' }}>Research-minded.</span>
        <span>Built to be useful.</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #A9B9C0',
          paddingTop: 24,
          fontSize: 22,
        }}
      >
        <span>Engineering · Research · Selected work</span>
        <span>University of Bath</span>
      </div>
    </div>,
    size
  )
}
