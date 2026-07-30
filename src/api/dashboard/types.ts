/**
 * 工作台统计数据
 */
export interface DashboardStatisticsVO {
  // 图片壁纸总数
  imageWallpaperTotal: number
  // 视频壁纸总数
  videoWallpaperTotal: number
  // 今日新增壁纸
  wallpaperToday: number
  // 注册用户数
  userTotal: number
  // 今日访问量
  visitToday: number
}
