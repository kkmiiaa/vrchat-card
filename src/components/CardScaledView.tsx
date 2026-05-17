'use client'

import type { CardTemplate, BlockValues } from '@/blocks/types'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translation = Record<string, any>

type Props = {
  template: CardTemplate
  values: BlockValues
  scale: number
  fontFamily: string
  t: Translation
  isInteractive?: boolean
  noBackground?: boolean
  orientation?: 'landscape' | 'portrait'
  className?: string
  innerRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * カードを指定スケールでラップして表示するコンポーネント。
 * 以前は CardEditor 内に CardPreview として定義されていた 100 行の forwardRef を
 * template.CardRenderer 利用に統一してシンプル化。
 */
export default function CardScaledView({
  template,
  values,
  scale,
  fontFamily,
  t,
  isInteractive,
  noBackground,
  orientation,
  className,
  innerRef,
}: Props) {
  const W = orientation === 'portrait' ? (template.portraitWidth ?? template.cardWidth) : template.cardWidth
  const H = orientation === 'portrait' ? (template.portraitHeight ?? template.cardHeight) : template.cardHeight

  return (
    <div
      ref={innerRef}
      className={isInteractive ? className : `shadow-md ${className ?? ''}`}
      style={{ width: W * scale, height: H * scale, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <template.CardRenderer
          values={values}
          fontFamily={fontFamily}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          t={t as any}
          isInteractive={isInteractive}
          noBackground={noBackground}
          orientation={orientation}
        />
      </div>
    </div>
  )
}
