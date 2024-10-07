import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { ChampionDTO, ChampionPageParam, ChampionPageVO } from './types'

/**
 * 英雄联盟英雄分页查询
 * @param pageParams 分页参数
 */
export function pageChampion(pageParams: ChampionPageParam) {
  return httpClient.get<ApiResult<ChampionPageVO>>('/lol/champion/page', {
    params: pageParams
  })
}

/**
 * 创建英雄联盟英雄
 * @param dto
 */
export function createChampion(dto: ChampionDTO) {
  return httpClient.post<ApiResult<void>>('/lol/champion', dto)
}

/**
 * 修改英雄联盟英雄
 * @param dto
 */
export function updateChampion(dto: ChampionDTO) {
  return httpClient.put<ApiResult<void>>('/lol/champion', dto)
}

/**
 * 删除英雄联盟英雄
 * @param id 主键ID
 */
export function deleteChampion(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lol/champion/` + id)
}
