import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #00AADB, #00C9B8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: '-1px',
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
