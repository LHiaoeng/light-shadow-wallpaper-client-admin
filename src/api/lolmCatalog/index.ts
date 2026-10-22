import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type {
  LolmHero,
  LolmHeroPage,
  LolmHeroPageParam,
  LolmSkin,
  LolmSkinPage,
  LolmSkinPageParam
} from './types'

export function pageLolmHero(params: LolmHeroPageParam) {
  return httpClient.get<ApiResult<LolmHeroPage>>('/lolm/hero/page', { params })
}

export function getLolmHero(id: number) {
  return httpClient.get<ApiResult<LolmHero>>(`/lolm/hero/${id}`)
}

export function createLolmHero(hero: LolmHero) {
  return httpClient.post<ApiResult<void>>('/lolm/hero', hero)
}

export function updateLolmHero(hero: LolmHero) {
  return httpClient.put<ApiResult<void>>('/lolm/hero', hero)
}

export function deleteLolmHero(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lolm/hero/${id}`)
}

export function restoreLolmHero(id: number) {
  return httpClient.post<ApiResult<void>>(`/lolm/hero/${id}/restore`)
}

export function restoreLolmHeroAuto(id: number) {
  return httpClient.post<ApiResult<void>>(`/lolm/hero/${id}/restore-auto`)
}

export function pageLolmSkin(params: LolmSkinPageParam) {
  return httpClient.get<ApiResult<LolmSkinPage>>('/lolm/skin/page', { params })
}

export function getLolmSkin(id: number) {
  return httpClient.get<ApiResult<LolmSkin>>(`/lolm/skin/${id}`)
}

export function createLolmSkin(skin: LolmSkin) {
  return httpClient.post<ApiResult<void>>('/lolm/skin', skin)
}

export function updateLolmSkin(skin: LolmSkin) {
  return httpClient.put<ApiResult<void>>('/lolm/skin', skin)
}

export function deleteLolmSkin(id: number) {
  return httpClient.delete<ApiResult<void>>(`/lolm/skin/${id}`)
}

export function restoreLolmSkin(id: number) {
  return httpClient.post<ApiResult<void>>(`/lolm/skin/${id}/restore`)
}

export function restoreLolmSkinAuto(id: number) {
  return httpClient.post<ApiResult<void>>(`/lolm/skin/${id}/restore-auto`)
}

export function syncLolmCatalog() {
  return httpClient.post<ApiResult<void>>('/lolm/catalog/sync')
}
