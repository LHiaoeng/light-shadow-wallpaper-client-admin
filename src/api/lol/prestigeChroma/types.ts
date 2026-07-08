import type { PageParam } from '@/api/types'

export interface PrestigeChromaDTO {
  id?: number
  heroId?: number
  heroName?: string
  heroNameEng?: string
  gameVer?: string
  skinId?: number
  instanceId?: string
  itemName?: string
  itemNameEng?: string
  sourceSkinId?: number
  sourceSkinInstanceId?: string
  sourceSkinName?: string
  sourceSkinNameEng?: string
  sourceSkinSkinlineIdSet?: string
  sourceSkinUniverseIdSet?: string
  itemMark?: number
  categoryId?: string
  categoryName?: string
  tagId?: string
  tagImgUrl?: string
  seriesId?: string
  displayType?: number
  itemScore?: number
  displayImage?: number
  jumpUrl?: string
  imageAnimate?: number
  rank?: number
  startTime?: string
  endTime?: string
  startDate?: string
  isNew?: number
}

export interface PrestigeChromaBatchUpdateDTO {
  ids: number[]
  gameVer: string
  isNew: number
}

export interface PrestigeChromaQO {
  gameVer?: string
  heroId?: number
  skinId?: number
  instanceId?: string
  sourceSkinId?: number
  sourceSkinlineId?: string
  sourceUniverseId?: string
  categoryId?: string
  tagId?: string
  isNew?: number
  keyword?: string
}

export type PrestigeChromaPageParam = PrestigeChromaQO & PageParam

export interface PrestigeChromaPageVO extends PrestigeChromaDTO {
  id: number
  createTime?: string
  updateTime?: string
}
