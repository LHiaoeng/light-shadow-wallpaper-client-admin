import type { ApiResult, PageResult } from '@/api/types'
import httpClient from '@/utils/axios'
import type { GameVersionDTO, GameVersionPageParam, GameVersionPageVO } from './types'

export function pageGameVersion(pageParams: GameVersionPageParam) {
  return httpClient.get<ApiResult<PageResult<GameVersionPageVO>>>('/lol/game-ver/page', {
    params: pageParams
  })
}

export function createGameVersion(dto: GameVersionDTO) {
  return httpClient.post<ApiResult<void>>('/lol/game-ver', dto)
}

export function updateGameVersion(dto: GameVersionDTO) {
  return httpClient.put<ApiResult<void>>('/lol/game-ver', dto)
}

export function deleteGameVersion(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lol/game-ver/${id}`)
}

export function syncGameVersion() {
  return httpClient.post<ApiResult<void>>('/lol/game-ver/sync')
}
