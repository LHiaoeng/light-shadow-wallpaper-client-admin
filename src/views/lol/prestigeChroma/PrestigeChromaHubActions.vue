<template>
  <a-dropdown :trigger="['click']">
    <a-button :loading="loading">
      <template #icon><CloudDownloadOutlined /></template>
      展示站数据
      <DownOutlined />
    </a-button>
    <template #overlay>
      <a-menu>
        <a-menu-item @click="downloadJson">导出 JSON 文件</a-menu-item>
        <a-menu-item @click="openWriteModal">写入指定文件夹</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>

  <a-modal
    title="写入指定文件夹"
    :visible="writeModalVisible"
    :confirm-loading="loading"
    :mask-closable="false"
    ok-text="写入"
    cancel-text="取消"
    @ok="writeToDirectory"
    @cancel="writeModalVisible = false"
  >
    <a-input v-model:value="directory" placeholder="请输入服务器文件夹地址" />
  </a-modal>
</template>

<script setup lang="ts">
import { CloudDownloadOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { downloadPrestigeChromaHubJson, writePrestigeChromaHubJson } from '@/api/lol/prestigeChroma'
import { fileDownload } from '@/utils/file-utils'

const loading = ref(false)
const writeModalVisible = ref(false)
const filename = 'prestige-chromas.json'
const defaultDirectory = 'D:\\WebstormProjects\\lol-prestige-chroma-hub\\data\\'
const directory = ref(defaultDirectory)

const downloadJson = async () => {
  loading.value = true
  try {
    const blob = await downloadPrestigeChromaHubJson()
    fileDownload(blob, filename)
    message.success(`已导出 ${filename}`)
  } finally {
    loading.value = false
  }
}

const openWriteModal = () => {
  directory.value = defaultDirectory
  writeModalVisible.value = true
}

const writeToDirectory = async () => {
  const targetDirectory = directory.value.trim()
  if (!targetDirectory) {
    message.warning('请输入服务器文件夹地址')
    return
  }

  loading.value = true
  try {
    const result = await writePrestigeChromaHubJson(targetDirectory)
    if (result.code !== 200) {
      message.warning(result.message)
      return
    }
    writeModalVisible.value = false
    message.success(`已写入 ${filename}`)
  } finally {
    loading.value = false
  }
}
</script>
