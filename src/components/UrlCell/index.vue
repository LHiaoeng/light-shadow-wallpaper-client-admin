<script setup lang="ts">
import { message } from 'ant-design-vue'

interface Props {
  url?: string
  copyTitle?: string
}

// Props
const props = withDefaults(defineProps<Props>(), {
  copyTitle: '复制网址'
})

// Copy to Clipboard Function
const copyToClipboard = (url: string): void => {
  // Fallback method using a temporary textarea element
  const fallbackCopyTextToClipboard = (text: string): void => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed' // Avoid scrolling to the bottom of the page in MS Edge.
    textArea.style.opacity = '0' // Make the textarea invisible

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        message.success('网址已复制到剪贴板')
      } else {
        message.error('复制失败')
      }
    } catch (err: any) {
      console.error('Fallback: Oops, unable to copy', err)
      message.error('复制失败')
    }

    document.body.removeChild(textArea)
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success('网址已复制到剪贴板')
      })
      .catch((err: any) => {
        console.error('Failed to copy text: ', err)
        message.error('复制失败')
      })
  } else {
    fallbackCopyTextToClipboard(url)
  }
}
</script>

<script lang="ts">
export default {
  name: 'UrlCell'
}
</script>

<template>
  <div>
    <a-button v-if="url" type="text" :title="copyTitle" @click="copyToClipboard(url)">
      <template #icon>
        <copy-outlined />
      </template>
    </a-button>
    <a :href="url" target="_blank" :title="url" referrerpolicy="no-referrer">
      {{ url }}
    </a>
  </div>
</template>

<style scoped lang="less"></style>
