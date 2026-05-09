type SaveCardParams = {
  canvasDataUrl: string
  cardData: Record<string, unknown>
  cardId?: string
  title?: string
}

export async function saveCardToProfile({
  canvasDataUrl,
  cardData,
  cardId,
  title = 'VRChat Card',
}: SaveCardParams): Promise<{ cardId: string; imageUrl: string } | { error: string }> {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: canvasDataUrl, cardData, cardId, title }),
  })

  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'unknown error' }
  return json
}
