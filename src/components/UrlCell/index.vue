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
const copyToClipboard = (url: string) => {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      message.success('网址已复制到剪贴板')
    })
    .catch(() => {
      message.error('复制失败')
    })
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
    <a :href="url" target="_blank" :title="url">
      {{ url }}
    </a>
  </div>
</template>

<style scoped lang="less"></style>
