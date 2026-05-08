<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadWallpaper } from '@/api/wallpaper/wallpaper'
import { OssProviderEnum } from '@/api/oss/types'

const props = withDefaults(
  defineProps<{
    value?: string
    accept?: string
    uploadDirectory: string
    previewType: 'image' | 'video'
    placeholder?: string
  }>(),
  {
    value: '',
    accept: '',
    placeholder: '请输入资源地址'
  }
)

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const uploading = ref(false)

const modelValue = computed({
  get: () => props.value,
  set: value => emit('update:value', value || '')
})

const customRequest: UploadProps['customRequest'] = options => {
  const file = options.file as File
  const formData = new FormData()
  formData.append('file', file)
  formData.append(
    'paramJsonStr',
    JSON.stringify({
      ossProvider: OssProviderEnum.UPYUN,
      uploadDirectory: props.uploadDirectory
    })
  )

  uploading.value = true
  uploadWallpaper(formData)
    .then(res => {
      if (res.code === 200 && res.data?.url) {
        modelValue.value = res.data.url
        options.onSuccess?.(res, file)
        message.success('上传成功')
      } else {
        options.onError?.(new Error(res.message || '上传失败'))
        message.error(res.message || '上传失败')
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

<template>
  <div class="wallpaper-resource-upload">
    <a-input-group compact>
      <a-input v-model:value="modelValue" :placeholder="placeholder" allow-clear class="url-input" />
      <a-upload
        :show-upload-list="false"
        :accept="accept"
        :custom-request="customRequest"
        :disabled="uploading"
      >
        <a-button :loading="uploading">
          <template #icon>
            <UploadOutlined />
          </template>
          上传
        </a-button>
      </a-upload>
    </a-input-group>

    <div v-if="modelValue" class="preview-box">
      <a-image
        v-if="previewType === 'image'"
        :src="modelValue"
        :width="320"
        referrerpolicy="no-referrer"
      />
      <video v-else :src="modelValue" controls muted class="video-preview" />
    </div>
  </div>
</template>

<style scoped lang="less">
.wallpaper-resource-upload {
  .url-input {
    width: calc(100% - 90px);
  }

  .preview-box {
    margin-top: 10px;
  }

  .video-preview {
    width: 320px;
    height: 180px;
    object-fit: cover;
  }
}
</style>
