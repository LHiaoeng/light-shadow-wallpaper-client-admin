# Ant Design Vue 升级到最新版风险评估报告

评估日期：2026-07-08

## 1. 结论摘要

本项目当前使用 `ant-design-vue@^3.2.20`，npm 当前最新版本为 `4.2.6`。从 3.x 升级到 4.x 属于主版本升级，风险等级评估为：高。

主要原因不是 Vue 版本本身不兼容，而是项目大量依赖 Ant Design Vue 3.x 的 Less 样式体系、组件样式入口、内部模块路径和部分旧组件 API。Ant Design Vue 4.x 官方变更为 CSS-in-JS，移除了 Less 文件，并调整了弹层可见性、弹层 className、部分组件和内部类型路径。

建议不要直接一次性在主分支升级。推荐先在独立分支完成依赖升级、样式体系替换、组件 API 扫描修复和重点页面回归，再合入。

## 2. 当前项目依赖概况

项目技术栈：

- Vue：`^3.3.4`
- Vite：`^4.3.8`
- TypeScript：`~5.0.4`
- ant-design-vue：`^3.2.20`
- @ant-design/icons-vue：`^6.1.0`
- unplugin-vue-components：`^0.24.1`
- less：`^4.1.3`

目标版本：

- ant-design-vue：`4.2.6`
- @ant-design/icons-vue：Ant Design Vue 4.2.6 依赖 `^7.0.0`，当前 npm 最新为 `7.0.1`

Vue peer dependency：

- `ant-design-vue@3.2.20` 要求 `vue >=3.2.0`
- `ant-design-vue@4.2.6` 仍要求 `vue >=3.2.0`

因此 Vue 版本不是主要阻塞点，但建议在升级时同步验证 Vue 3.3.4 与当前业务代码、Vite 4、vue-tsc 1.6.5 的构建表现。

## 3. 官方主版本变更要点

Ant Design Vue 4.0 官方 changelog 中的关键破坏性变化：

- 样式体系从 Less 调整为 CSS-in-JS。
- 所有 Less 文件被移除，Less 变量不再以旧方式泄漏使用。
- 原 `ant-design-vue/dist/antd.css` 不再提供，基础重置样式改为按需引入 `ant-design-vue/dist/reset.css`。
- `LocaleProvider` 被移除，需使用 `ConfigProvider`。
- 弹层 className API 统一为 `popupClassName`，旧的 `dropdownClassName` 等相似 API 被替换。
- 受控可见性 API 统一为 `open`，`visible` 等相似 API 被替换。
- `Modal visible`、`Drawer visible`、`Dropdown visible`、`Tooltip visible` 等改为 `open`。
- `Table filterDropdownVisible` 改为 `filterDropdownOpen`。
- Grid 的 `xxxl` 断点属性移除。
- BackTop 被弃用并迁移到 FloatButton。

## 4. 项目命中风险

### 4.1 样式体系迁移风险：高

项目当前明确依赖 Ant Design Vue 3.x 的 Less 入口：

- `vite.config.ts` 中 `AntDesignVueResolver({ importStyle: 'less' })`
- `vite.config.ts` 中 Less `modifyVars` 配置了 `'root-entry-name': 'variable'`
- `src/main.ts` 手动引入：
  - `ant-design-vue/es/message/style/index.less`
  - `ant-design-vue/es/notification/style/index.less`
  - `ant-design-vue/es/modal/style/index.less`
- `src/styles/global.less`、`src/styles/nprogress.less` 和大量 `pro-components/**/*.less` 通过 `@import (reference) 'ant-design-vue/es/style/themes/index.less'` 使用主题变量。
- 扫描发现约 26 个文件命中 AntDV Less 主题或组件样式入口。

升级到 4.x 后，这些 Less 文件和变量入口大概率直接构建失败，典型错误包括：

- 找不到 `ant-design-vue/es/style/themes/index.less`
- 找不到 `ant-design-vue/es/*/style/index.less`
- Less 变量如 `@primary-color`、`@error-color`、`@screen-xs` 无法解析

影响面：

- 全局样式
- 登录页
- 布局组件
- 自研 `pro-components`
- 表格、菜单、PageContainer、SettingDrawer 等核心后台框架组件

建议：

- 将 `AntDesignVueResolver` 的样式策略从 `importStyle: 'less'` 调整为适配 4.x 的方式，通常不再依赖 Less 样式入口。
- 在入口文件引入 `ant-design-vue/dist/reset.css`，或使用 AntDV 4 的 `App` 组件提供上下文。
- 将 Less 变量迁移为本项目自有变量、CSS 变量或 AntDV 4 theme token。
- 对 `@primary-color`、`@error-color`、`@screen-xs` 等变量建立兼容层，避免一次性重写所有 Less 文件。

### 4.2 旧 API 迁移风险：中高

项目中大量使用 `<a-modal>`、`<a-drawer>`、`<a-dropdown>`、`<a-tooltip>`、`<a-tree-select>`、`<a-select>`、`<a-table>` 等组件。AntDV 4 对弹层相关 API 做了统一，旧写法可能出现 warning、类型错误或运行行为差异。

重点检查项：

- `v-model:visible` 或 `:visible` 需要迁移为 `v-model:open` 或 `:open`
- `@update:visible` 需要迁移为 `@update:open`
- `dropdownClassName` 需要迁移为 `popupClassName`
- `filterDropdownVisible` 需要迁移为 `filterDropdownOpen`
- Drawer 的 `class`、`style` 语义变化，需要确认是否改用 `rootClassName`、`rootStyle`

当前项目自定义 `useModal` 返回 `visible`，业务弹窗普遍绑定 `v-model:visible`，这是一个高频改造点。建议先封装兼容策略，再批量替换业务代码。

### 4.3 内部模块路径依赖风险：高

项目存在多处对 AntDV 内部路径的直接依赖，例如：

- `ant-design-vue/es/_util/*`
- `ant-design-vue/es/vc-*`
- `ant-design-vue/es/menu/src/*`
- `ant-design-vue/lib/table/interface`
- `ant-design-vue/lib/form/useForm`
- `ant-design-vue/es/page-header`

这些路径不属于稳定公共 API，主版本升级时最容易失效。扫描发现约 26 个文件命中内部路径或 lib/es 深层路径。

典型风险：

- 类型导入路径不存在
- 内部函数签名变化
- `initDefaultProps`、`omit`、`menuProps`、`ResizeObserver` 等内部工具不可用或行为变化
- `PageHeader` 相关导入在 4.x 中可能需要重新确认

建议：

- 优先替换为 AntDV 顶层导出的公开类型和组件。
- 对确实需要的内部工具复制到项目工具层或改为本地实现。
- 对 `pro-components` 单独做一次兼容适配，因为它是本项目 AntDV 依赖最密集的区域。

### 4.4 自研 pro-components 适配风险：高

`pro-components` 是本项目的后台基础设施，包含布局、表格、卡片、查询表单、PageContainer、SettingDrawer 等组件。该目录高度依赖 AntDV 3.x 的组件、Less 变量和内部 API。

重点风险文件：

- `pro-components/layout/BasicLayout.tsx`
- `pro-components/layout/BasicLayout.less`
- `pro-components/layout/components/PageContainer/index.tsx`
- `pro-components/layout/components/PageContainer/index.less`
- `pro-components/layout/components/SiderMenu/BaseMenu.tsx`
- `pro-components/table/Table.tsx`
- `pro-components/table/typing.ts`
- `pro-components/table/index.less`
- `pro-components/layout/components/SettingDrawer/index.tsx`

`pro-components` 一旦构建失败，会影响大部分页面。建议作为独立迁移子任务处理。

### 4.5 主题和视觉回归风险：中高

AntDV 4 的设计规范发生变化：

- 主色从 `#1890ff` 调整为 `#1677ff`
- 默认圆角、阴影、间距发生变化
- 整体风格更接近 Ant Design 5

这意味着即使构建通过，也可能出现明显视觉差异：

- 表格、卡片、按钮、弹窗圆角变化
- 菜单和布局阴影变化
- 登录页和自定义主题色不一致
- 自定义 Less 样式覆盖失效

建议：

- 为后台核心页面建立升级前截图基线。
- 升级后重点对登录页、主布局、用户管理、角色授权、菜单管理、壁纸管理、阿里云盘页面做视觉回归。
- 使用 AntDV 4 theme token 显式配置品牌主色和圆角，减少视觉漂移。

### 4.6 图标升级风险：中

AntDV 4.2.6 依赖 `@ant-design/icons-vue@^7.0.0`，项目当前直接依赖 `^6.1.0`。

项目中使用了多处图标：

- 显式导入 `@ant-design/icons-vue`
- 自动导入生成的 `types/components.d.ts`
- `pro-components/layout/components/AntIcon/index.tsx` 中导入 `* as AntIcons`
- `createFromIconfontCN`

风险：

- 图标包升级后导出差异导致类型或运行时错误
- 自动导入类型文件需要重新生成
- 菜单动态图标解析需要回归测试

建议：

- 同步升级 `@ant-design/icons-vue` 到 7.x。
- 删除并重新生成 `types/components.d.ts`、`.eslintrc-auto-import.json` 等自动生成文件。
- 重点验证菜单图标、按钮图标、登录页图标、表格工具栏图标。

### 4.7 构建工具链风险：中

项目当前：

- Vite 4
- TypeScript 5.0
- vue-tsc 1.6
- unplugin-vue-components 0.24

AntDV 4 自身可在 Vue 3.2+ 使用，但 CSS-in-JS、自动导入和类型推导可能暴露旧工具链问题。

建议：

- 先只升级 `ant-design-vue` 和 `@ant-design/icons-vue`，避免和 Vite、Vue、TypeScript 大升级混在一起。
- 如果自动导入解析器对 4.x 样式策略支持不足，再单独升级 `unplugin-vue-components`。
- 保持每一步可构建、可回滚。

### 4.8 运行时行为风险：中

需要重点验证：

- `message`、`notification`、`Modal.confirm`、`Modal.destroyAll`
- 表单校验、重置、日期选择器
- 表格分页、筛选、排序、列设置
- 下拉菜单、右键菜单、多标签页
- Tree、TreeSelect、Transfer
- Upload 和图片预览
- Layout、SiderMenu、TopNavHeader

特别是项目中 `src/utils/axios/request.ts` 可能依赖 `Modal.destroyAll()` 处理 401 场景，升级后需要确认弹窗实例销毁行为不变。

## 5. 建议升级路径

### 阶段 1：准备和基线

- 新建独立升级分支。
- 记录当前版本构建结果：`pnpm build`。
- 记录当前核心页面截图。
- 固定当前 lockfile，确保可回滚。

### 阶段 2：依赖升级

建议先执行：

```bash
pnpm add ant-design-vue@4.2.6 @ant-design/icons-vue@^7.0.1
```

不建议同时升级 Vue、Vite、TypeScript，除非构建明确要求。

### 阶段 3：样式入口迁移

- 移除所有 `ant-design-vue/es/*/style/index.less` 引入。
- 移除或改造 `AntDesignVueResolver({ importStyle: 'less' })`。
- 引入 `ant-design-vue/dist/reset.css` 或使用 AntDV 4 `App` 组件。
- 将 Less 变量改为本项目兼容变量或 AntDV 4 token。

### 阶段 4：API 迁移

优先迁移高频 API：

- `visible` -> `open`
- `v-model:visible` -> `v-model:open`
- `dropdownClassName` -> `popupClassName`
- `filterDropdownVisible` -> `filterDropdownOpen`
- Drawer 根节点样式改为 `rootClassName`、`rootStyle`

建议先处理 `useModal` 封装，再处理所有业务弹窗。

### 阶段 5：内部路径替换

- 替换 `ant-design-vue/es/_util/*` 和 `ant-design-vue/lib/*` 类型引用。
- 避免继续依赖 `vc-*`、`menu/src/*`、`page-header` 深层路径。
- 对 `pro-components` 做集中适配。

### 阶段 6：验证

最低验证清单：

```bash
pnpm type-check
pnpm build
pnpm lint
```

页面回归建议：

- 登录页
- 主布局和菜单折叠
- 多标签页
- 用户管理
- 角色授权
- 菜单管理
- 字典管理
- 壁纸管理
- 阿里云盘页面
- OAuth2 授权页

## 6. 工作量预估

粗略估计：

- 依赖升级和初步构建修复：0.5 到 1 天
- 样式体系兼容层和 Less 变量迁移：1 到 2 天
- 组件 API 批量迁移：1 到 2 天
- `pro-components` 深层路径和类型适配：1 到 3 天
- 回归测试和视觉修正：1 到 2 天

总体建议预留 4 到 8 个工作日，具体取决于是否要求视觉完全贴近升级前效果。

## 7. 风险矩阵

| 风险项 | 等级 | 影响 | 建议 |
| --- | --- | --- | --- |
| Less 文件移除 | 高 | 构建失败、样式丢失 | 先做样式兼容层，再迁移 token |
| AntDV 内部路径失效 | 高 | 类型错误、运行时错误 | 替换为公开 API 或本地工具 |
| `visible` 改 `open` | 中高 | 弹窗、抽屉、下拉显示异常 | 批量扫描并迁移 |
| `dropdownClassName` 改 `popupClassName` | 中 | 弹层样式丢失 | 扫描 Select、TreeSelect、DatePicker 等 |
| pro-components 适配 | 高 | 后台布局和表格不可用 | 单独拆任务处理 |
| 视觉风格变化 | 中高 | UI 与现有风格不一致 | 升级前后截图对比 |
| icons-vue 7.x | 中 | 图标导入或类型错误 | 同步升级并回归菜单图标 |
| 自动导入解析 | 中 | 组件无法自动导入或类型生成异常 | 必要时升级 unplugin-vue-components |

## 8. 是否建议升级

建议升级，但不建议立即在主分支直接升级。

升级收益：

- 获得 AntDV 4.x 的 bugfix 和 Vue 3.4 相关兼容修复。
- 新增 Flex、Watermark、QRCode、FloatButton、Tour 等组件。
- 主题能力转向 token 和 CSS-in-JS，长期更接近 Ant Design 新体系。
- 可减少继续停留在 3.x 带来的生态滞后风险。

升级代价：

- 当前项目样式体系对 AntDV 3.x Less 依赖较重。
- `pro-components` 对内部 API 依赖较多，迁移成本明显。
- 需要较完整的构建、类型、页面、视觉回归。

综合建议：

- 如果近期没有强需求，可先完成技术预研分支，不急于合入。
- 如果为了安全、兼容或后续功能必须升级，建议按阶段执行，并优先把样式兼容和 `pro-components` 作为核心任务。

## 9. 参考资料

- Ant Design Vue 官方文档：https://www.antdv.com/docs/vue/introduce/
- Ant Design Vue changelog：https://github.com/vueComponent/ant-design-vue/blob/main/CHANGELOG.en-US.md
- npm ant-design-vue：https://www.npmjs.com/package/ant-design-vue
- jsDelivr ant-design-vue 版本信息：https://www.jsdelivr.com/package/npm/ant-design-vue
