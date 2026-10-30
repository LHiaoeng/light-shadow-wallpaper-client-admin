<template>
  <a-card :bordered="false">
    <a-form layout="inline" :model="searchParams" @keyup.enter="searchTable">
      <a-form-item :label="rawI18nText('customer.username')">
        <a-input
          v-model:value="searchParams.username"
          allow-clear
          :placeholder="rawI18nText('customer.usernamePlaceholder')"
        />
      </a-form-item>
      <a-form-item :label="rawI18nText('customer.nickname')">
        <a-input
          v-model:value="searchParams.nickname"
          allow-clear
          :placeholder="rawI18nText('customer.nicknamePlaceholder')"
        />
      </a-form-item>
      <a-form-item>
        <search-actions
          :loading="tableRef?.loading"
          :collapsible="false"
          @search="searchTable"
          @reset="resetSearch"
        />
      </a-form-item>
    </a-form>

    <pro-table
      ref="tableRef"
      :header-title="rawI18nText('customer.title')"
      row-key="userId"
      :columns="columns"
      :request="tableRequest"
      :scroll="{ x: 700 }"
    >
      <template #toolBarRender>
        <new-button v-if="hasPermission('system:customer:manage')" @click="openCreate" />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'default'">
            {{
              record.status === 1
                ? rawI18nText('customer.statusNormal')
                : rawI18nText('customer.statusLocked')
            }}
          </a-tag>
        </template>
      </template>
    </pro-table>
  </a-card>

  <a-modal
    :title="rawI18nText('customer.createTitle')"
    :visible="createVisible"
    :confirm-loading="createLoading"
    :mask-closable="false"
    :ok-text="rawI18nText('customer.create')"
    @ok="submitCreate"
    @cancel="closeCreate"
  >
    <a-form layout="vertical">
      <a-form-item :label="rawI18nText('customer.username')" required>
        <a-input v-model:value="createForm.username" maxlength="64" autocomplete="off" />
      </a-form-item>
      <a-form-item :label="rawI18nText('customer.nickname')" required>
        <a-input v-model:value="createForm.nickname" maxlength="64" autocomplete="off" />
      </a-form-item>
      <a-alert :message="rawI18nText('customer.createNotice')" type="info" show-icon />
    </a-form>
  </a-modal>

  <a-modal
    :title="rawI18nText('customer.createdTitle')"
    :visible="resultVisible"
    :mask-closable="false"
    :footer="null"
    @cancel="confirmClearResult"
  >
    <a-alert
      :message="rawI18nText('customer.deliveryNotice')"
      type="warning"
      show-icon
      style="margin-bottom: 20px"
    />
    <a-form layout="vertical">
      <a-form-item :label="rawI18nText('customer.username')">
        <a-input :value="createdUsername" readonly />
      </a-form-item>
      <a-form-item :label="rawI18nText('customer.temporaryPassword')">
        <a-input :value="temporaryPassword" readonly autocomplete="off" />
      </a-form-item>
      <a-form-item :label="rawI18nText('customer.recipient')" required>
        <a-input
          v-model:value="recipient"
          maxlength="255"
          :placeholder="rawI18nText('customer.recipientPlaceholder')"
        />
      </a-form-item>
    </a-form>
    <div class="result-actions">
      <a-button @click="confirmClearResult">{{
        rawI18nText('customer.clearWithoutDelivery')
      }}</a-button>
      <a-button
        type="primary"
        :loading="deliveryLoading"
        :disabled="!recipient.trim()"
        @click="submitDelivery"
      >
        {{ rawI18nText('customer.delivered') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns, ProTableInstanceExpose, TableRequest } from '#/table'
import { Modal, message } from 'ant-design-vue'
import { createCustomer, pageCustomers, recordCustomerDelivery } from '@/api/system/customer'
import type { CustomerPageQuery } from '@/api/system/customer/types'
import { useAuthorize } from '@/hooks/permission'
import { NewButton } from '@/components/Button'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { useAdminI18n } from '@/hooks/i18n'
import dayjs from 'dayjs'

defineOptions({ name: 'CustomerUserPage' })

const { hasPermission } = useAuthorize()
const { rawI18nText } = useAdminI18n()
const tableRef = ref<ProTableInstanceExpose>()
const searchParams = reactive<CustomerPageQuery>({ username: '', nickname: '' })
const createForm = reactive({ username: '', nickname: '' })
const createVisible = ref(false)
const createLoading = ref(false)
const resultVisible = ref(false)
const deliveryLoading = ref(false)
const createdUserId = ref<number>()
const createdUsername = ref('')
const temporaryPassword = ref('')
const recipient = ref('')

const columns: ProColumns[] = [
  { title: rawI18nText('customer.username'), dataIndex: 'username' },
  { title: rawI18nText('customer.nickname'), dataIndex: 'nickname' },
  { title: rawI18nText('customer.status'), dataIndex: 'status', key: 'status', width: 100 },
  {
    title: rawI18nText('customer.createTime'),
    dataIndex: 'createTime',
    width: 190,
    customRender: ({ value }) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '')
  }
]

const tableRequest: TableRequest = (params, sorter, filter) => {
  return pageCustomers({ ...mergePageParam(params, sorter, filter), ...searchParams })
}

const reloadTable = (resetPageIndex = false) => tableRef.value?.actionRef?.reload(resetPageIndex)

const searchTable = () => reloadTable(true)

const resetSearch = () => {
  searchParams.username = ''
  searchParams.nickname = ''
  searchTable()
}

const openCreate = () => {
  createForm.username = ''
  createForm.nickname = ''
  createVisible.value = true
}

const closeCreate = () => {
  createVisible.value = false
  createForm.username = ''
  createForm.nickname = ''
}

const submitCreate = () => {
  const username = createForm.username.trim()
  const nickname = createForm.nickname.trim()
  if (!username || !nickname) {
    message.warning(rawI18nText('customer.usernameNicknameRequired'))
    return
  }
  createLoading.value = true
  doRequest(createCustomer({ username, nickname }), {
    successMessage: false,
    onSuccess: response => {
      createdUserId.value = response.data.userId
      createdUsername.value = username
      temporaryPassword.value = response.data.temporaryPassword
      recipient.value = ''
      closeCreate()
      resultVisible.value = true
      reloadTable(true)
    },
    onFinally: () => (createLoading.value = false)
  })
}

const clearResult = () => {
  resultVisible.value = false
  createdUserId.value = undefined
  createdUsername.value = ''
  temporaryPassword.value = ''
  recipient.value = ''
}

const confirmClearResult = () => {
  Modal.confirm({
    title: rawI18nText('customer.confirmClearTitle'),
    content: rawI18nText('customer.confirmClearContent'),
    okText: rawI18nText('customer.confirmClear'),
    cancelText: rawI18nText('customer.continueViewing'),
    onOk: clearResult
  })
}

const submitDelivery = () => {
  if (!createdUserId.value || !recipient.value.trim()) return
  deliveryLoading.value = true
  doRequest(recordCustomerDelivery(createdUserId.value, { recipient: recipient.value.trim() }), {
    successMessage: false,
    onSuccess: () => {
      message.success(rawI18nText('customer.deliverySaved'))
      clearResult()
    },
    onFinally: () => (deliveryLoading.value = false)
  })
}
</script>

<style scoped>
.result-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
