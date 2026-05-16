'use client'
import FontSelector, { type FontKey } from '@/components/FontSelector'
import type { Block } from './types'

export const fontBlock: Block<FontKey> = {
  key: 'font',
  defaultValue: 'rounded',
  FormItem({ value, onChange, t }) {
    return <FontSelector fontKey={value} setFontKey={onChange} t={t} />
  },
}
