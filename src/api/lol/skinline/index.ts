import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { SkinlineDTO, SkinlinePageParam, SkinlinePageVO } from './types'

/**
 * 英雄联盟皮肤系列分页查询
 * @param pageParams 分页参数
 */
export function pageSkinline(pageParams: SkinlinePageParam) {
  return httpClient.get<ApiResult<SkinlinePageVO>>('/lol/skinline/page', {
    params: pageParams
  })
}

/**
 * 创建英雄联盟皮肤系列
 * @param dto
 */
export function createSkinline(dto: SkinlineDTO) {
  return httpClient.post<ApiResult<void>>('/lol/skinline', dto)
}

/**
 * 修改英雄联盟皮肤系列
 * @param dto
 */
export function updateSkinline(dto: SkinlineDTO) {
  return httpClient.put<ApiResult<void>>('/lol/skinline', dto)
}

/**
 * 删除英雄联盟皮肤系列
 * @param id 主键ID
 */
export function deleteSkinline(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lol/skinline/` + id)
}
