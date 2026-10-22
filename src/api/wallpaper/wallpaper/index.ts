import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { WallpaperBatchUpdateDTO, WallpaperDTO, WallpaperPageParam, WallpaperPageVO } from './types'
import type { OssFileInfo } from '@/api/oss/types'

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

export function uploadWallpaper(formData: FormData) {
  return httpClient.post<ApiResult<OssFileInfo>>('/wallpaper/wallpaper/uploadWallpaper', formData)
}

export function backupWallpaper(id: number, force = false) {
  return httpClient.post<ApiResult<void>>(`/wallpaper/wallpaper/${id}/backup`, undefined, {
    params: { force }
  })
}

export function backupVideoWallpaper(id: number, force = false) {
  return backupWallpaper(id, force)
}

/**
 * 批量修改壁纸字段，未填值的字段不参与更新
 * @param dto 批量修改参数
 * @returns data 为实际匹配到的壁纸数量
 */
export function batchUpdateWallpaper(dto: WallpaperBatchUpdateDTO) {
  return httpClient.put<ApiResult<number>>('/wallpaper/wallpaper/batch-basic', dto)
}
