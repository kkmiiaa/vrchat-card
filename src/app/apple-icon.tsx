import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #00AADB, #00C9B8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: '-4px',
            fontFamily: 'sans-serif',
          }}
        >
          vc
        </span>
      </div>
    ),
    { ...size }
  )
}
