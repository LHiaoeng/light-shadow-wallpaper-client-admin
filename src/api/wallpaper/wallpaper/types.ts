import type { PageParam } from '@/api/types'

/**
 * 壁纸
 */
export interface WallpaperDTO {
  id?: number
  // 1: 图片; 2: 视频
  type?: number
  title?: string
  titleLink?: string
  url?: string
  urlBase?: string
  poster?: string
  urlBackup?: string
  posterBackup?: string
  copyright?: string
  copyrightLink?: string
  description?: string
  // 0: 未知; 1: 英雄联盟; 2: 必应
  source?: number
  launchTime?: string
  // 0: 启用; 1: 停用
  status?: number
  bingCountry?: string
}

export interface WallpaperQO {
  title?: string
  type?: number
  url?: string
  source?: number
  status?: number
  launchTimeStart?: string
  launchTimeEnd?: string
  hasMainUrl?: number
  bingCountry?: string
  urlBase?: string
}

/**
 * 壁纸分页参数
 */
export type WallpaperPageParam = WallpaperQO & PageParam

/**
 * 壁纸分页视图对象
 */
export interface WallpaperPageVO extends WallpaperDTO {
  createTime?: string
  updateTime?: string
}

/**
 * 支持批量清空的壁纸字段
 */
export type WallpaperClearableField = 'titleLink' | 'launchTime'

/**
 * 壁纸批量修改字段参数，未填值且未勾选清空的字段不参与更新
 */
export interface WallpaperBatchUpdateDTO {
  /** 选中的壁纸id集合 */
  ids: number[]
  /** 标题链接，不传表示不修改 */
  titleLink?: string
  /** 上线时间，格式 YYYY-MM-DD，不传表示不修改 */
  launchTime?: string
  /** 需要置空的字段，不传表示不清空任何字段 */
  clearFields?: WallpaperClearableField[]
}
