import type { BlockValues } from '@/blocks/types'

/**
 * V2 旧フォーマット（CardTemplate / CardV2 ベース）→ 新フォーマット（TemplateDefinition ベース）の変換
 *
 * 旧 → 新 の対応:
 *   sns.vrchatId     → sns-with-friend-policy1.id
 *   sns.twitterId    → x
 *   sns.discordId    → discord
 *   sns.friendPolicy → sns-with-friend-policy1.friendPolicy
 *   micOnRate        → gauge1
 *   gender: string   → gender: { tag, display: '' }
 *   language: string[] → language: { preset, custom: [] }
 */
function migrateV2CardData(raw: Record<string, unknown>): BlockValues {
  const result: Record<string, unknown> = { ...raw }

  // SNS の変換（sns オブジェクトがある場合のみ）
  if (raw.sns && typeof raw.sns === 'object') {
    const sns = raw.sns as Record<string, string>

    if (!result.x)       result.x       = sns.twitterId   ?? ''
    if (!result.discord) result.discord = sns.discordId   ?? ''

    if (!result['sns-with-friend-policy1']) {
      result['sns-with-friend-policy1'] = {
        id:           sns.vrchatId    ?? '',
        friendPolicy: sns.friendPolicy ?? '',
      }
    }

    delete result.sns
  }

  // micOnRate → gauge1
  if (result.micOnRate !== undefined && result.gauge1 === undefined) {
    result.gauge1 = result.micOnRate
    delete result.micOnRate
  }

  // gender: string → { tag, display }
  if (typeof result.gender === 'string') {
    result.gender = { tag: result.gender as string, display: '' }
  }

  // language: string[] → { preset, custom }
  if (Array.isArray(result.language)) {
    result.language = { preset: result.language as string[], custom: [] }
  }

  return result as BlockValues
}

/**
 * V1 旧メーカー（/card/vrchat）の localStorage フォーマット → 新フォーマット（TemplateDefinition ベース）の変換
 *
 * 旧 → 新 の対応:
 *   sns.vrchatId     → vrchat
 *   sns.twitterId    → x
 *   sns.discordId    → discord
 *   sns.friendPolicy → friendPolicy（string）
 *   gender: string   → gender: { tag, display: '' }
 *   language: string[] → language: { preset, custom: [] }
 *   age.mode         → age.searchTag
 */
function migrateV1CardData(raw: Record<string, unknown>): BlockValues {
  const result: Record<string, unknown> = { ...raw }

  // SNS の変換（sns オブジェクトがある場合のみ）
  if (raw.sns && typeof raw.sns === 'object') {
    const sns = raw.sns as Record<string, string>

    if (!result.vrchat)      result.vrchat      = sns.vrchatId    ?? ''
    if (!result.x)           result.x           = sns.twitterId   ?? ''
    if (!result.discord)     result.discord     = sns.discordId   ?? ''
    if (!result.friendPolicy) result.friendPolicy = sns.friendPolicy ?? ''

    delete result.sns
  }

  // gender: string → { tag, display }
  if (typeof result.gender === 'string') {
    result.gender = { tag: result.gender as string, display: '' }
  }

  // language: string[] → { preset, custom }
  if (Array.isArray(result.language)) {
    result.language = { preset: result.language as string[], custom: [] }
  }

  // age.mode → age.searchTag
  if (result.age && typeof result.age === 'object') {
    const age = result.age as Record<string, unknown>
    if (age.mode !== undefined && age.searchTag === undefined) {
      result.age = { ...age, searchTag: age.mode }
      delete (result.age as Record<string, unknown>).mode
    }
  }

  return result as BlockValues
}

/**
 * template_id に応じて旧フォーマットのカードデータを新フォーマットに変換する。
 * すでに新フォーマットの場合は何もしない。
 */
export function migrateLegacyCardData(
  templateId: string,
  cardData: Record<string, unknown>,
): BlockValues {
  if (templateId === 'vrchat-simple' || templateId === 'v1') {
    const isLegacy =
      cardData.sns !== undefined ||
      typeof cardData.gender === 'string' ||
      Array.isArray(cardData.language) ||
      (cardData.age && typeof (cardData.age as Record<string, unknown>).mode === 'string')
    if (isLegacy) {
      return migrateV1CardData(cardData)
    }
  }

  if (templateId === 'vrchat-glass' || templateId === 'v2') {
    const isLegacy =
      cardData.sns !== undefined ||
      cardData.micOnRate !== undefined ||
      typeof cardData.gender === 'string' ||
      Array.isArray(cardData.language)
    if (isLegacy) {
      return migrateV2CardData(cardData)
    }
  }
  return cardData as BlockValues
}
