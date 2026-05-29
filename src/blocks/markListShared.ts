import { translations } from '@/utils/translations'

export type MarkListItem = {
  label: string
  mark: string
  isCustom?: boolean
}

export type MarkDefinition = {
  symbol: string
  color: string
  bg: string
}

export const DEFAULT_MARKS: MarkDefinition[] = [
  { symbol: '◎', color: '#15803d', bg: 'rgba(220,252,231,0.6)' },
  { symbol: '◯', color: '#15803d', bg: 'rgba(220,252,231,0.6)' },
  { symbol: '△', color: '#92400e', bg: 'rgba(254,243,199,0.6)' },
  { symbol: '✗', color: '#b91c1c', bg: 'rgba(254,226,226,0.6)' },
]

export function getMarkDef(mark: string, marks: MarkDefinition[]): MarkDefinition | null {
  return marks.find(m => m.symbol === mark) ?? null
}

export const defaultItems = (): MarkListItem[] =>
  Object.keys(translations.ja.okNgDefaults).map(key => ({ label: key, mark: '-' }))

export function getMarkStyle(mark: string, marks: MarkDefinition[]) {
  const def = getMarkDef(mark, marks)
  if (def) return { bg: def.bg, text: def.color, border: def.color }
  return { bg: '#f9fafb', text: '#9ca3af', border: '#e5e7eb' }
}

export function itemLabel(item: MarkListItem): string {
  const t = translations.ja
  return item.isCustom ? item.label : (t.okNgDefaults[item.label as keyof typeof t.okNgDefaults] ?? item.label)
}
