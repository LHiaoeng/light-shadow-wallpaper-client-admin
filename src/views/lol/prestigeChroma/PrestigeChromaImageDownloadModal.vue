<template>
  <a-modal
    title="下载图片"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitting"
    ok-text="下载"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-alert :message="scopeMessage" type="info" show-icon style="margin-bottom: 20px" />

    <a-form :model="formModel" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
      <a-form-item label="图片资源" required>
        <a-checkbox-group v-model:value="formModel.assetTypes">
          <a-space direction="vertical">
            <a-checkbox value="LARGE">大图</a-checkbox>
            <a-checkbox value="MEDIUM">中图</a-checkbox>
            <a-checkbox value="SMALL">小图</a-checkbox>
            <a-checkbox value="CATEGORY_ICON">臻彩分类图标</a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-form-item>

      <a-form-item label="文件名语言" required>
        <a-radio-group v-model:value="formModel.language">
          <a-radio-button value="ZH_CN">中文</a-radio-button>
          <a-radio-button value="EN_US">英文</a-radio-button>
        </a-radio-group>
        <div class="field-hint">英文名称缺失时，该图片完整回退为中文文件名</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { downloadPrestigeChromaImages } from '@/api/lol/prestigeChroma'
import type {
  PrestigeChromaImageAssetType,
  PrestigeChromaImageDownloadDTO,
  PrestigeChromaImageFilenameLanguage,
  PrestigeChromaQO
} from '@/api/lol/prestigeChroma/types'
import { remoteFileDownload } from '@/utils/file-utils'
import type { AxiosResponse } from 'axios'

interface OpenOptions {
  selectedIds: number[]
  query: PrestigeChromaQO
  total: number
}

const visible = ref(false)
const submitting = ref(false)
const selectedIds = ref<number[]>([])
const currentQuery = ref<PrestigeChromaQO>({})
const filteredTotal = ref(0)
const formModel = reactive<{
  assetTypes: PrestigeChromaImageAssetType[]
  language: PrestigeChromaImageFilenameLanguage
}>({
  assetTypes: ['LARGE'],
  language: 'ZH_CN'
})

const scopeMessage = computed(() =>
  selectedIds.value.length > 0
    ? `已选择 ${selectedIds.value.length} 项，仅下载选中项`
    : `按当前筛选条件下载全部，共 ${filteredTotal.value} 项`
)

const open = (options: OpenOptions) => {
  selectedIds.value = [...new Set(options.selectedIds)]
  currentQuery.value = { ...options.query }
  filteredTotal.value = options.total
  formModel.assetTypes = ['LARGE']
  formModel.language = 'ZH_CN'
  visible.value = true
}

const handleClose = () => {
  if (submitting.value) return
  visible.value = false
}

const handleSubmit = async () => {
  if (formModel.assetTypes.length === 0) {
    message.warning('至少选择一种图片资源')
    return
  }
  if (selectedIds.value.length === 0 && filteredTotal.value <= 0) {
    message.warning('当前筛选条件下没有可下载的臻彩皮肤')
    return
  }

  const dto: PrestigeChromaImageDownloadDTO = {
    scope: selectedIds.value.length > 0 ? 'SELECTED' : 'FILTERED',
    assetTypes: [...formModel.assetTypes],
    language: formModel.language
  }
  if (dto.scope === 'SELECTED') {
    dto.ids = selectedIds.value
  } else {
    dto.query = currentQuery.value
  }

  submitting.value = true
  try {
    const response = await downloadPrestigeChromaImages(dto)
    remoteFileDownload(response, resolveFilename(response))
    message.success('图片下载成功')
    visible.value = false
  } finally {
    submitting.value = false
  }
}

const resolveFilename = (response: AxiosResponse<Blob>) => {
  const disposition = response.headers['content-disposition'] || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i)
  return filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : '臻彩图片.zip'
}

defineExpose({ open })
</script>

<style scoped>
.field-hint {
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  line-height: 20px;
}
</style>
