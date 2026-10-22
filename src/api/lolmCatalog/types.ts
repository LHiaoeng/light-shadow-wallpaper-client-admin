import type { PageParam, PageResult } from '@/api/types'

export interface LolmHero {
  id?: number
  heroId?: string
  name?: string
  title?: string
  roles?: string
  lane?: string
  intro?: string
  avatar?: string
  card?: string
  poster?: string
  manualMaintained?: number
  deleted?: number
  createTime?: string
  updateTime?: string
}

export interface LolmSkin {
  id?: number
  skinId?: string
  heroId?: string
  name?: string
  briefIntro?: string
  quality?: string
  couponPrice?: string
  sortWeight?: string
  headIconPic?: string
  card?: string
  poster?: string
  manualMaintained?: number
  deleted?: number
  createTime?: string
  updateTime?: string
}

export interface LolmHeroQuery {
  heroId?: string
  name?: string
  title?: string
  roles?: string
  lane?: string
  manualMaintained?: number
  deleted?: number
}

export interface LolmSkinQuery {
  skinId?: string
  heroId?: string
  name?: string
  quality?: string
  manualMaintained?: number
  deleted?: number
}

export type LolmHeroPageParam = LolmHeroQuery & PageParam
export type LolmSkinPageParam = LolmSkinQuery & PageParam
export type LolmHeroPage = PageResult<LolmHero>
export type LolmSkinPage = PageResult<LolmSkin>
