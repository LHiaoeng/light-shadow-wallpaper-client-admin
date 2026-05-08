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
