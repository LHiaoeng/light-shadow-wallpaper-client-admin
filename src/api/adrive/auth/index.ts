import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { AdriveAuthorizeUrl, AdriveTokenInfo } from './types'

export function getAdriveAuthorizeUrl() {
  return httpClient.get<ApiResult<AdriveAuthorizeUrl>>('/adrive/auth/authorize-url')
}

export function getAdriveTokenInfo() {
  return httpClient.get<ApiResult<AdriveTokenInfo | null>>('/adrive/auth/token')
}

export function refreshAdriveToken() {
  return httpClient.post<ApiResult<AdriveTokenInfo>>('/adrive/auth/refresh')
}
