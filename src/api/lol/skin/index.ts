import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { LolSkinDTO, LolSkinPageParam, LolSkinPageVO } from './types'

export function pageLolSkin(pageParams: LolSkinPageParam) {
  return httpClient.get<ApiResult<LolSkinPageVO>>('/lol/skin/page', {
    params: pageParams
  })
}

export function createLolSkin(dto: LolSkinDTO) {
  return httpClient.post<ApiResult<void>>('/lol/skin', dto)
}

export function updateLolSkin(dto: LolSkinDTO) {
  return httpClient.put<ApiResult<void>>('/lol/skin', dto)
}

export function deleteLolSkin(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lol/skin/${id}`)
}
