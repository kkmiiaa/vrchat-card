export type ComponentCategory = 'primitive' | 'complex' | 'sns' | 'global' | 'utility'

export const COMPONENT_CATEGORIES: { key: ComponentCategory; label: string }[] = [
  { key: 'primitive', label: 'Primitive' },
  { key: 'complex',   label: 'Complex' },
  { key: 'sns',       label: 'SNS' },
  { key: 'global',    label: 'Global' },
  { key: 'utility',   label: 'Utility' },
]

export const COMPONENT_NAMES: { name: string; category: ComponentCategory }[] = [
  { name: 'text',                   category: 'primitive' },
  { name: 'select',                 category: 'primitive' },
  { name: 'multi-select',           category: 'primitive' },
  { name: 'expressive-select',      category: 'primitive' },
  { name: 'gauge',                  category: 'primitive' },
  { name: 'badge',                  category: 'primitive' },
  { name: 'boolean',                category: 'primitive' },
  { name: 'rating',                 category: 'primitive' },
  { name: 'link',                   category: 'primitive' },
  { name: 'date',                   category: 'primitive' },
  { name: 'divider',                category: 'primitive' },
  { name: 'mark-list',              category: 'complex' },
  { name: 'mark-grid',              category: 'complex' },
  { name: 'weekly-activity',        category: 'complex' },
  { name: 'tag-list',               category: 'complex' },
  { name: 'color-palette',          category: 'complex' },
  { name: 'color-status',           category: 'complex' },
  { name: 'gallery',                category: 'complex' },
  { name: 'simple-sns',             category: 'sns' },
  { name: 'sns-with-friend-policy', category: 'sns' },
  { name: 'profile-image',          category: 'global' },
  { name: 'gender',                 category: 'global' },
  { name: 'language',               category: 'global' },
  { name: 'age',                    category: 'global' },
  { name: 'qr-code',                category: 'utility' },
]
