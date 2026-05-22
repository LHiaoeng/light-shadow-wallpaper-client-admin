import type { PageParam, PageResult } from '@/api/types'

export interface MythicShopQO {
  instanceId?: string
  catalog?: string
  categoryType?: string
  itemName?: string
}

export type MythicShopPageParam = MythicShopQO & PageParam

export interface MythicShopPageVO {
  id: number
  instanceId: string
  catalog: string
  categoryType: string
  itemName: string
  currencyName: string
  delta: number
  discountPercent: number
  discountedDelta: number
  finalDelta: number
  startTime: string
  endTime: string
  createTime: string
}

export type MythicShopPageResult = PageResult<MythicShopPageVO>

