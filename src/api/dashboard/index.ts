import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { DashboardStatisticsVO } from './types'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStatistics() {
  return httpClient.get<ApiResult<DashboardStatisticsVO>>('/dashboard/statistics')
}
