<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { WallpaperUrlDTO } from '@/api/wallpaper/wallpaperUrl/types'

defineOptions({ name: 'FileAnalyzer' })

const emits = defineEmits<{
  (e: 'update:fileInfo', value: WallpaperUrlDTO | null): void
}>()

const fileUrl = ref<string>('')

const fileInfo = ref<WallpaperUrlDTO | null>(null)

/** 拖拽悬停高亮 */
const dragging = ref<boolean>(false)

watch(fileInfo, newValue => {
  emits('update:fileInfo', newValue)
})

/** 按「图片地址@处理参数」提取原图，不限制图床域名。 */
function getCleanUrl(input: string): string {
  let parsed: URL
  try {
    parsed = new URL(input.startsWith('//') ? `https:${input}` : input)
  } catch {
    return input
  }
  if (!/^https?:$/.test(parsed.protocol)) return input

  // 签名可能包含处理参数或路径，修改后会导致鉴权失败。
  if (
    [...parsed.searchParams.keys()].some(key =>
      /sign|token|auth|^expires$|^e$|^x-amz-|^x-oss-/i.test(key)
    )
  ) {
    return input
  }

  const suffixIndex = input.search(/[?#]/)
  const base = suffixIndex < 0 ? input : input.slice(0, suffixIndex)
  const suffix = suffixIndex < 0 ? '' : input.slice(suffixIndex)
  if (!/@[^/]+$/.test(parsed.pathname)) return input
  return base.replace(/@[^/]+$/, '') + suffix
}

const addFileUrl = () => {
  const input = fileUrl.value.trim()
  if (!input) return
  const url = getCleanUrl(input)
  fileInfo.value = { url, poster: url === input ? '' : input }
}

/** 从 text/html 中解析出图片地址 */
function parseImgSrcFromHtml(html: string): string {
  // 用 DOMParser 解析，避免正则被属性顺序或单双引号干扰
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const img = doc.querySelector('img')
  if (!img) return ''

  // 懒加载页面（如 b站专栏）真实地址常在 data-src / data-original 上，
  // 这类图片尚未加载，src 会是占位值或不存在的透明图
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    img.getAttribute('data-original'),
    img.getAttribute('data-actualsrc')
  ]

  return candidates.find(value => !!value && !value.startsWith('data:')) || ''
}

/**
 * 从 dataTransfer 中提取图片 URL。
 * 拖拽网页里的 <img> 时 text/uri-list 最可靠，Safari 可能只给 text/html。
 */
function extractImageUrl(dataTransfer: DataTransfer): string {
  // 优先 text/uri-list，拖 <img> 时它直接就是图片地址
  const uriList = dataTransfer.getData('text/uri-list').trim()
  if (uriList) {
    // uri-list 可能是多行，以换行分隔的多个地址
    const firstUrl = uriList
      .split('\n')
      .map(line => line.trim())
      .find(line => line && !line.startsWith('#'))
    if (firstUrl) return firstUrl
  }

  // 其次 text/html，从 <img src> 里抠
  const html = dataTransfer.getData('text/html')
  if (html) {
    const src = parseImgSrcFromHtml(html)
    if (src) return src
  }

  // 最后兜底纯文本，仅接受看起来像地址的内容
  const text = dataTransfer.getData('text/plain').trim()
  if (/^(https?:)?\/\//i.test(text) || /^\//.test(text)) {
    return text
  }

  return ''
}

/** 拖拽进入深度计数，避免鼠标划过子元素时高亮闪烁 */
let dragDepth = 0

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragDepth += 1
  dragging.value = true
}

const handleDragOver = (event: DragEvent) => {
  // 必须阻止默认行为，否则 drop 不会触发
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) {
    dragging.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragDepth = 0
  dragging.value = false

  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return

  // 优先尝试提取地址：Chrome 拖拽网页里的 <img> 时会同时提供
  // Files 和 text/uri-list，此时 files 有值不代表是本地文件
  const url = extractImageUrl(dataTransfer)
  if (url) {
    // 只填入输入框，由用户确认后再点击「新增源」
    fileUrl.value = url
    message.success('已识别图片地址，确认后点击「新增源」')
    return
  }

  // 取不到地址时，files 有值说明拖的是本地磁盘文件
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    message.warning('暂不支持拖入本地文件，请拖拽网络图片')
    return
  }

  // 部分站点（如 lolm.qq.com）给图片设了 pointer-events:none，
  // 鼠标按下时会穿透到下层元素，此时拖到的是文字或空白而非图片
  message.warning('未能识别图片地址。若源站点无法拖拽图片，请右键复制图片地址后手动粘贴')
}

defineExpose({
  /** 供父组件在提交成功后清空输入框 */
  reset() {
    fileUrl.value = ''
  }
})
</script>

<template>
  <div>
    <a-form>
      <a-form-item>
        <div
          class="file-analyzer-drop"
          :class="{ 'is-dragging': dragging }"
          @dragenter="handleDragEnter"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div class="file-analyzer-drop__icon">
            <CloudDownloadOutlined />
          </div>
          <div class="file-analyzer-drop__text">将网络图片拖到此处，自动识别图片地址</div>
          <div class="file-analyzer-drop__hint">
            支持从浏览器页面直接拖拽；若源站点无法拖图，可右键复制图片地址后粘贴
          </div>
        </div>
      </a-form-item>
      <a-form-item>
        <a-textarea
          v-model:value="fileUrl"
          placeholder="请输入文件URL"
          auto-size
          allow-clear
          :rows="2"
        />
        <div class="file-analyzer-tip">
          支持「图片地址@处理参数」格式，自动提取原图并保留完整地址作为缩略图
        </div>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" block @click="addFileUrl">
          <FileAddOutlined />
          新增源
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped lang="less">
@import (reference) 'ant-design-vue/es/style/themes/default.less';

.file-analyzer-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px dashed @border-color-base;
  border-radius: @border-radius-base;
  background-color: @background-color-light;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: @primary-color;
  }

  &.is-dragging {
    border-color: @primary-color;
    background-color: fade(@primary-color, 8%);
  }

  &__icon {
    font-size: 24px;
    line-height: 1;
    color: @text-color-secondary;
  }

  &__text {
    margin-top: 8px;
    font-size: 13px;
    color: @text-color;
  }

  &__hint {
    margin-top: 4px;
    font-size: 12px;
    color: @text-color-secondary;
  }
}

.file-analyzer-tip {
  margin-top: 4px;
  font-size: 12px;
  color: @text-color-secondary;
}
</style>
