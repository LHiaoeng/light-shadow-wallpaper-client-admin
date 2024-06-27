import type { PageParam } from '@/api/types'

/**
 * 英雄联盟皮肤系列
 */
export interface SkinlineDTO {
  //
  id: number
  // 拳头皮肤系列编号
  riotSkinlineId: number
  // 皮肤系列名称
  name: string
  // 皮肤系列描述
  description: string
  // 皮肤系列英文名称
  engName: string
  // 皮肤系列英文描述
  engDescription: string
}

export interface SkinlineQO {
  // 拳头皮肤系列编号
  riotSkinlineId?: number
  // 关键词
  keyword?: string
}

/**
 * 英雄联盟皮肤系列分页参数
 */
export type SkinlinePageParam = SkinlineQO & PageParam

/**
 * 英雄联盟皮肤系列分页视图对象
 */
export interface SkinlinePageVO extends SkinlineDTO {
  // 创建时间
  createTime: string
  // 修改时间
  updateTime: string
}
