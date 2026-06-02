const COMMUNITY_DRAGON_DOMAIN = 'https://communitydragon.breadj.com'
const COMMUNITY_DRAGON_RESOURCE_PATH = 'plugins/rcp-be-lol-game-data'
const COMMUNITY_DRAGON_VERSIONS = ['latest', 'pbe']
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
  if (resourcePath.includes(COMMUNITY_DRAGON_RESOURCE_PATH)) {
    const version = resourcePath.split('/')[0]
    const versionedPath = COMMUNITY_DRAGON_VERSIONS.includes(version)
      ? resourcePath
      : `latest/${resourcePath}`
    return joinUrl(COMMUNITY_DRAGON_DOMAIN, versionedPath)
  }

  return joinUrl(OSS_DOMAIN, resourcePath)
}
