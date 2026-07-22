# 工作台（仪表盘）页功能设计

## 目标

为 `light-shadow-wallpaper-client-admin` 新增一个**仪表盘 / 工作台**页，作为登录后系统的默认落地页（"一进去就显示"）。页面主体提供各常用功能的**快捷入口按钮**，帮助运营快速跳转，减少在左侧菜单中翻找的成本。

## 路由接入方案（关键）

当前前端路由是**后端菜单驱动的动态路由**：`src/router/dynamic-routes.ts` 的 `generatorDynamicRouter` 根据 `userStore.userMenus`（后端菜单）生成子路由，并由 `fillRedirect(routes)` 把根路由 `/` 重定向到其**第一个 `hideInMenu=false` 的子路由**。

为了让仪表盘成为落地页、且**不依赖后端菜单配置**，采用前端常量路由方案：

- 新建页面 `src/views/dashboard/index.vue`。
- 在 `generatorDynamicRouter` 中生成菜单路由后，将仪表盘路由**作为第一个子路由** prepend 到 `routes.children`：

```ts
const DASHBOARD_ROUTE: RouteRecordRaw = {
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/index.vue'),
  meta: { name: '仪表盘', icon: 'DashboardOutlined', hideInTab: false }
}
routes.children.unshift(DASHBOARD_ROUTE)
```

- 由于仪表盘是第一个非隐藏子路由，`fillRedirect(routes)` 会自动把 `/` 重定向到 `/dashboard`；同时仪表盘也会作为左侧菜单第一项出现（标准"工作台"模式）。

> **备选**：若希望仪表盘不出现在左侧菜单，可设 `meta.hideInMenu = true`，并在 `fillRedirect(routes)` 之后显式 `routes.redirect = '/dashboard'`。

## 页面结构（布局）

基于 Ant Design Vue + `pro-components`，自上而下：

1. **欢迎区（页头）**：根据时段（早/下午/晚上好）+ 当前登录用户名问候；副标题展示日期、待办数等。
2. **数据概览卡片行**：若干统计数字卡片（`ProCard` / `Statistic`），如壁纸总数、今日新增、用户数、访问量、待审任务等。
3. **快捷功能网格（核心）**：按业务域分组的快捷入口卡片，每张含图标 + 名称，点击 `router.push` 跳转对应功能页。
4. **（可选）辅助面板**：右侧/下方放置系统状态（Redis / XXL-Job / 存储用量）、最新公告、最近操作等。

## 快捷入口清单（草稿，目标路径需与后端菜单 `uri` 对齐）

依据现有 `src/views` 目录推断目标路由（最终以 `system/menu` 中配置的实际 `uri` 为准）：

| 分组 | 入口 | 目标路由（推断） |
|------|------|------------------|
| 壁纸 | 壁纸管理 | `/wallpaper/wallpaper` |
| LOL | 英雄 | `/lol/champion` |
| LOL | 皮肤 | `/lol/skin` |
| LOL | 炫彩 | `/lol/prestigeChroma` |
| LOL | 神话商店 | `/lol/mythicShop` |
| LOL | 皮肤系列 | `/lol/skinline` |
| LOL | 宇宙 | `/lol/universe` |
| LOL | 游戏版本 | `/lol/gameVersion` |
| LOL | TFT 商店 | `/lol/tftShop` |
| 系统 | 用户 | `/system/user` |
| 系统 | 角色 | `/system/role` |
| 系统 | 菜单 | `/system/menu` |
| 系统 | 字典 | `/system/dict` |
| 系统 | 配置 | `/system/config` |
| 系统 | 组织 | `/system/organization` |
| 日志 | 登录/访问/操作日志 | `/log/login-log` 等 |
| 通知 | 公告 | `/notify/announcement` |
| 其他 | 阿里云盘、国际化 | `/adrive`、`/i18n` |

建议优先展示"常用"组（壁纸、英雄、皮肤、神话商店、公告），其余分组折叠或滚动。

## 数据来源（统计卡片）

统计卡片**先使用 mock 占位**，并预留清晰的接口接入点：

- 定义 `DashboardStatisticsVO` 类型，建议指标：
  - `wallpaperTotal` 壁纸总数
  - `wallpaperToday` 今日新增壁纸
  - `userTotal` 注册用户数
  - `visitToday` 今日访问量
  - `pendingTasks` 待办/待审任务数（可选）
- 新增 API 桩 `getDashboardStatistics()`（`src/api/dashboard/types.ts` + `index.ts`），当前返回 mock；后端就绪后改为 `GET /api/dashboard/statistics` 真实请求。
- 页面 `onMounted` 调用该接口填充卡片；接口失败时卡片回退到占位值，不阻塞快捷入口。

## 权限过滤方案

快捷入口**按当前用户权限过滤**（隐藏无权限项）。为避免猜测权限码导致误隐藏，采用**可访问路径集合**过滤，与左侧菜单同源：

- 从 `useUserStore().userMenus`（`SysMenuRouterVO[]`）出发，递归拼接出用户可访问的完整路由路径集合（复用 `dynamic-routes.ts` 中 `path = parent.path + '/' + item.path` 的拼接规则）。
- 每个快捷入口配置 `target`（完整路由路径，如 `/wallpaper/wallpaper`）；仅当 `target` 命中可访问路径集合时才展示。
- 该方案不依赖具体权限字符串，后端菜单变动时自动同步。

## 横切关注点

- **i18n**：项目已启用国际化（`enableI18n=true`）。仪表盘文案（标题、分组名、按钮名）加入 `src/locales/lang/zh-CN.ts` 与 `en-US.ts`。
- **图标**：使用 `@ant-design/icons-vue`（如 `DashboardOutlined`、`PictureOutlined`、`UserOutlined`、`SettingOutlined` 等）。
- **响应式**：网格用 `a-row` / `a-col` 栅格，移动端单列。
- **KeepAlive**：仪表盘为静态页，无需 keepAlive。
- **左侧菜单**：仪表盘作为菜单第一项"工作台"出现（由路由方案保证）。

## 实现要点（落地清单）

### 文件

- 新增 `src/views/dashboard/index.vue` — 仪表盘页面。
- 新增 `src/views/dashboard/components/StatCards.vue` — 统计卡片区（可选拆分）。
- 新增 `src/views/dashboard/components/ShortcutGrid.vue` — 快捷入口网格（可选拆分）。
- 新增 `src/api/dashboard/index.ts` + `src/api/dashboard/types.ts` — 统计接口桩。
- 新增 `src/views/dashboard/shortcuts.ts` — 快捷入口配置（分组、图标、target、标题 i18n key）。
- 修改 `src/router/dynamic-routes.ts` — prepend 仪表盘常量路由到 `routes.children[0]`。
- 修改 `src/locales/lang/zh-CN.ts`、`en-US.ts` — 仪表盘文案。
- 修改 `src/locales/lang/zh-CN/dashboard.ts`（若按模块拆分）— 同上。

### 快捷入口配置结构（草稿）

```ts
interface ShortcutItem {
  titleKey: string      // i18n key
  icon: Component       // ant-design icon
  target: string        // 完整路由路径
  permissionGroup?: string // 仅用于分组展示
}
interface ShortcutGroup {
  groupKey: string
  items: ShortcutItem[]
}
```

分组建议：常用（壁纸、英雄、皮肤、神话商店、公告）、系统（用户/角色/菜单/字典/配置）、数据（登录日志/访问日志/操作日志）、其他（阿里云盘/国际化）。

### 页面骨架（index.vue）

```
欢迎区（问候语 + 用户名 + 日期）
StatCards（统计卡片行）
ShortcutGrid（按组渲染快捷卡片，点击 router.push(target)）
```

## 已确认决策（头脑风暴结论）

1. **范围**：快捷入口网格 + 数据概览卡片（卡片先用 mock 占位，预留后端接口）。
2. **权限过滤**：按当前用户权限隐藏无权限快捷项（基于 `userMenus` 可访问路径集合）。
3. **左侧菜单**：仪表盘作为"工作台"第一项出现，且为登录后默认落地页。

## 实现状态

- **阶段一（已完成）**：前端页面 + mock 数据 + 权限过滤 + 路由接入，无需后端即可运行。
  - 新增文件：`src/views/dashboard/index.vue`、`components/StatCards.vue`、`components/ShortcutGrid.vue`、`shortcuts.ts`；`src/api/dashboard/{types.ts,index.ts}`；`src/locales/lang/{zh-CN,en-US}/dashboard.json`。
  - 修改：`src/router/dynamic-routes.ts`（prepend 仪表盘常量路由，自动成为落地页与菜单第一项）。
  - 已通过 `type-check` 与 ESLint。
- **阶段二（已完成）**：后端新增 `GET /dashboard/statistics`，前端 `getDashboardStatistics()` 已替换为真实请求。

### 后端实现（admin 模块）

新增 `com.breadj.lightshadowwallpaper.admin.dashboard` 包：

- `controller/DashboardController.java` — `GET /dashboard/statistics`，返回 `R<DashboardStatisticsVO>`。
- `service/DashboardService.java` + `impl/DashboardServiceImpl.java` — 聚合各数据源统计。
- `mapper/DashboardMapper.java` — 访问日志今日统计（参数化 `@Select`）。
- `model/vo/DashboardStatisticsVO.java` — 与前端字段对齐：`wallpaperTotal / wallpaperToday / userTotal / visitToday`。

#### 数据来源

| 字段 | 数据源 | 统计方式 |
|------|--------|----------|
| `wallpaperTotal` | `wallpaper` 表 | `WallpaperMapper.selectCount(null)` |
| `wallpaperToday` | `wallpaper` 表 | `create_time >= 今日 00:00` 的 count |
| `userTotal` | `sys_user` 表（Ballcat 框架 `SysUserMapper`） | `selectCount(null)` |
| `visitToday` | `access_log` 表 | `create_time >= 今日 00:00` 的 count |

#### 注意事项

- 接口未加 `@PreAuthorize`，登录即可访问（仪表盘为工作台首页，所有登录用户可见）。
- 访问量统计依赖 `access_log` 表的 `create_time` 字段（沿用 Ballcat 约定）；若该表时间字段名不同，需调整 `DashboardMapper.countAccessLogToday` 的 SQL。
- 已通过 `mvn -pl admin compile` 与 `spring-javaformat:apply` 校验。
