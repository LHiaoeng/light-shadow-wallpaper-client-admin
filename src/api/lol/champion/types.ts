import type { PageParam } from '@/api/types'

/**
 * 英雄联盟英雄
 */
export interface ChampionDTO {
  // 主键
  id: number
  // 英雄联盟英雄识别id
  heroId: number
  // 英雄联盟英雄实例id
  instanceId: string
  // 英雄名称
  name: string
  // 英雄英文名称
  nameEng: string
  // 英雄称号
  title: string
  // 英雄英文称号
  titleEng: string
  // 别称
  alias: string
  // 英雄选取语言
  selectAudio: string
  // 英雄被ban语音
  banAudio: string
  // 英雄定位。例如：mage,support
  roles: string
  // 英雄游戏商场售价
  goldPrice: string
  // 英雄搜索关键词
  keywords: string
  // 方形肖像图片地址
  squarePortraitPath: string
  // 简介
  description: string
  // 英雄英文简介
  descriptionEng: string
  // 上线时间
  launchTime: string
}

export interface ChampionQO {
  // 英雄联盟英雄识别id
  heroId?: number
  // 英雄定位
  role?: string
  // 英雄搜索关键词
  keyword?: string
}

/**
 * 英雄联盟英雄分页参数
 */
export type ChampionPageParam = ChampionQO & PageParam

/**
 * 英雄联盟英雄分页视图对象
 */
export interface ChampionPageVO extends ChampionDTO {
  // 创建时间
  createTime: string
  // 修改时间
  updateTime: string
}
