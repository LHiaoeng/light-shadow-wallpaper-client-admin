import type { PageParam } from '@/api/types'

export interface LolSkinDTO {
  id?: number
  riotSkinId?: number
  contentId?: string
  championId?: number
  isBase?: number
  name?: string
  nameEng?: string
  description?: string
  descriptionEng?: string
  skinType?: string
  regionRarityId?: number | string
  rarity?: string
  isLegacy?: number
  isLegacyGlobal?: number
  isPbeOnly?: number
  pbeFirstSeenTime?: string
  releaseTime?: string
  splashPath?: string
  uncenteredSplashPath?: string
  tilePath?: string
  loadScreenPath?: string
  loadScreenVintagePath?: string
  rarityGemPath?: string
  chromaPath?: string
  splashVideoPath?: string
  previewVideoUrl?: string
  collectionSplashVideoPath?: string
  collectionCardHoverVideoPath?: string
  skinlineIdSets?: string
  emblemNames?: string
  chromasJson?: string
  questSkinInfoJson?: string
  questSkinParentId?: number
  questSkinStage?: number
  questSkinShortName?: string
  championDataSourcePath?: string
  skinDataSourcePath?: string
}

export interface LolSkinQO {
  championId?: number
  riotSkinId?: number
  contentId?: string
  regionRarityId?: number | string
  rarity?: string
  keyword?: string
  emblemName?: string
  skinlineId?: string
  isLegacy?: number
  isLegacyGlobal?: number
  isPbeOnly?: number
  releaseTimeStart?: string
  releaseTimeEnd?: string
  pbeFirstSeenStart?: string
  pbeFirstSeenEnd?: string
}

export type LolSkinPageParam = LolSkinQO & PageParam

export interface LolSkinPageVO extends LolSkinDTO {
  id: number
  createTime: string
  updateTime: string
}
