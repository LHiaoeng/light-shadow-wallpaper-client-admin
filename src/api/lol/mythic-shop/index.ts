import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { MythicShopPageParam, MythicShopPageResult } from './types'

export function pageMythicShop(pageParams: MythicShopPageParam) {
  return httpClient.get<ApiResult<MythicShopPageResult>>('/lol/mythic-shop/page', {
    params: pageParams
  })
}

export function uploadMythicShopJson(formData: FormData) {
  return httpClient.post<ApiResult<string>>('/lol/mythic-shop/upload-json', formData)
}

