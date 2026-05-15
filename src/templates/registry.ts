import type { CardTemplate } from '@/blocks/types'

// テンプレートのメタ情報
export type TemplateEntry = {
  id: string
  name: string
  description: string
  previewImage: string
  template: () => Promise<CardTemplate>
}

export const templateRegistry: TemplateEntry[] = [
  {
    id: 'v2',
    name: 'Glass Card',
    description: 'ガラスエフェクトのモダンなデザイン',
    previewImage: '/previews/v2.png',
    template: () => import('./v2').then(m => m.v2Template),
  },
  {
    id: 'v1',
    name: 'Standard',
    description: 'シンプルなスタンダードデザイン',
    previewImage: '/previews/v1.png',
    template: () => import('./v1').then(m => m.v1Template),
  },
]
