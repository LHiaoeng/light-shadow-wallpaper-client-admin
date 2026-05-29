const COMMUNITY_DRAGON_DOMAIN = 'https://communitydragon.breadj.com'
const COMMUNITY_DRAGON_RESOURCE_PREFIX = 'plugins/rcp-be-lol-game-data/'
const OSS_DOMAIN = import.meta.env.VITE_IMAGE_DOMAIN || 'https://oss.breadj.com'

function joinUrl(domain: string, path: string) {
  return `${domain.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

function hasUrlProtocol(url: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(url)
}

export function resolveResourceUrl(url?: string) {
  const rawUrl = url?.trim()
  if (!rawUrl) {
    return ''
  }

  if (rawUrl.startsWith('//')) {
    return `https:${rawUrl}`
  }

  if (hasUrlProtocol(rawUrl) || rawUrl.startsWith('./') || rawUrl.startsWith('../')) {
    return rawUrl
  }

  const resourcePath = rawUrl.replace(/\\/g, '/').replace(/^\/+/, '')
  if (resourcePath.startsWith(COMMUNITY_DRAGON_RESOURCE_PREFIX)) {
    return joinUrl(COMMUNITY_DRAGON_DOMAIN, resourcePath)
  }

  return joinUrl(OSS_DOMAIN, resourcePath)
}
