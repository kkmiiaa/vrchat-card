import { fetchCommunities } from '@/lib/templateLayout'
import CommunitiesClient from './CommunitiesClient'

export default async function AdminCommunitiesPage() {
  const communities = await fetchCommunities()
  return <CommunitiesClient initialCommunities={communities} />
}
