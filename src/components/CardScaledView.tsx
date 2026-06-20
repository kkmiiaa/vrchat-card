'use client'

import type { CardTemplate, BlockValues, BackgroundValue } from '@/blocks/types'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translation = Record<string, any>

type Props = {
  template: CardTemplate
  values: BlockValues
  background?: BackgroundValue | null
  scale: number
  fontFamily: string
  t: Translation
  isInteractive?: boolean
  transparentBackground?: boolean
  orientation?: 'card' | 'web'
  className?: string
  innerRef?: React.RefObject<HTMLDivElement | null>
  cardUrl?: string
  userUrl?: string
}

/**
 * カードを指定スケールでラップして表示するコンポーネント。
 * 以前は CardEditor 内に CardPreview として定義されていた 100 行の forwardRef を
 * template.CardRenderer 利用に統一してシンプル化。
 */
export default function CardScaledView({
  template,
  values,
  background,
  scale,
  fontFamily,
  t,
  isInteractive,
  transparentBackground,
  orientation,
  className,
  innerRef,
  cardUrl,
  userUrl,
}: Props) {
  const W = orientation === 'web' ? (template.webWidth ?? template.cardWidth) : template.cardWidth
  const H = orientation === 'web' ? (template.webHeight ?? template.cardHeight) : template.cardHeight

  return (
    <div
      ref={innerRef}
      className={isInteractive ? className : `shadow-md ${className ?? ''}`}
      style={{ width: W * scale, height: H * scale, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <template.CardRenderer
          values={values}
          background={background ?? undefined}
          fontFamily={fontFamily}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          t={t as any}
          isInteractive={isInteractive}
          transparentBackground={transparentBackground}
          orientation={orientation}
          cardUrl={cardUrl}
          userUrl={userUrl}
        />
      </div>
    </div>
  )
}
