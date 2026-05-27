import type { DictItem, DictValue } from '@/api/system/dict/types'
import { useDict } from '@/components/Dict/use-dict'
import { toBreadjAssetUrl } from '@/utils/community-dragon-utils'
import type { Ref } from 'vue'

export interface SkinDictDisplayItem {
  value?: DictValue | string
  name?: string
  iconUrl?: string
}

export const useLolSkinDictPresentation = () => {
  const cnRarityDictItems = useDict({ dictCode: 'lol_skin_rarity_cn' })
  const globalRarityDictItems = useDict({ dictCode: 'lol_skin_rarity_global' })
  const emblemDictItems = useDict({ dictCode: 'lol_skin_emblem_cn' })

  const findDictItem = (dictItems: Ref<DictItem[]>, value?: DictValue | null) => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    return dictItems.value.find(item => String(item.value) === String(value))
  }

  const getIconPaths = (dictItem?: DictItem) => {
    const iconPaths = dictItem?.attributes?.gemIconUrls
    if (Array.isArray(iconPaths)) {
      return iconPaths.filter(Boolean).map(String)
    }
    return iconPaths ? [String(iconPaths)] : []
  }

  const getIconFileName = (path: string) => {
    return path.split('/').pop()?.toLowerCase() || ''
  }

  const getPreferredIconPath = (dictItem?: DictItem, matcher?: (path: string) => boolean) => {
    const iconPaths = getIconPaths(dictItem)
    return matcher ? iconPaths.find(matcher) || iconPaths[0] : iconPaths[0]
  }

  const getCnRarityIconPath = (dictItem?: DictItem, value?: DictValue | null) => {
    const rarityId = value === undefined || value === null || value === '' ? '' : String(value)
    return getPreferredIconPath(dictItem, path => getIconFileName(path) === `cn-gem-${rarityId}.png`)
  }

  const getGlobalRarityIconPath = (dictItem?: DictItem, value?: DictValue | null) => {
    const rarity = value === undefined || value === null || value === '' ? '' : String(value)
    const iconName = `${rarity.replace(/^k/i, '').toLowerCase()}.png`
    return getPreferredIconPath(dictItem, path => getIconFileName(path) === iconName)
  }

  const getDictName = (dictItems: Ref<DictItem[]>, value?: DictValue | null) => {
    return findDictItem(dictItems, value)?.name || value
  }

  const getCnRarityIconUrl = (value?: DictValue | null) => {
    const dictItem = findDictItem(cnRarityDictItems, value)
    return toBreadjAssetUrl(getCnRarityIconPath(dictItem, value))
  }

  const getGlobalRarityIconUrl = (value?: DictValue | null) => {
    const dictItem = findDictItem(globalRarityDictItems, value)
    return toBreadjAssetUrl(getGlobalRarityIconPath(dictItem, value))
  }

  const getEmblemIconPath = (dictItem?: DictItem) => {
    return dictItem?.attributes?.small || dictItem?.attributes?.large
  }

  const getEmblemIconUrl = (value?: DictValue | null) => {
    const dictItem = findDictItem(emblemDictItems, value)
    return toBreadjAssetUrl(getEmblemIconPath(dictItem), 'latest', 'zh_cn')
  }

  const getEmblemName = (value?: DictValue | null) => getDictName(emblemDictItems, value)

  const getEmblemDisplayItems = (emblemNames?: string): SkinDictDisplayItem[] => {
    if (!emblemNames) {
      return []
    }
    return emblemNames
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(value => ({
        value,
        name: String(getEmblemName(value) || value),
        iconUrl: getEmblemIconUrl(value)
      }))
  }

  return {
    cnRarityDictItems,
    globalRarityDictItems,
    emblemDictItems,
    getCnRarityIconUrl,
    getGlobalRarityIconUrl,
    getCnRarityName: (value?: DictValue | null) => getDictName(cnRarityDictItems, value),
    getGlobalRarityName: (value?: DictValue | null) => getDictName(globalRarityDictItems, value),
    getEmblemIconUrl,
    getEmblemName,
    getEmblemDisplayItems
  }
}
