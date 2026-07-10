<template>
  <a-modal
    title="导出文档"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitting"
    ok-text="导出"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-alert :message="scopeMessage" type="info" show-icon style="margin-bottom: 20px" />

    <a-form :model="formModel" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
      <a-form-item label="文档类型" required>
        <a-radio-group v-model:value="formModel.templateType" @change="resetDefaultTitle">
          <a-radio-button value="BLOG_POST">博客更新</a-radio-button>
          <a-radio-button value="AI_VIDEO_SCRIPT">AI 视频脚本</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="文件格式" required>
        <a-radio-group v-model:value="formModel.fileFormat">
          <a-radio-button value="MARKDOWN">Markdown</a-radio-button>
          <a-radio-button value="DOCX">Word</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="语言">
        <a-checkbox v-model:checked="englishVersion" @change="handleLanguageChange">
          导出英文版本
        </a-checkbox>
        <div class="field-hint">
          {{ englishVersion ? '英文优先，缺失时回退中文' : '中文优先，缺失时回退英文' }}
        </div>
      </a-form-item>

      <a-form-item label="文档标题">
        <a-input v-model:value="formModel.title" :maxlength="160" :placeholder="titlePlaceholder" />
      </a-form-item>

      <a-form-item
        v-if="formModel.templateType === 'AI_VIDEO_SCRIPT'"
        label="素材展示时长"
        required
      >
        <a-input-number
          v-model:value="formModel.slideDurationSeconds"
          :min="1"
          :precision="0"
          style="width: 160px"
        />
        <span class="input-suffix">秒/素材</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { exportPrestigeChromaDocument } from '@/api/lol/prestigeChroma'
import type {
  PrestigeChromaExportDTO,
  PrestigeChromaFileFormat,
  PrestigeChromaQO,
  PrestigeChromaTemplateType
} from '@/api/lol/prestigeChroma/types'
import { remoteFileDownload } from '@/utils/file-utils'
import type { AxiosResponse } from 'axios'

interface OpenOptions {
  selectedIds: number[]
  query: PrestigeChromaQO
  total: number
  gameVersion?: string
}

const visible = ref(false)
const submitting = ref(false)
const englishVersion = ref(false)
const selectedIds = ref<number[]>([])
const currentQuery = ref<PrestigeChromaQO>({})
const filteredTotal = ref(0)
const gameVersion = ref('')

const formModel = reactive<{
  templateType: PrestigeChromaTemplateType
  fileFormat: PrestigeChromaFileFormat
  title: string
  slideDurationSeconds: number
}>({
  templateType: 'BLOG_POST',
  fileFormat: 'DOCX',
  title: '',
  slideDurationSeconds: 5
})

const scopeMessage = computed(() =>
  selectedIds.value.length > 0
    ? `已选择 ${selectedIds.value.length} 项，仅导出选中项`
    : `按当前筛选条件导出全部，共 ${filteredTotal.value} 项`
)

const defaultTitle = () => {
  if (formModel.templateType === 'AI_VIDEO_SCRIPT') {
    return englishVersion.value ? 'Prestige Chroma Slideshow Script' : '臻彩皮肤轮播脚本'
  }
  if (!gameVersion.value) {
    return ''
  }
  return englishVersion.value
    ? `League of Legends Patch ${gameVersion.value} New China Exclusive Chroma Splash Arts Update`
    : `英雄联盟${gameVersion.value}版本臻彩皮肤更新`
}

const titlePlaceholder = computed(() =>
  formModel.title ? '' : '留空时根据实际导出数据的游戏版本自动生成'
)

const resetDefaultTitle = () => {
  formModel.title = defaultTitle()
}

const handleLanguageChange = () => {
  resetDefaultTitle()
}

const open = (options: OpenOptions) => {
  selectedIds.value = [...options.selectedIds]
  currentQuery.value = { ...options.query }
  filteredTotal.value = options.total
  gameVersion.value = normalizeGameVersion(options.gameVersion)
  englishVersion.value = false
  formModel.templateType = 'BLOG_POST'
  formModel.fileFormat = 'DOCX'
  formModel.slideDurationSeconds = 5
  resetDefaultTitle()
  visible.value = true
}

const handleClose = () => {
  if (submitting.value) return
  visible.value = false
}

const handleSubmit = async () => {
  const title = formModel.title.trim()
  if (
    formModel.templateType === 'AI_VIDEO_SCRIPT' &&
    (!Number.isInteger(formModel.slideDurationSeconds) || formModel.slideDurationSeconds <= 0)
  ) {
    message.warning('素材展示时长必须为正整数')
    return
  }
  if (selectedIds.value.length === 0 && filteredTotal.value <= 0) {
    message.warning('当前筛选条件下没有可导出的臻彩皮肤')
    return
  }

  const dto: PrestigeChromaExportDTO = {
    scope: selectedIds.value.length > 0 ? 'SELECTED' : 'FILTERED',
    templateType: formModel.templateType,
    fileFormat: formModel.fileFormat,
    language: englishVersion.value ? 'EN_US' : 'ZH_CN'
  }
  if (title) {
    dto.title = title
  }
  if (dto.scope === 'SELECTED') {
    dto.ids = selectedIds.value
  } else {
    dto.query = currentQuery.value
  }
  if (dto.templateType === 'AI_VIDEO_SCRIPT') {
    dto.slideDurationSeconds = formModel.slideDurationSeconds
  }

  submitting.value = true
  try {
    const response = await exportPrestigeChromaDocument(dto)
    remoteFileDownload(response, resolveFilename(response, dto))
    message.success('文档导出成功')
    visible.value = false
  } finally {
    submitting.value = false
  }
}

const normalizeGameVersion = (version?: string) => {
  return version?.trim().replace(/^Ver\s*/i, '') || ''
}

const resolveFilename = (response: AxiosResponse<Blob>, dto: PrestigeChromaExportDTO) => {
  const disposition = response.headers['content-disposition'] || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (filenameMatch?.[1]) {
    return decodeURIComponent(filenameMatch[1])
  }
  const templateName = dto.templateType === 'BLOG_POST' ? '博客更新' : 'AI视频脚本'
  const languageName = dto.language === 'EN_US' ? 'English' : '中文'
  const extension = dto.fileFormat === 'DOCX' ? 'docx' : 'md'
  return `臻彩皮肤-${templateName}-${languageName}.${extension}`
}

defineExpose({ open })
</script>

<style scoped>
.field-hint {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  line-height: 20px;
}

.input-suffix {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
