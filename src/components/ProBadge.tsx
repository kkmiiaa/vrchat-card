import { PiStarFill } from 'react-icons/pi'

type Props = {
  size?: number
}

export default function ProBadge({ size = 16 }: Props) {
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
        background: 'linear-gradient(135deg, #FCD34D, #FBBF24)',
        flexShrink: 0,
        verticalAlign: 'middle',
        position: 'relative',
        top: '-1px',
      }}
    >
      <PiStarFill size={size * 0.58} color="white" />
    </span>
  )
}
