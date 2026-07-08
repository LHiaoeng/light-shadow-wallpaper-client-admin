import httpClient from '@/utils/axios'
import type { ApiResult, PageResult } from '@/api/types'
import type {
  PrestigeChromaBatchUpdateDTO,
  PrestigeChromaDTO,
  PrestigeChromaPageParam,
  PrestigeChromaPageVO
} from './types'

export function pagePrestigeChroma(pageParams: PrestigeChromaPageParam) {
  return httpClient.get<ApiResult<PageResult<PrestigeChromaPageVO>>>('/lol/prestige-chroma/page', {
    params: pageParams
  })
}

export function createPrestigeChroma(dto: PrestigeChromaDTO) {
  return httpClient.post<ApiResult<void>>('/lol/prestige-chroma', dto)
}

export function updatePrestigeChroma(dto: PrestigeChromaDTO) {
  return httpClient.put<ApiResult<void>>('/lol/prestige-chroma', dto)
}

export function batchUpdatePrestigeChromaBasic(dto: PrestigeChromaBatchUpdateDTO) {
  return httpClient.put<ApiResult<void>>('/lol/prestige-chroma/batch-basic', dto)
}

export function deletePrestigeChroma(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lol/prestige-chroma/${id}`)
}

export function syncPrestigeChroma() {
  return httpClient.post<ApiResult<void>>('/lol/prestige-chroma/sync')
}
