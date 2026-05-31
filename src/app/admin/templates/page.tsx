import { fetchTemplateLayouts, fetchCommunities } from '@/lib/templateLayout'
import TemplateBuilderClient from './TemplateBuilderClient'

export default async function AdminTemplatesPage() {
  const [templateLayouts, communities] = await Promise.all([
    fetchTemplateLayouts(),
    fetchCommunities(),
  ])
  return (
    <TemplateBuilderClient
      savedLayouts={templateLayouts}
      communities={communities}
    />
  )
}
