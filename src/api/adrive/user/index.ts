import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'

export type AdriveInfoRecord = Record<string, unknown>

export function getAdriveUserInfo() {
  return httpClient.get<ApiResult<AdriveInfoRecord>>('/adrive/user/info')
}

export function getAdriveDriveInfo() {
  return httpClient.get<ApiResult<AdriveInfoRecord>>('/adrive/user/drive-info')
}

export function getAdriveSpaceInfo() {
  return httpClient.get<ApiResult<AdriveInfoRecord>>('/adrive/user/space-info')
}

export function getAdriveScopes() {
  return httpClient.get<ApiResult<AdriveInfoRecord>>('/adrive/user/scopes')
}
