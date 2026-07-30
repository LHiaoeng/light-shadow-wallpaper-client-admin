import type { Component } from 'vue'
import {
  CrownOutlined,
  HighlightOutlined,
  PictureOutlined,
  ShopOutlined,
  SkinOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user-store'
import type { SysMenuRouterVO } from '@/api/system/menu/types'

export interface ShortcutItem {
  // i18n key
  titleKey: string
  // 图标组件
  icon: Component
  // 跳转的完整路由路径
  target: string
}

export interface ShortcutGroup {
  // 分组标题 i18n key
  groupKey: string
  items: ShortcutItem[]
}

export const shortcutGroups: ShortcutGroup[] = [
  {
    groupKey: 'dashboard.group.common',
    items: [
      { titleKey: 'dashboard.shortcut.wallpaper', icon: PictureOutlined, target: '/wallpaper/wallpaper' },
      { titleKey: 'dashboard.shortcut.skin', icon: SkinOutlined, target: '/lol/skin' },
      { titleKey: 'dashboard.shortcut.prestigeChroma', icon: HighlightOutlined, target: '/lol/prestige-chroma' },
      { titleKey: 'dashboard.shortcut.mythicShop', icon: ShopOutlined, target: '/lol/mythic-shop' },
      { titleKey: 'dashboard.shortcut.tftShop', icon: CrownOutlined, target: '/lol/tft-shop' }
    ]
  }
]

type MenuNode = SysMenuRouterVO & { children?: MenuNode[] }

/**
 * 判断快捷入口对当前用户是否可见：基于 userMenus 可访问路径集合，
 * 以路由路径最后一段（菜单 path 段）匹配，避免依赖具体权限字符串，
 * 同时与左侧菜单权限保持一致。
 */
export function useShortcutVisible() {
  const userStore = useUserStore()
  const accessibleSegments = new Set<string>()
  const collect = (menus?: MenuNode[]) => {
    menus?.forEach(menu => {
      if (menu.path) accessibleSegments.add(menu.path)
      if (menu.children?.length) collect(menu.children)
    })
  }
  collect(userStore.userMenus as MenuNode[] | undefined)

  return (target: string): boolean => {
    const segment = target.split('/').filter(Boolean).pop()
    return segment ? accessibleSegments.has(segment) : true
  }
}
