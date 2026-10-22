<template>
  <a-modal
    title="批量修改"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    :ok-button-props="{ disabled: !canSubmit }"
    :width="640"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-alert :message="summaryText" type="info" show-icon style="margin-bottom: 16px" />

    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="标题链接">
        <div class="field-row">
          <a-input
            v-model:value="formModel.titleLink"
            :disabled="clearState.titleLink"
            placeholder="留空则不修改"
            allow-clear
          />
          <a-checkbox :checked="clearState.titleLink" @change="e => handleClearChange('titleLink', e)">
            清空
          </a-checkbox>
        </div>
        <div v-if="clearState.titleLink" class="field-hint">清空后前台标题将不可点击</div>
      </a-form-item>

      <a-form-item label="上线时间">
        <div class="field-row">
          <a-date-picker
            v-model:value="formModel.launchTime"
            :disabled="clearState.launchTime"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="留空则不修改"
            style="width: 100%"
          />
          <a-checkbox
            :checked="clearState.launchTime"
            @change="e => handleClearChange('launchTime', e)"
          >
            清空
          </a-checkbox>
        </div>
        <div v-if="clearState.launchTime" class="field-hint">
          清空后该壁纸失去上架时间排序依据；下架请改壁纸状态
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { ColProps } from 'ant-design-vue'
import { doRequest } from '@/utils/axios/request'
import { batchUpdateWallpaper } from '@/api/wallpaper/wallpaper'
import type { WallpaperClearableField } from '@/api/wallpaper/wallpaper/types'

defineOptions({ name: 'WallpaperBatchUpdateModal' })

const labelCol: ColProps = {
  sm: { span: 24 },
  md: { span: 5 }
}

const wrapperCol: ColProps = {
  sm: { span: 24 },
  md: { span: 18 }
}

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const visible = ref(false)
const submitLoading = ref(false)
const selectedIds = ref<number[]>([])

const formModel = reactive<{ titleLink?: string; launchTime?: string }>({
  titleLink: undefined,
  launchTime: undefined
})

// 勾选后该字段置空、输入框禁用，两种意图在界面上物理互斥
const clearState = reactive<Record<WallpaperClearableField, boolean>>({
  titleLink: false,
  launchTime: false
})

const canSubmit = computed(() =>
  Boolean(
    clearState.titleLink || clearState.launchTime || formModel.titleLink?.trim() || formModel.launchTime
  )
)

const summaryText = computed(() => {
  const prefix = `已选 ${selectedIds.value.length} 条`
  const changes: string[] = []
  if (clearState.titleLink) {
    changes.push('标题链接 → 清空')
  } else if (formModel.titleLink?.trim()) {
    changes.push(`标题链接 → ${formModel.titleLink.trim()}`)
  }
  if (clearState.launchTime) {
    changes.push('上线时间 → 清空')
  } else if (formModel.launchTime) {
    changes.push(`上线时间 → ${formModel.launchTime}`)
  }
  return changes.length
    ? `${prefix}，将修改：${changes.join('；')}`
    : `${prefix}，还没有要修改的内容：请填写字段，或勾选右侧「清空」`
})

/* 勾选清空时清掉已输入的值，避免界面上残留一条不会生效的内容 */
const handleClearChange = (field: WallpaperClearableField, e: Event) => {
  const checked = Boolean((e.target as HTMLInputElement | null)?.checked)
  clearState[field] = checked
  if (checked) {
    formModel[field] = undefined
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) {
    message.warning('请填写字段或勾选「清空」后再提交')
    return
  }

  const clearFields: WallpaperClearableField[] = []
  if (clearState.titleLink) {
    clearFields.push('titleLink')
  }
  if (clearState.launchTime) {
    clearFields.push('launchTime')
  }

  const selectedCount = selectedIds.value.length
  submitLoading.value = true
  doRequest(
    batchUpdateWallpaper({
      ids: selectedIds.value,
      titleLink: clearState.titleLink ? undefined : formModel.titleLink?.trim() || undefined,
      launchTime: clearState.launchTime ? undefined : formModel.launchTime || undefined,
      clearFields: clearFields.length ? clearFields : undefined
    }),
    {
      onSuccess: res => {
        closeModal()
        emits('submit-success')
        const affected = res.data ?? 0
        const missed = selectedCount - affected
        if (missed > 0) {
          message.warning(`已修改 ${affected} 条，${missed} 条未匹配到记录（可能已删除）`)
        } else {
          message.success(`已修改 ${affected} 条`)
        }
      },
      onFinally: () => {
        submitLoading.value = false
      }
    }
  )
}

const resetForm = () => {
  formModel.titleLink = undefined
  formModel.launchTime = undefined
  clearState.titleLink = false
  clearState.launchTime = false
  submitLoading.value = false
}

const closeModal = () => {
  visible.value = false
  resetForm()
}

const handleClose = () => {
  closeModal()
}

defineExpose({
  open(ids: number[]) {
    selectedIds.value = ids
    resetForm()
    visible.value = true
  }
})
</script>

<style scoped>
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.field-hint {
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  line-height: 20px;
}
</style>
