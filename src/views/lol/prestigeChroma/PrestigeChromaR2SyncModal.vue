<template>
  <a-modal
    title="同步臻彩图片到 Cloudflare R2"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitting"
    :ok-button-props="{ disabled: Boolean(task) }"
    ok-text="开始同步"
    cancel-text="关闭"
    width="820px"
    @ok="submit"
    @cancel="close"
  >
    <a-alert :message="scopeMessage" type="info" show-icon style="margin-bottom: 16px" />
    <a-checkbox v-if="!task" v-model:checked="force">
      强制覆盖已存在对象，并精确清理对应公开 URL 缓存
    </a-checkbox>

    <template v-if="task">
      <a-descriptions bordered size="small" :column="3" style="margin-top: 16px">
        <a-descriptions-item label="状态">{{ statusText(task.status) }}</a-descriptions-item>
        <a-descriptions-item label="臻彩">{{ task.chromaTotal }}</a-descriptions-item>
        <a-descriptions-item label="资产">{{ task.assetTotal }}</a-descriptions-item>
        <a-descriptions-item label="已处理">{{ task.processed }}</a-descriptions-item>
        <a-descriptions-item label="已上传">{{ task.uploaded }}</a-descriptions-item>
        <a-descriptions-item label="已跳过">{{ task.skipped }}</a-descriptions-item>
        <a-descriptions-item label="失败">{{ task.failed }}</a-descriptions-item>
        <a-descriptions-item label="强制覆盖">{{ task.force ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="范围">{{
          task.scope === 'ALL' ? '全部' : '选中项'
        }}</a-descriptions-item>
      </a-descriptions>
      <a-progress
        style="margin-top: 16px"
        :percent="progressPercent"
        :status="task.status === 'FAILED' ? 'exception' : terminal ? 'success' : 'active'"
      />
      <a-alert
        v-if="task.message"
        :message="task.message"
        type="error"
        show-icon
        style="margin-top: 12px"
      />
      <a-table
        v-if="task.failureDetails.length"
        style="margin-top: 16px"
        size="small"
        row-key="objectKey"
        :pagination="false"
        :data-source="task.failureDetails"
        :columns="failureColumns"
        :scroll="{ x: 720, y: 240 }"
      />
      <a-typography-text v-if="task.failureDetailsTruncated" type="warning">
        失败明细已截断，仅展示前 200 条。
      </a-typography-text>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { message, Modal } from 'ant-design-vue'
import {
  createPrestigeChromaR2SyncTask,
  getPrestigeChromaR2SyncTask
} from '@/api/lol/prestigeChroma'
import type {
  PrestigeChromaR2Task,
  PrestigeChromaR2TaskStatus
} from '@/api/lol/prestigeChroma/types'

interface OpenOptions {
  instanceIds?: string[]
}

const visible = ref(false)
const submitting = ref(false)
const force = ref(false)
const instanceIds = ref<string[]>()
const task = ref<PrestigeChromaR2Task>()
let pollTimer: ReturnType<typeof setTimeout> | undefined
let activeTaskId = ''

const terminalStatuses: PrestigeChromaR2TaskStatus[] = [
  'SUCCEEDED',
  'COMPLETED_WITH_ERRORS',
  'FAILED'
]
const terminal = computed(() => Boolean(task.value && terminalStatuses.includes(task.value.status)))
const scopeMessage = computed(() =>
  instanceIds.value?.length ? `勾选 ${instanceIds.value.length} 条，仅同步选中项` : '同步全部数据'
)
const progressPercent = computed(() => {
  if (!task.value?.assetTotal) return terminal.value ? 100 : 0
  return Math.min(100, Math.round((task.value.processed / task.value.assetTotal) * 100))
})
const failureColumns = [
  { title: '实例 ID', dataIndex: 'instanceId', width: 160 },
  { title: '资产', dataIndex: 'assetType', width: 90 },
  { title: '阶段', dataIndex: 'stage', width: 110 },
  { title: '对象键', dataIndex: 'objectKey', width: 230, ellipsis: true },
  { title: '原因', dataIndex: 'message', width: 260, ellipsis: true }
]

const open = (options: OpenOptions) => {
  stopPolling()
  instanceIds.value = options.instanceIds?.length ? [...new Set(options.instanceIds)] : undefined
  force.value = false
  task.value = undefined
  activeTaskId = ''
  visible.value = true
}

const submit = () => {
  Modal.confirm({
    title: force.value ? '确认强制覆盖 R2 图片？' : '确认开始同步 R2 图片？',
    content: scopeMessage.value,
    okText: '确认',
    cancelText: '取消',
    onOk: createTask
  })
}

const createTask = async () => {
  submitting.value = true
  try {
    const result = await createPrestigeChromaR2SyncTask({
      instanceIds: instanceIds.value,
      force: force.value
    })
    if (result.code !== 200) {
      message.warning(result.message)
      return
    }
    activeTaskId = result.data.taskId
    task.value = {
      ...result.data,
      force: force.value,
      scope: instanceIds.value ? 'SELECTED' : 'ALL',
      chromaTotal: 0,
      assetTotal: 0,
      processed: 0,
      uploaded: 0,
      skipped: 0,
      failed: 0,
      failureDetails: [],
      failureDetailsTruncated: false
    }
    schedulePoll(0)
  } finally {
    submitting.value = false
  }
}

const schedulePoll = (delay = 2000) => {
  stopTimerOnly()
  pollTimer = setTimeout(poll, delay)
}

const poll = async () => {
  const taskId = activeTaskId
  if (!taskId || !visible.value) return
  try {
    const result = await getPrestigeChromaR2SyncTask(taskId)
    if (taskId !== activeTaskId || !visible.value) return
    if (result.code !== 200) {
      message.warning(result.message)
      stopPolling()
      return
    }
    task.value = result.data
    if (!terminalStatuses.includes(result.data.status)) {
      schedulePoll()
    }
  } catch {
    if (taskId === activeTaskId && visible.value) schedulePoll()
  }
}

const close = () => {
  visible.value = false
  stopPolling()
}

const stopTimerOnly = () => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = undefined
}

const stopPolling = () => {
  stopTimerOnly()
  activeTaskId = ''
}

const statusText = (status: PrestigeChromaR2TaskStatus) =>
  ({
    PENDING: '等待执行',
    RUNNING: '执行中',
    SUCCEEDED: '成功',
    COMPLETED_WITH_ERRORS: '完成但有失败项',
    FAILED: '任务失败'
  }[status])

onBeforeUnmount(stopPolling)
defineExpose({ open })
</script>
