/**
 * Pro プラン判定ロジック（仕様書 Section 5）
 * plan === 'pro' かつ期限が未設定 or 期限が未来
 */
export function isPro(plan: string | null | undefined, planExpiresAt: string | null | undefined): boolean {
  if (plan !== 'pro') return false
  if (planExpiresAt == null) return true
  return new Date(planExpiresAt) > new Date()
}
