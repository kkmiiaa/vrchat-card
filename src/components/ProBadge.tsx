import { PiStarFourFill } from 'react-icons/pi'

type Props = {
  size?: number
}

export default function ProBadge({ size = 20 }: Props) {
  return (
    <span
      title="Pro プラン"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        flexShrink: 0,
      }}
    >
      <PiStarFourFill size={size * 0.55} color="white" />
    </span>
  )
}
