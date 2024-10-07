import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { WallpaperUrlDTO, WallpaperUrlQO } from './types'

/**
 * 壁纸分页查询
 * @param wallpaperUrlQO
 */
export function getWallpaperUrlList(wallpaperUrlQO: WallpaperUrlQO) {
  return httpClient.get<ApiResult<WallpaperUrlDTO[]>>('/wallpaper/wallpaperUrl/list', {
    params: wallpaperUrlQO
  })
}

/**
 * 创建壁纸
 * @param dto
 */
export function createWallpaperUrl(dto: WallpaperUrlDTO) {
  return httpClient.post<ApiResult<WallpaperUrlDTO>>('/wallpaper/wallpaperUrl', dto)
}

/**
 * 修改壁纸
 * @param dto
 */
export function updateWallpaperUrl(dto: WallpaperUrlDTO) {
  return httpClient.put<ApiResult<void>>('/wallpaper/wallpaperUrl', dto)
}

/**
 * 删除壁纸
 * @param id 主键ID
 */
export function deleteWallpaperUrl(id: number) {
  return httpClient.delete<ApiResult<void>>(`/wallpaper/wallpaperUrl/` + id)
}

/**
 * 设置壁纸地址
 * @param dto
 */
export function setWallpaper(dto: WallpaperUrlDTO) {
  return httpClient.put<ApiResult<void>>('/wallpaper/wallpaperUrl/setWallpaperUrl', dto)
}
