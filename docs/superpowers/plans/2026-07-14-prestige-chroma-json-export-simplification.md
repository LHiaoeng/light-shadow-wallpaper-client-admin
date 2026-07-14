# 臻彩展示站 JSON 导出简化 Implementation Plan

> 状态说明（2026-07-14）：浏览器目录选择实现已被服务器目录输入与后端受限写入替代。当前实现计划见后端仓库
> `docs/superpowers/plans/2026-07-14-prestige-chroma-directory-write.md`。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将“展示站数据”简化为普通下载 JSON 和选择本地文件夹导出 JSON 两个动作，并显示本地项目的推荐输出目录。

**Architecture:** 两个菜单动作共用现有 `downloadPrestigeChromaHubJson()` 接口。组件只负责显示推荐目录和选择保存方式，删除服务器默认目录写入及 `hub-write` 前端权限依赖。推荐目录只是界面提示，不尝试绕过浏览器安全限制自动定位本地路径。

**Tech Stack:** Vue 3、TypeScript、Ant Design Vue、File System Access API、Axios。

## Global Constraints

- 输出文件名固定为 `prestige-chromas.json`。
- 两个动作只使用 `lol:prestige:hub-download` 权限。
- 用户取消目录选择时不显示错误。
- 浏览器不支持目录选择时只提示，不自动下载。
- 下拉菜单顶部显示推荐目录 `D:\WebstormProjects\lol-prestige-chroma-hub\data\`。
- 推荐目录只作提示，用户仍通过浏览器目录选择器手动选择。
- 不修改后端接口，不提交 Git。

---

### Task 1: 精简展示站数据导出组件

**Files:**
- Modify: `src/views/lol/prestigeChroma/PrestigeChromaHubActions.vue`
- Modify: `src/views/lol/prestigeChroma/PrestigeChromaPage.vue`
- Modify: `src/api/lol/prestigeChroma/index.ts`
- Modify: `src/api/lol/prestigeChroma/types.ts`

**Interfaces:**
- Consumes: `downloadPrestigeChromaHubJson(): Promise<Blob>`
- Produces: 普通下载与指定目录写入两个菜单动作。

- [x] **Step 1: 精简组件属性和菜单**

删除 `canWrite` 和 `canDownload`；页面通过 `lol:prestige:hub-download` 权限控制整个组件，菜单改为
`导出 JSON 文件` 和 `导出到指定文件夹`。

- [x] **Step 2: 删除服务器写入逻辑**

删除 `writePrestigeChromaHubJson` 调用、确认弹窗和写入成功摘要。普通下载直接执行：

```ts
const blob = await downloadPrestigeChromaHubJson()
fileDownload(blob, 'prestige-chromas.json')
```

- [x] **Step 3: 简化目录导出**

先调用 `showDirectoryPicker()`，选中目录后再下载 Blob，并通过 `createWritable()` 写入固定文件名。不支持时显示提示并返回。

- [x] **Step 4: 清理页面权限和无用 API 类型**

页面只用 `lol:prestige:hub-download` 渲染组件；删除 `writePrestigeChromaHubJson()` 和仅由它使用的 `PrestigeChromaHubWriteResult`。

- [x] **Step 5: 验证**

Run:

```text
pnpm.cmd exec eslint src/api/lol/prestigeChroma/index.ts src/api/lol/prestigeChroma/types.ts src/views/lol/prestigeChroma/PrestigeChromaHubActions.vue src/views/lol/prestigeChroma/PrestigeChromaPage.vue --ext .vue,.ts
pnpm.cmd type-check
```

Expected: 两条命令退出码均为 0，且 `src` 中不存在 `hub-write` 或 `writePrestigeChromaHubJson` 引用。

---

### Task 2: 显示推荐目录并清理遗留代码

**Files:**
- Modify: `src/views/lol/prestigeChroma/PrestigeChromaHubActions.vue`
- Modify: `docs/superpowers/specs/2026-07-14-prestige-chroma-json-export-simplification-design.md`
- Modify: `docs/superpowers/plans/2026-07-14-prestige-chroma-json-export-simplification.md`

- [x] **Step 1: 在下拉菜单顶部显示推荐目录**

在两个导出菜单项之前加入不可点击的提示项和分隔线：

```vue
<a-menu-item disabled class="recommended-directory">
  <span class="recommended-directory-label">推荐目录</span>
  <span class="recommended-directory-path">{{ recommendedDirectory }}</span>
</a-menu-item>
<a-menu-divider />
```

在脚本中使用单一常量保存路径：

```ts
const recommendedDirectory = 'D:\\WebstormProjects\\lol-prestige-chroma-hub\\data\\'
```

- [x] **Step 2: 添加最小展示样式**

```css
.recommended-directory {
  height: auto;
  cursor: default;
}

.recommended-directory-label,
.recommended-directory-path {
  display: block;
}

.recommended-directory-path {
  font-family: monospace;
  white-space: nowrap;
}
```

- [x] **Step 3: 清理并扫描遗留代码**

删除组件中与服务器默认目录写入、确认弹窗、旧权限属性有关的残留声明和导入，然后运行：

```text
rg -n "hub-write|writePrestigeChromaHubJson|PrestigeChromaHubWriteResult|canWrite|canDownload" src/views/lol/prestigeChroma src/api/lol/prestigeChroma
rg -n "Modal" src/views/lol/prestigeChroma/PrestigeChromaHubActions.vue
```

Expected: 两条命令均无匹配。其他表单和 R2 同步组件可继续使用各自合法的弹窗逻辑。

- [x] **Step 4: 同步相关文档**

设计文档和本计划明确记录推荐路径仅作提示，浏览器仍需用户手动选择目录。

- [x] **Step 5: 验证**

Run:

```text
pnpm.cmd exec eslint src/views/lol/prestigeChroma/PrestigeChromaHubActions.vue --ext .vue
pnpm.cmd type-check
git diff --check
```

Expected: 三条命令退出码均为 0。
