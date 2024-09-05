<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import type { WallpaperDTO } from '@/api/wallpaper/wallpaper/types'
import { message, type UploadChangeParam, type UploadProps } from 'ant-design-vue'

const { title, visible, openModal, closeModal } = useModal()

const submitLoading = ref(false)

const handleChange = (info: UploadChangeParam) => {
  const status = info.file.status
  if (status !== 'uploading') {
    console.log(info.file, info.fileList)
  }
  if (status === 'done') {
    message.success(`${info.file.name} file uploaded successfully.`)
  } else if (status === 'error') {
    message.error(`${info.file.name} file upload failed.`)
  }
}

const fileList = ref([])
const handleDrop = (e: DragEvent) => {
  console.log(e)
}

const beforeUpload: UploadProps['beforeUpload'] = file => {
  console.log(file)
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const img: HTMLImageElement = document.createElement('img')
      img.src = reader.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        ctx.fillStyle = 'red'
        ctx.textBaseline = 'middle'
        ctx.font = '33px Arial'
        ctx.fillText('Ant Design Vue', 20, 20)
        canvas.toBlob(resolve)
      }
    }
  })
}

const handleSubmit = () => {}

/* 弹窗关闭方法 */
const handleClose = () => {
  closeModal()
  submitLoading.value = false
}

defineExpose({
  open(record?: WallpaperDTO) {
    openModal()
    title.value = '壁纸地址管理'
  }
})
</script>

<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="true"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      :before-upload="beforeUpload"
      @change="handleChange"
      @drop="handleDrop"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">Click or drag file to this area to upload</p>
      <p class="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
        band files
      </p>
    </a-upload-dragger>
  </a-modal>
</template>

<style scoped lang="less"></style>
