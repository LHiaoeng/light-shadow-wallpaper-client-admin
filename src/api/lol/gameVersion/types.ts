import type { PageParam } from '@/api/types'

export interface GameVersionDTO {
  id?: number
  gameVer: string
  cnPatchUrl: string
  globalPatchUrl: string
}

export interface GameVersionQO {
  gameVer?: string
}

export type GameVersionPageParam = GameVersionQO & PageParam

export interface GameVersionPageVO extends GameVersionDTO {
  id: number
  createTime?: string
  updateTime?: string
}
