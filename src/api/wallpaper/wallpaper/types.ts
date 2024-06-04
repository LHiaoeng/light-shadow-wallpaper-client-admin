import type { PageParam } from '@/api/types'

/**
 * 壁纸
 */
export interface WallpaperDTO {
  // 主键id
  id: number
  // 壁纸类型。1：图片；2：视频
  type: number
  // 壁纸标题
  title: string
  // 标题链接
  titleLink: string
  // 壁纸网址
  url: string
  // 壁纸默认地址
  urlBase: string
  // 预览海报
  poster: string
  // 版权信息
  copyright: string
  // 版权信息链接
  copyrightLink: string
  // 壁纸描述
  description: string
  // 壁纸来源(0-默认未知,1-英雄联盟,2-必应)
  source: number
  // 上架时间
  launchTime: string
  // 壁纸状态(0-启用，1-停用)
  status: number
  // 必应壁纸所属地区
  bingCountry: ''
}

export interface WallpaperQO {
  // 壁纸标题
  title?: string
  // 壁纸类型。1：图片；2：视频
  type?: number
  // 壁纸网址
  url?: string
  // 壁纸来源(0-默认未知,1-英雄联盟,2-必应)
  source?: number
  // 状态(0-启用，1-停用)
  status?: number
  // 上架时间起
  launchTimeStart?: string
  // 上架时间止
  launchTimeEnd?: string
  // 修改时间
  hasMainUrl?: string
  // 必应壁纸所属地区
  bingCountry?: string
  // 必应壁纸ID
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
  // 创建时间
  createTime: string
  // 修改时间
  updateTime: string
}
