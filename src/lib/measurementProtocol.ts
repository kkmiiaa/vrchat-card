const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-XMHKGYVDJW'
const GA_API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_SECRET ?? ''

export async function sendServerEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  clientId = 'server'
): Promise<void> {
  if (!GA_API_SECRET) return

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: eventName, params }],
        }),
      }
    )
  } catch {
    // 計測失敗はサイレントに無視
  }
}
