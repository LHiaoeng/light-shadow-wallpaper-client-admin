import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { AdriveCreateFileParam, AdriveFileListParam, AdriveFileListResult } from './types'

export function listAdriveFiles(dto: AdriveFileListParam) {
  return httpClient.post<ApiResult<AdriveFileListResult>>('/adrive/file/list', dto)
}

export function createAdriveFile(dto: AdriveCreateFileParam) {
  return httpClient.post<ApiResult<Record<string, unknown>>>('/adrive/file/create', dto)
}
