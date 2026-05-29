import { cardV1Definition } from '@/templates/v1Definition'
import { cardV2Definition } from '@/templates/v2Definition'
import { fetchTemplateLayouts, fetchCommunities } from '@/lib/templateLayout'
import type { TemplateDefinition } from '@/blocks/types'
import TemplateBuilderClient from './TemplateBuilderClient'

const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  cardV2Definition,
  cardV1Definition,
]

export default async function AdminTemplatesPage() {
  const [templateLayouts, communities] = await Promise.all([
    fetchTemplateLayouts(),
    fetchCommunities(),
  ])
  return (
    <TemplateBuilderClient
      definitions={TEMPLATE_DEFINITIONS}
      savedLayouts={templateLayouts}
      communities={communities}
    />
  )
}
