export interface AdriveAuthorizeUrl {
  authorizeUrl: string
  state: string
}

export interface AdriveTokenInfo {
  id?: number
  sysUserId?: number
  userId?: string
  userName?: string
  activeDriveId?: string
  scopes?: string
  status?: 'enabled' | 'expired' | 'revoked' | string
  expireTime?: string
  lastRefreshTime?: string
}
