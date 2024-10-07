import type { PageParam } from '@/api/types'

/**
 * 宇宙表
 */
export interface UniverseDTO {
  // 主键
  id: number
  // 英雄联盟宇宙id
  lolUniverseId: number
  // 属于该宇宙的英雄联盟皮肤系列id集合。用英文逗号分隔
  lolSkinlineIdSets: string
  // 名称
  name: string
  // 描述
  description: string
  // 图片地址
  imagePath: string
  // 所属品牌
  brand: number
  // 英文名称
  engName: string
  // 英文描述
  engDescription: string
}

export interface UniverseQO {
  // 主键
  id?: number
  // 英雄联盟宇宙id
  lolUniverseId?: number
  // 属于该宇宙的英雄联盟皮肤系列id集合。用英文逗号分隔
  lolSkinlineIdSets?: string
  // 名称
  name?: string
  // 描述
  description?: string
  // 图片地址
  imagePath?: string
  // 所属品牌
  brand?: number
  // 英文名称
  engName?: string
  // 英文描述
  engDescription?: string
}

/**
 * 宇宙表分页参数
 */
export type UniversePageParam = UniverseQO & PageParam

/**
 * 宇宙表分页视图对象
 */
export interface UniversePageVO extends UniverseDTO {
  // 创建时间
  createTime: string
  // 修改时间
  updateTime: string
}
