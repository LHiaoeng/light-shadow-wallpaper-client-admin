import httpClient from '@/utils/axios'
import type { ApiResult, PageResult } from '@/api/types'
import type { AxiosResponse } from 'axios'
import type {
  PrestigeChromaBatchUpdateDTO,
  PrestigeChromaDTO,
  PrestigeChromaExportDTO,
  PrestigeChromaImageDownloadDTO,
  PrestigeChromaPageParam,
  PrestigeChromaPageVO,
  PrestigeChromaR2SyncRequest,
  PrestigeChromaR2Task,
  PrestigeChromaR2TaskCreated
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

export function exportPrestigeChromaDocument(dto: PrestigeChromaExportDTO) {
  return httpClient.post<AxiosResponse<Blob>, PrestigeChromaExportDTO>(
    '/lol/prestige-chroma/export-doc',
    dto,
    { responseType: 'blob', timeout: 0 }
  )
}

export function downloadPrestigeChromaImages(dto: PrestigeChromaImageDownloadDTO) {
  return httpClient.post<AxiosResponse<Blob>, PrestigeChromaImageDownloadDTO>(
    '/lol/prestige-chroma/images/download',
    dto,
    { responseType: 'blob', timeout: 0 }
  )
}

export function downloadPrestigeChromaHubJson() {
  return httpClient.get<Blob>('/lol/prestige-chroma/hub-json/download', {
    responseType: 'blob',
    timeout: 0
  })
}

export function writePrestigeChromaHubJson(directory: string) {
  return httpClient.post<ApiResult<void>, { directory: string }>(
    '/lol/prestige-chroma/hub-json/write',
    { directory }
  )
}

export function createPrestigeChromaR2SyncTask(dto: PrestigeChromaR2SyncRequest) {
  return httpClient.post<ApiResult<PrestigeChromaR2TaskCreated>, PrestigeChromaR2SyncRequest>(
    '/lol/prestige-chroma/r2-sync',
    dto
  )
}

export function getPrestigeChromaR2SyncTask(taskId: string) {
  return httpClient.get<ApiResult<PrestigeChromaR2Task>>(
    `/lol/prestige-chroma/r2-sync/${encodeURIComponent(taskId)}`
  )
}
