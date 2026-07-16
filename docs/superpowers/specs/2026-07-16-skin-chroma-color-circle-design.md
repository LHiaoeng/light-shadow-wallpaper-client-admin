# 皮肤炫彩颜色通用组件展示设计

## 目标

在皮肤编辑弹窗的“炫彩 JSON”预览中，复用 `src/components/ChromaColorCircle/index.vue` 展示每个炫彩的颜色集合，并删除本页原有的重复颜色圆点样式。

## 方案

- 在 `LolSkinFormModal.vue` 中导入 `ChromaColorCircle`。
- 每个 `chroma` 仅渲染一个组件，并将 `chroma.colors` 传给其 `colors` 属性。
- 保留现有 `chroma.colors.length` 条件，不改变空颜色集合的展示行为。
- 删除不再使用的 `.chroma-color` 样式；保留 `.chroma-colors` 容器用于间距和布局。

## 范围

仅修改皮肤编辑弹窗，不新增皮肤列表列，不修改通用组件接口，也不改变炫彩 JSON 的解析逻辑。

## 验证

- 静态检查模板中不再存在旧的颜色点循环与 `.chroma-color` 样式。
- 运行 `pnpm type-check`。
- 运行针对修改文件的 ESLint 检查。
