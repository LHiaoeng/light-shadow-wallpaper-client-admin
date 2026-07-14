import type { PageParam } from '@/api/types'

export interface PrestigeChromaDTO {
  id?: number
  heroId?: number
  heroName?: string
  heroNameEng?: string
  gameVer?: string
  skinId?: number
  instanceId?: string
  itemName?: string
  itemNameEng?: string
  sourceSkinId?: number
  sourceSkinInstanceId?: string
  sourceSkinName?: string
  sourceSkinNameEng?: string
  sourceSkinSkinlineIdSet?: string
  sourceSkinUniverseIdSet?: string
  itemMark?: number
  categoryId?: string
  categoryName?: string
  tagId?: string
  tagImgUrl?: string
  seriesId?: string
  displayType?: number
  itemScore?: number
  displayImage?: number
  jumpUrl?: string
  imageAnimate?: number
  rank?: number
  startTime?: string
  endTime?: string
  startDate?: string
  isNew?: number
}

export interface PrestigeChromaBatchUpdateDTO {
  ids: number[]
  gameVer: string
  isNew: number
}

export type PrestigeChromaExportScope = 'SELECTED' | 'FILTERED'
export type PrestigeChromaTemplateType = 'BLOG_POST' | 'AI_VIDEO_SCRIPT'
export type PrestigeChromaFileFormat = 'DOCX' | 'MARKDOWN'
export type PrestigeChromaDocumentLanguage = 'ZH_CN' | 'EN_US'

export interface PrestigeChromaExportDTO {
  scope: PrestigeChromaExportScope
  ids?: number[]
  query?: PrestigeChromaQO
  templateType: PrestigeChromaTemplateType
  fileFormat: PrestigeChromaFileFormat
  language: PrestigeChromaDocumentLanguage
  title?: string
  slideDurationSeconds?: number
}

export interface PrestigeChromaQO {
  gameVer?: string
  heroId?: number
  skinId?: number
  instanceId?: string
  sourceSkinId?: number
  sourceSkinlineId?: string
  sourceUniverseId?: string
  categoryId?: string
  tagId?: string
  isNew?: number
  keyword?: string
}

export type PrestigeChromaPageParam = PrestigeChromaQO & PageParam

export interface PrestigeChromaPageVO extends PrestigeChromaDTO {
  id: number
  createTime?: string
  updateTime?: string
}

export interface PrestigeChromaR2SyncRequest {
  instanceIds?: string[]
  force: boolean
}

export type PrestigeChromaR2TaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'

export type PrestigeChromaR2TaskScope = 'ALL' | 'SELECTED'
export type PrestigeChromaR2AssetType = 'SITE3' | 'SITE4' | 'SITE5' | 'TAG'
export type PrestigeChromaR2FailureStage =
  | 'MANIFEST'
  | 'HEAD'
  | 'DOWNLOAD'
  | 'VALIDATE'
  | 'UPLOAD'
  | 'CACHE_PURGE'

export interface PrestigeChromaR2AssetFailure {
  instanceId: string
  assetType: PrestigeChromaR2AssetType
  objectKey: string
  stage: PrestigeChromaR2FailureStage
  message: string
}

export interface PrestigeChromaR2TaskCreated {
  taskId: string
  status: 'PENDING'
  createdAt: string
}

export interface PrestigeChromaR2Task {
  taskId: string
  status: PrestigeChromaR2TaskStatus
  force: boolean
  scope: PrestigeChromaR2TaskScope
  chromaTotal: number
  assetTotal: number
  processed: number
  uploaded: number
  skipped: number
  failed: number
  createdAt: string
  startedAt?: string
  finishedAt?: string
  failureDetails: PrestigeChromaR2AssetFailure[]
  failureDetailsTruncated: boolean
  message?: string
}
