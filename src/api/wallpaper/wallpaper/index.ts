import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { WallpaperDTO, WallpaperPageParam, WallpaperPageVO } from './types'

/**
 * 壁纸分页查询
 * @param pageParams 分页参数
 */
export function pageWallpaper(pageParams: WallpaperPageParam) {
  return httpClient.get<ApiResult<WallpaperPageVO>>('/wallpaper/wallpaper/page', {
    params: pageParams
  })
}

/**
 * 创建壁纸
 * @param dto
 */
export function createWallpaper(dto: WallpaperDTO) {
  return httpClient.post<ApiResult<void>>('/wallpaper/wallpaper', dto)
}

/**
 * 修改壁纸
 * @param dto
 */
export function updateWallpaper(dto: WallpaperDTO) {
  return httpClient.put<ApiResult<void>>('/wallpaper/wallpaper', dto)
}

/**
 * 删除壁纸
 * @param id 主键ID
 */
export function deleteWallpaper(id: number) {
  return httpClient.delete<ApiResult<void>>(`/wallpaper/wallpaper/` + id)
}

export function copyWallpaper(id: number) {
  return httpClient.post<ApiResult<WallpaperDTO>>(`/wallpaper/wallpaper/copy/` + id)
}
