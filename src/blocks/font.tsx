'use client'
import FontSelector, { type FontKey } from '@/components/FontSelector'
import type { ComponentDef } from './types'

export const fontBlock: ComponentDef<FontKey> = {
  key: 'font',
  defaultValue: 'rounded',
  FormItem({ value, onChange, t }) {
    return <FontSelector fontKey={value} setFontKey={onChange} t={t} />
  },
}
