<template>
  <a-card :bordered="false">
    <template #title>云顶商城数据</template>
    <template #extra>
      <a-upload
        v-if="hasPermission('lol:tft-shop:upload')"
        :show-upload-list="false"
        accept=".json,application/json"
        :custom-request="uploadJson"
        :disabled="uploading"
      >
        <a-button type="primary" :loading="uploading">
          <template #icon>
            <UploadOutlined />
          </template>
          上传 JSON
        </a-button>
      </a-upload>
    </template>

    <a-empty v-if="!formattedJson" description="上传 JSON 后显示处理结果" />
    <a-typography-paragraph v-else copyable>
      <pre class="json-preview">{{ formattedJson }}</pre>
    </a-typography-paragraph>
  </a-card>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { useAuthorize } from '@/hooks/permission'
import { uploadTftShopJson } from '@/api/lol/tft-shop'

defineOptions({ name: 'TFTShopPage' })

const { hasPermission } = useAuthorize()
const uploading = ref(false)
const formattedJson = ref('')

const uploadJson: UploadProps['customRequest'] = options => {
  const file = options.file as File
  if (!file.name.toLowerCase().endsWith('.json')) {
    message.warning('请选择 JSON 文件')
    options.onError?.(new Error('请选择 JSON 文件'))
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  uploadTftShopJson(formData)
    .then(res => {
      if (res.code === 200) {
        formattedJson.value = res.data || ''
        message.success('处理完成')
        options.onSuccess?.(res, file)
      } else {
        message.error(res.message || '上传失败')
        options.onError?.(new Error(res.message || '上传失败'))
      }
    })
    .catch(error => {
      options.onError?.(error)
    })
    .finally(() => {
      uploading.value = false
    })
}
</script>

<style scoped lang="less">
.json-preview {
  max-height: 640px;
  margin: 0;
  padding: 16px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f6f8fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
</style>
