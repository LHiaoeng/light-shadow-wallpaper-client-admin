const BREADJ_BASE_URL = 'https://communitydragon.breadj.com/'
const ASSET_PATH_PREFIX = '/lol-game-data/assets'
const FILE_PATH_PREFIX = 'plugins/rcp-be-lol-game-data/global/default'
const PLUGIN_PATH_SEGMENT = '/plugins/'

const RAW_BASE_URLS = [
  'https://raw.communitydragon.org/pbe/',
  'https://raw.communitydragon.org/latest/',
  'https://communitydragon.buguoguo.cn/pbe/',
  'https://communitydragon.buguoguo.cn/latest/',
  'https://communitydragon.breadj.com/pbe/',
  'https://communitydragon.breadj.com/latest/'
]

type CommunityDragonVersion = 'latest' | 'pbe'
type CommunityDragonLang = 'default' | 'zh_cn'

export function getRelativeResourcePath(path?: string, lang: CommunityDragonLang = 'default') {
  if (!path) {
    return path
  }

  let relativePath = path.trim().toLowerCase()
  RAW_BASE_URLS.forEach(baseUrl => {
    if (relativePath.startsWith(baseUrl)) {
      relativePath = relativePath.substring(baseUrl.length)
    }
  })

  const pluginPathIndex = relativePath.indexOf(PLUGIN_PATH_SEGMENT)
  if (pluginPathIndex >= 0) {
    relativePath = relativePath.substring(pluginPathIndex + 1)
  }

  const assetPathIndex = relativePath.indexOf(ASSET_PATH_PREFIX)
  if (assetPathIndex >= 0) {
    relativePath = relativePath.substring(assetPathIndex)
  }

  if (relativePath.startsWith(ASSET_PATH_PREFIX)) {
    relativePath =
      `plugins/rcp-be-lol-game-data/global/${lang}` +
      relativePath.substring(ASSET_PATH_PREFIX.length)
  } else if (relativePath.startsWith('/')) {
    relativePath = relativePath.substring(1)
  }

  if (lang === 'zh_cn' && relativePath.includes('/v1/emblem-images/')) {
    relativePath = relativePath.replace('/global/default/', '/global/zh_cn/')
  }

  return relativePath
}

export function toBreadjAssetUrl(
  path?: string,
  version: CommunityDragonVersion = 'latest',
  lang: CommunityDragonLang = 'default'
) {
  const relativePath = getRelativeResourcePath(path, lang)
  if (!relativePath) {
    return relativePath
  }
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  return `${BREADJ_BASE_URL}${version}/${relativePath}`
}
