import type { Block } from './types'
import { genderTagBlock } from './gender'
import { playEnvBlock } from './playEnv'
import { languageBlock } from './language'
import { friendPolicyMultiBlock } from './friendPolicyMulti'
import { selfIntroBlock } from './selfIntro'
import { micOnRateBlock } from './micOnRate'
import { ageBlock } from './age'
import { trustRankBlock } from './trustRank'
import { statusBlock } from './status'
import { snsBlock } from './sns'
import { activityBlock } from './activity'
import { interactionsBlock } from './interactions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_REGISTRY: Record<string, Block<any>> = {
  [genderTagBlock.key]:         genderTagBlock,
  [playEnvBlock.key]:           playEnvBlock,
  [languageBlock.key]:          languageBlock,
  [friendPolicyMultiBlock.key]: friendPolicyMultiBlock,
  [selfIntroBlock.key]:         selfIntroBlock,
  [micOnRateBlock.key]:         micOnRateBlock,
  [ageBlock.key]:               ageBlock,
  [trustRankBlock.key]:         trustRankBlock,
  [statusBlock.key]:            statusBlock,
  [snsBlock.key]:               snsBlock,
  [activityBlock.key]:          activityBlock,
  [interactionsBlock.key]:      interactionsBlock,
}

export function getBlock(blockKey: string): Block<unknown> | undefined {
  return BLOCK_REGISTRY[blockKey]
}
