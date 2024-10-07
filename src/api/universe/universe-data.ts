import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { UniverseDTO, UniversePageParam, UniversePageVO } from './types'

/**
 * 宇宙表分页查询
 * @param pageParams 分页参数
 */
export function pageUniverse(pageParams: UniversePageParam) {
  return httpClient.get<ApiResult<UniversePageVO>>('/universe/universe-data/page', {
    params: pageParams
  })
}

/**
 * 创建宇宙表
 * @param dto
 */
export function createUniverse(dto: UniverseDTO) {
  return httpClient.post<ApiResult<void>>('/universe/universe-data', dto)
}

/**
 * 修改宇宙表
 * @param dto
 */
export function updateUniverse(dto: UniverseDTO) {
  return httpClient.put<ApiResult<void>>('/universe/universe-data', dto)
}

/**
 * 删除宇宙表
 * @param id 主键ID
 */
export function deleteUniverse(id: number) {
  return httpClient.delete<ApiResult<void>>(`/universe/universe-data/` + id)
}
