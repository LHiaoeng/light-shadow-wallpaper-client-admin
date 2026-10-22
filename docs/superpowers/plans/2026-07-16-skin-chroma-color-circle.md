# Skin Chroma Color Circle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the shared `ChromaColorCircle` component for each chroma color group in the skin edit modal and remove the obsolete local swatch style.

**Architecture:** Keep the existing chroma JSON parsing and preview layout. Replace only the local per-color spans with one shared component receiving `chroma.colors`.

**Tech Stack:** Vue 3, TypeScript, Ant Design Vue, pnpm

---

### Task 1: Replace local chroma swatches

**Files:**
- Modify: `src/views/lol/skin/LolSkinFormModal.vue`

- [ ] **Step 1: Run the failing source acceptance check**

Run a PowerShell assertion that requires `import ChromaColorCircle`, `<chroma-color-circle :colors="chroma.colors" />`, and no `.chroma-color` selector. Expected: FAIL before implementation.

- [ ] **Step 2: Write the minimal implementation**

Import `ChromaColorCircle` from `@/components/ChromaColorCircle/index.vue`, replace the local `v-for` color spans with:

```vue
<chroma-color-circle :colors="chroma.colors" />
```

Delete the obsolete `.chroma-color` CSS block while keeping `.chroma-colors`.

- [ ] **Step 3: Run the acceptance check again**

Expected: PASS.

- [ ] **Step 4: Run project checks**

Run `pnpm type-check` and `pnpm exec eslint src/views/lol/skin/LolSkinFormModal.vue`. Expected: both exit with code 0.

- [ ] **Step 5: Review the focused diff**

Run `git diff -- src/views/lol/skin/LolSkinFormModal.vue` and confirm only the import, component replacement, and obsolete style removal changed.
