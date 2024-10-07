/**
 * 壁纸
 */
export interface WallpaperUrlDTO {
  // 主键id
  id: number
  wallpaperId: number
  url: string
  poster: string
  fileType: number
  width: number
  height: number
  duration: number
  size: number
  note: string
}

export interface WallpaperUrlQO {
  wallpaperId: number
}
