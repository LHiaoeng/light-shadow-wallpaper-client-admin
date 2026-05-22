import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'

export function uploadTftShopJson(formData: FormData) {
  return httpClient.post<ApiResult<string>>('/lol/tft-shop/upload-json', formData)
}

