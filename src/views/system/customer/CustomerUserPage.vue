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
        <template v-else-if="column.key === 'actions' && hasPermission('system:customer:manage')">
          <a-space>
            <a-button type="link" size="small" @click="confirmResetPassword(record)">
              {{ rawI18nText('customer.resetPassword') }}
            </a-button>
            <a-button type="link" size="small" @click="confirmStatusChange(record)">
              {{
                record.status === 1
                  ? rawI18nText('customer.freeze')
                  : rawI18nText('customer.unfreeze')
              }}
            </a-button>
          </a-space>
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
      <a-form-item :label="rawI18nText('customer.password')" required>
        <a-input-password v-model:value="createForm.password" autocomplete="new-password" />
      </a-form-item>
      <a-alert :message="rawI18nText('customer.createNotice')" type="info" show-icon />
    </a-form>
  </a-modal>

  <a-modal
    :title="rawI18nText('customer.resetPasswordTitle')"
    :visible="resetVisible"
    :confirm-loading="resetLoading"
    :mask-closable="false"
    :ok-text="rawI18nText('customer.resetPassword')"
    @ok="submitResetPassword"
    @cancel="closeResetPassword"
  >
    <a-form layout="vertical">
      <a-form-item :label="rawI18nText('customer.password')" required>
        <a-input-password v-model:value="resetPassword" autocomplete="new-password" />
      </a-form-item>
      <a-alert :message="rawI18nText('customer.resetPasswordNotice')" type="info" show-icon />
    </a-form>
  </a-modal>

  <a-modal
    :title="rawI18nText(resultTitle)"
    :visible="resultVisible"
    :mask-closable="false"
    :footer="null"
    @cancel="clearResult"
  >
    <a-alert
      :message="rawI18nText('customer.resultNotice')"
      type="info"
      show-icon
      style="margin-bottom: 20px"
    />
    <a-form layout="vertical">
      <a-form-item :label="rawI18nText('customer.username')">
        <a-typography-text copyable>{{ createdUsername }}</a-typography-text>
      </a-form-item>
      <a-form-item :label="rawI18nText('customer.password')">
        <a-typography-text copyable>{{ resultPassword }}</a-typography-text>
      </a-form-item>
    </a-form>
    <div class="result-actions">
      <a-button type="primary" @click="clearResult">
        {{ rawI18nText('customer.close') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns, ProTableInstanceExpose, TableRequest } from '#/table'
import { Modal, message } from 'ant-design-vue'
import {
  createCustomer,
  freezeCustomer,
  pageCustomers,
  resetCustomerPassword,
  unfreezeCustomer
} from '@/api/system/customer'
import type { CustomerPageQuery, CustomerPageVO } from '@/api/system/customer/types'
import { useAuthorize } from '@/hooks/permission'
import { NewButton } from '@/components/Button'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { useAdminI18n } from '@/hooks/i18n'
import dayjs from 'dayjs'
import { passEncrypt } from '@/utils/password-utils'

defineOptions({ name: 'CustomerUserPage' })

const { hasPermission } = useAuthorize()
const { rawI18nText } = useAdminI18n()
const tableRef = ref<ProTableInstanceExpose>()
const searchParams = reactive<CustomerPageQuery>({ username: '', nickname: '' })
const createForm = reactive({ username: '', nickname: '', password: '123456' })
const createVisible = ref(false)
const createLoading = ref(false)
const resetVisible = ref(false)
const resetLoading = ref(false)
const resetTarget = ref<CustomerPageVO>()
const resetPassword = ref('123456')
const resultVisible = ref(false)
const createdUsername = ref('')
const resultPassword = ref('')
const resultTitle = ref('customer.createdTitle')

const columns: ProColumns[] = [
  { title: rawI18nText('customer.username'), dataIndex: 'username' },
  { title: rawI18nText('customer.nickname'), dataIndex: 'nickname' },
  { title: rawI18nText('customer.status'), dataIndex: 'status', key: 'status', width: 100 },
  {
    title: rawI18nText('customer.createTime'),
    dataIndex: 'createTime',
    width: 190,
    customRender: ({ value }) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '')
  },
  { title: rawI18nText('customer.actions'), key: 'actions', width: 200 }
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
  createForm.password = '123456'
  createVisible.value = true
}

const closeCreate = () => {
  createVisible.value = false
  createForm.username = ''
  createForm.nickname = ''
  createForm.password = '123456'
}

const submitCreate = () => {
  const username = createForm.username.trim()
  const nickname = createForm.nickname.trim()
  const password = createForm.password
  if (!username || !nickname || !password) {
    message.warning(rawI18nText('customer.createRequired'))
    return
  }
  createLoading.value = true
  doRequest(createCustomer({ username, nickname, password: passEncrypt(password) }), {
    successMessage: false,
    onSuccess: () => {
      createdUsername.value = username
      resultPassword.value = password
      resultTitle.value = 'customer.createdTitle'
      closeCreate()
      resultVisible.value = true
      reloadTable(true)
    },
    onFinally: () => (createLoading.value = false)
  })
}

const confirmResetPassword = (record: CustomerPageVO) => {
  resetTarget.value = record
  resetPassword.value = '123456'
  resetVisible.value = true
}

const closeResetPassword = () => {
  resetVisible.value = false
  resetTarget.value = undefined
  resetPassword.value = ''
}

const submitResetPassword = () => {
  const target = resetTarget.value
  const password = resetPassword.value
  if (!target || !password) {
    message.warning(rawI18nText('customer.passwordRequired'))
    return
  }
  resetLoading.value = true
  doRequest(resetCustomerPassword(target.userId, { password: passEncrypt(password) }), {
    successMessage: false,
    onSuccess: () => {
      createdUsername.value = target.username
      resultPassword.value = password
      resultTitle.value = 'customer.resetPasswordResultTitle'
      closeResetPassword()
      resultVisible.value = true
    },
    onFinally: () => (resetLoading.value = false)
  })
}

const confirmStatusChange = (record: CustomerPageVO) => {
  const freeze = record.status === 1
  Modal.confirm({
    title: rawI18nText(freeze ? 'customer.freezeTitle' : 'customer.unfreezeTitle'),
    content: rawI18nText(freeze ? 'customer.freezeNotice' : 'customer.unfreezeNotice'),
    okText: rawI18nText(freeze ? 'customer.freeze' : 'customer.unfreeze'),
    cancelText: rawI18nText('customer.cancel'),
    onOk: () =>
      new Promise<void>((resolve, reject) => {
        doRequest(freeze ? freezeCustomer(record.userId) : unfreezeCustomer(record.userId), {
          successMessage: false,
          onSuccess: () => {
            message.success(rawI18nText(freeze ? 'customer.frozen' : 'customer.unfrozen'))
            reloadTable()
            resolve()
          },
          onFail: () => reject(new Error()),
          onError: reject
        })
      })
  })
}

const clearResult = () => {
  resultVisible.value = false
  createdUsername.value = ''
  resultPassword.value = ''
}
</script>

<style scoped>
.result-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
