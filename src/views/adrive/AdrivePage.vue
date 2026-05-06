<template>
  <a-spin :spinning="loading">
    <div class="adrive-page">
      <a-card title="阿里云盘授权状态">
        <template #extra>
          <a-space wrap>
            <a-button
              v-if="hasPermission('adrive:auth:manage')"
              type="primary"
              @click="handleAuthorize"
            >
              授权阿里云盘
            </a-button>
            <a-button v-if="hasPermission('adrive:auth:manage')" @click="loadOverview">
              刷新状态
            </a-button>
            <a-button
              v-if="hasPermission('adrive:auth:manage') && tokenInfo?.status === 'enabled'"
              @click="handleRefreshToken"
            >
              刷新 Token
            </a-button>
          </a-space>
        </template>

        <a-alert
          v-if="!tokenInfo"
          type="warning"
          show-icon
          message="当前系统用户尚未绑定阿里云盘授权"
        />

        <a-descriptions v-else bordered :column="descriptionColumn">
          <a-descriptions-item label="系统用户ID">
            {{ tokenInfo.sysUserId || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="授权状态">
            <a-tag :color="tokenStatusColor">
              {{ tokenInfo.status || '-' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="阿里云盘用户">
            {{ tokenInfo.userName || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="当前 Drive">
            {{ tokenInfo.activeDriveId || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="过期时间">
            {{ tokenInfo.expireTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="最近刷新">
            {{ tokenInfo.lastRefreshTime || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card v-if="tokenInfo?.status !== 'enabled'" title="联调提示">
        <a-alert
          type="info"
          show-icon
          message="授权成功后请回到本页面，手动点击刷新状态查询最新授权结果。"
        />
      </a-card>

      <a-card v-if="hasPermission('adrive:user:read')" title="用户与 Drive 信息">
        <a-descriptions bordered :column="descriptionColumn">
          <a-descriptions-item label="用户ID">
            {{ valueText(userInfo, 'user_id') || tokenInfo?.userId || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="昵称">
            {{ valueText(userInfo, 'nick_name') || valueText(userInfo, 'user_name') || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="默认 Drive">
            {{ valueText(driveInfo, 'default_drive_id') }}
          </a-descriptions-item>
          <a-descriptions-item label="备份 Drive">
            {{ valueText(driveInfo, 'backup_drive_id') }}
          </a-descriptions-item>
          <a-descriptions-item label="资源 Drive">
            {{ valueText(driveInfo, 'resource_drive_id') }}
          </a-descriptions-item>
          <a-descriptions-item label="文件夹ID">
            {{ valueText(driveInfo, 'folder_id') }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card v-if="hasPermission('adrive:user:read')" title="空间信息">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="8">
            <a-statistic title="已用容量" :value="formatBytes(spaceUsedSize)" />
          </a-col>
          <a-col :xs="24" :md="8">
            <a-statistic title="总容量" :value="formatBytes(spaceTotalSize)" />
          </a-col>
          <a-col :xs="24" :md="8">
            <a-progress type="circle" :percent="spaceUsedPercent" />
          </a-col>
        </a-row>
      </a-card>

      <a-card v-if="hasPermission('adrive:user:read')" title="Scope 权限">
        <a-alert
          v-if="missingScopes.length > 0"
          class="scope-alert"
          type="warning"
          show-icon
          message="阿里云盘授权权限不完整，请确认开发者门户已申请权限后重新授权。"
        />
        <a-space wrap>
          <a-tag
            v-for="scope in requiredScopes"
            :key="scope"
            :color="grantedScopes.includes(scope) ? 'green' : 'red'"
          >
            {{ scope }}
          </a-tag>
        </a-space>
      </a-card>

      <a-card title="文件 API 调试">
        <template #extra>
          <a-space wrap>
            <a-button
              v-if="hasPermission('adrive:file:read')"
              :loading="fileLoading"
              @click="handleListRoot"
            >
              读取根目录
            </a-button>
            <a-button
              v-if="hasPermission('adrive:file:write')"
              :disabled="!tokenInfo?.activeDriveId"
              @click="handleCreateRootFolder"
            >
              创建根目录
            </a-button>
          </a-space>
        </template>

        <a-alert
          v-if="!tokenInfo?.activeDriveId"
          type="warning"
          show-icon
          message="缺少 activeDriveId，授权成功后才能调试文件接口。"
        />
        <a-empty v-else-if="fileList.length === 0" description="暂无文件列表数据" />
        <a-list v-else bordered :data-source="fileList">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.name || item.file_id || '-'">
                <template #description>
                  {{ item.type || '-' }} / {{ formatBytes(item.size) }}
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthorize } from '@/hooks/permission'
import { doRequest } from '@/utils/axios/request'
import { getAdriveAuthorizeUrl, getAdriveTokenInfo, refreshAdriveToken } from '@/api/adrive/auth'
import type { AdriveTokenInfo } from '@/api/adrive/auth/types'
import {
  getAdriveDriveInfo,
  getAdriveScopes,
  getAdriveSpaceInfo,
  getAdriveUserInfo
} from '@/api/adrive/user'
import type { AdriveInfoRecord } from '@/api/adrive/user'
import { createAdriveFile, listAdriveFiles } from '@/api/adrive/file'
import type { AdriveFileItem } from '@/api/adrive/file/types'

defineOptions({ name: 'AdrivePage' })

const { hasPermission } = useAuthorize()
const loading = ref(false)
const fileLoading = ref(false)
const tokenInfo = ref<AdriveTokenInfo | null>(null)
const userInfo = ref<AdriveInfoRecord>({})
const driveInfo = ref<AdriveInfoRecord>({})
const spaceInfo = ref<AdriveInfoRecord>({})
const scopesInfo = ref<AdriveInfoRecord>({})
const fileList = ref<AdriveFileItem[]>([])

const requiredScopes = ['user:base', 'file:all:read', 'file:all:write']
const descriptionColumn = { xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }

const tokenStatusColor = computed(() => {
  if (tokenInfo.value?.status === 'enabled') {
    return 'green'
  }
  if (tokenInfo.value?.status === 'expired' || tokenInfo.value?.status === 'revoked') {
    return 'red'
  }
  return 'orange'
})

const grantedScopes = computed(() => {
  const rawScopes = scopesInfo.value.scopes
  if (Array.isArray(rawScopes)) {
    return rawScopes.filter((scope): scope is string => typeof scope === 'string')
  }
  if (typeof rawScopes === 'string') {
    return rawScopes.split(/[,\s]+/).filter(Boolean)
  }
  if (tokenInfo.value?.scopes) {
    return tokenInfo.value.scopes.split(/[,\s]+/).filter(Boolean)
  }
  return []
})

const missingScopes = computed(() =>
  requiredScopes.filter(scope => !grantedScopes.value.includes(scope))
)

const personalSpaceInfo = computed(() => {
  const rawSpaceInfo = spaceInfo.value.personal_space_info
  return isRecord(rawSpaceInfo) ? rawSpaceInfo : {}
})

const spaceUsedSize = computed(() => toNumber(personalSpaceInfo.value.used_size))
const spaceTotalSize = computed(() => toNumber(personalSpaceInfo.value.total_size))
const spaceUsedPercent = computed(() => {
  const totalSize = spaceTotalSize.value
  return totalSize > 0 ? Number(((spaceUsedSize.value / totalSize) * 100).toFixed(2)) : 0
})

const loadTokenInfo = async () => {
  const res = await getAdriveTokenInfo()
  tokenInfo.value = res.data
}

const loadUserInfo = async () => {
  const res = await getAdriveUserInfo()
  userInfo.value = res.data || {}
}

const loadDriveInfo = async () => {
  const res = await getAdriveDriveInfo()
  driveInfo.value = res.data || {}
}

const loadSpaceInfo = async () => {
  const res = await getAdriveSpaceInfo()
  spaceInfo.value = res.data || {}
}

const loadScopes = async () => {
  const res = await getAdriveScopes()
  scopesInfo.value = res.data || {}
}

const loadOverview = async () => {
  loading.value = true
  try {
    fileList.value = []
    await loadTokenInfo()
    if (tokenInfo.value?.status === 'enabled') {
      await Promise.all([loadUserInfo(), loadDriveInfo(), loadSpaceInfo(), loadScopes()])
    } else {
      userInfo.value = {}
      driveInfo.value = {}
      spaceInfo.value = {}
      scopesInfo.value = {}
    }
  } finally {
    loading.value = false
  }
}

const handleAuthorize = async () => {
  const res = await getAdriveAuthorizeUrl()
  const authorizeUrl = res.data?.authorizeUrl
  if (!authorizeUrl) {
    message.error('获取阿里云盘授权地址失败')
    return
  }
  window.open(authorizeUrl, '_blank')
  message.info('授权完成后请回到本页面，点击刷新状态')
}

const handleRefreshToken = () => {
  doRequest(refreshAdriveToken(), {
    successMessage: '刷新成功！',
    onSuccess: () => loadOverview()
  })
}

const handleListRoot = async () => {
  if (!tokenInfo.value?.activeDriveId) {
    message.warning('缺少 activeDriveId')
    return
  }
  fileLoading.value = true
  try {
    const res = await listAdriveFiles({
      drive_id: tokenInfo.value.activeDriveId,
      parent_file_id: 'root',
      limit: 10,
      type: 'all',
      fields: '*'
    })
    fileList.value = res.data?.items || []
  } finally {
    fileLoading.value = false
  }
}

const handleCreateRootFolder = () => {
  if (!tokenInfo.value?.activeDriveId) {
    message.warning('缺少 activeDriveId')
    return
  }
  doRequest(
    createAdriveFile({
      drive_id: tokenInfo.value.activeDriveId,
      parent_file_id: 'root',
      name: 'LightShadowWallpaper',
      type: 'folder',
      check_name_mode: 'refuse'
    }),
    {
      successMessage: '创建目录成功！',
      onSuccess: () => handleListRoot()
    }
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : 0
  }
  return 0
}

function valueText(record: AdriveInfoRecord, key: string) {
  const value = record[key]
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

function formatBytes(size?: number) {
  if (size === undefined || size === null) {
    return '-'
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = size
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value = value / 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

onMounted(() => {
  loadOverview()
})
</script>

<style lang="less" scoped>
.adrive-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scope-alert {
  margin-bottom: 12px;
}
</style>
