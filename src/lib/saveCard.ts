type CreateCardParams = {
  templateId: string
  cardData?: Record<string, unknown>
  title?: string
  visibility?: 'public' | 'limited' | 'private'
  communities?: string[]
  communitySlug?: string
}

type UpdateCardParams = {
  cardId: string
  cardData?: Record<string, unknown>
  imageBase64?: string
  title?: string
  visibility?: 'public' | 'limited' | 'private'
  communities?: string[]
}

type SaveResult = { cardId: string } | { error: string }
type UpdateResult = { ok: true } | { error: string }
type DeleteResult = { ok: true } | { error: string }

export async function createCard(params: CreateCardParams): Promise<SaveResult> {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'unknown error' }
  return json
}

export async function deleteCard(cardId: string): Promise<DeleteResult> {
  const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'unknown error' }
  return json
}

export async function updateCard(params: UpdateCardParams): Promise<UpdateResult> {
  const { cardId, ...rest } = params
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  })
  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'unknown error' }
  return json
}
