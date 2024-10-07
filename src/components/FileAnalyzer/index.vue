<script lang="ts">
import { defineComponent, ref } from 'vue'
import { WallpaperUrlDTO } from '@/api/wallpaper/wallpaperUrl/types'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'FileAnalyzer',
  props: {},
  emits: ['update:fileInfo'],
  setup(props, { emit }) {
    const fileUrl = ref<string>('')

    const fileInfo = ref<WallpaperUrlDTO>(null)
    const analyzeLoading = ref<boolean>(false)

    watch(fileInfo, newValue => {
      emit('update:fileInfo', newValue)
    })

    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const files = target.files

      if (files && files.length > 0) {
        const file = files[0]
        await analyzeFile(file)
      }
    }

    function getCleanUrl(url: string): string {
      // 查找 "@" 字符的位置
      const atIndex = url.indexOf('@')

      // 如果找到 "@"，返回去掉格式的 URL；否则返回原 URL
      return atIndex !== -1 ? url.substring(0, atIndex) : url
    }

    const addFileUrl = () => {
      if (!fileUrl.value) return
      fileInfo.value = {
        url: getCleanUrl(fileUrl.value),
        poster: fileUrl.value.indexOf('@') !== -1 ? fileUrl.value : ''
      }
    }

    const loadFromUrl = async () => {
      if (fileUrl.value) {
        try {
          analyzeLoading.value = true
          const response = await fetch(fileUrl.value)
          const blob = await response.blob()
          await analyzeFile(blob, fileUrl.value)
        } catch (error) {
          analyzeLoading.value = false
          console.error('无法加载文件:', error)
          message.error(error.message)
        }
      }
    }

    const analyzeFile = async (file: Blob, url?: string) => {
      const fileType = file.type
      const fileSize = file.size

      const info: WallpaperUrlDTO = {
        fileType: fileType.startsWith('image/') ? 1 : 2,
        size: fileSize,
        url: url
      }

      if (fileType.startsWith('image/')) {
        const img = new Image()
        img.src = url || URL.createObjectURL(file)
        img.onload = () => {
          info.width = img.width
          info.height = img.height
          fileInfo.value = info
          analyzeLoading.value = false
        }
      } else if (fileType.startsWith('video/')) {
        const video = document.createElement('video')
        video.src = url || URL.createObjectURL(file)

        video.onloadedmetadata = () => {
          // 视频分辨率
          info.width = video.videoWidth
          info.height = video.videoHeight
          info.duration = video.duration
          fileInfo.value = info
          analyzeLoading.value = false
        }
      } else {
        fileInfo.value = info // 处理其他类型文件
      }
    }

    return {
      fileInfo,
      fileUrl,
      analyzeLoading,
      handleFileUpload,
      loadFromUrl,
      addFileUrl
    }
  }
})
</script>

<template>
  <div>
    <a-form>
      <a-form-item>
        <a-textarea v-model:value="fileUrl" placeholder="请输入文件URL" auto-size allow-clear />
      </a-form-item>
      <a-form-item>
        <!--        <a-button type="primary" block :loading="analyzeLoading" @click="loadFromUrl">-->
        <!--          <MonitorOutlined />-->
        <!--          加载URL文件-->
        <!--        </a-button>-->
        <a-button type="primary" block @click="addFileUrl">
          <FileAddOutlined />
          新增源
        </a-button>
      </a-form-item>
    </a-form>

    <!--    <div v-if="fileInfo">-->
    <!--      <h3>文件信息:</h3>-->
    <!--      <p>类型: {{ fileInfo.fileType }}</p>-->
    <!--      <p>大小: {{ fileInfo.size }} bytes</p>-->
    <!--      <p>分辨率: {{ fileInfo.width }} x {{ fileInfo.height }}</p>-->
    <!--      <p v-if="fileInfo.duration">时长: {{ fileInfo.duration }} 秒</p>-->
    <!--    </div>-->
  </div>
</template>

<style scoped lang="less"></style>
