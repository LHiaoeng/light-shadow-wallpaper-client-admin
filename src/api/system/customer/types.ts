import type { PageParam } from '@/api/types'

export type CustomerPageQuery = PageParam & {
  username?: string
  nickname?: string
}

export type CustomerPageVO = {
  userId: number
  username: string
  nickname: string
  status: number
  createTime: string
}

export type CustomerCreateResult = {
  userId: number
}
