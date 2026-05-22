<template>
  <mythic-shop-page-search :loading="tableRef?.loading" @search="searchTable" />

  <a-alert
    v-if="uploadReport"
    :message="uploadReportTitle"
    :description="uploadReport"
    :type="uploadReportType"
    show-icon
    closable
    style="margin-bottom: 16px"
    @close="uploadReport = ''"
  />

  <pro-table
    ref="tableRef"
    header-title="神话商店数据"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1500 }"
  >
    <template #toolBarRender>
      <a-upload
        v-if="hasPermission('lol:mythic-shop:upload')"
        :show-upload-list="false"
        accept=".json,application/json"
        :custom-request="uploadJson"
        :disabled="uploading"
      >
        <a-button type="primary" :loading="uploading">
          <template #icon>
            <UploadOutlined />
          </template>
          上传 JSON
        </a-button>
      </a-upload>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'itemName'">
        <a-typography-text copyable>{{ record.itemName }}</a-typography-text>
      </template>
    </template>
  </pro-table>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import MythicShopPageSearch from './MythicShopPageSearch.vue'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { pageMythicShop, uploadMythicShopJson } from '@/api/lol/mythic-shop'
import type { MythicShopPageVO, MythicShopQO } from '@/api/lol/mythic-shop/types'

defineOptions({ name: 'MythicShopPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const uploading = ref(false)
const uploadReport = ref('')
const uploadReportType = ref<'success' | 'error'>('success')
const uploadReportTitle = computed(() =>
  uploadReportType.value === 'success' ? '神话商城上传报告' : '神话商城上传失败'
)
let searchParams: MythicShopQO = {}

const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageMythicShop({ ...pageParam, ...searchParams })
}

const searchTable = (params: MythicShopQO) => {
  searchParams = params
  reloadTable(true)
}

const uploadJson: UploadProps['customRequest'] = options => {
  const file = options.file as File
  if (!file.name.toLowerCase().endsWith('.json')) {
    message.warning('请选择 JSON 文件')
    options.onError?.(new Error('请选择 JSON 文件'))
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  uploadMythicShopJson(formData)
    .then(res => {
      if (res.code === 200) {
        uploadReportType.value = 'success'
        uploadReport.value = res.data || '处理完成'
        message.success(res.data || '处理完成')
        options.onSuccess?.(res, file)
        reloadTable(true)
      } else {
        uploadReportType.value = 'error'
        uploadReport.value = res.message || '上传失败'
        message.error(res.message || '上传失败')
        options.onError?.(new Error(res.message || '上传失败'))
      }
    })
    .catch(error => {
      uploadReportType.value = 'error'
      uploadReport.value = error?.response?.data?.message || error?.message || '上传失败'
      options.onError?.(error)
    })
    .finally(() => {
      uploading.value = false
    })
}

const columns: ProColumns<MythicShopPageVO>[] = [
  {
    title: '商品ID',
    dataIndex: 'instanceId',
    width: 180
  },
  {
    key: 'itemName',
    title: '商品名称',
    dataIndex: 'itemName',
    width: 220,
    ellipsis: true
  },
  {
    title: '分区',
    dataIndex: 'catalog',
    width: 160
  },
  {
    title: '分类',
    dataIndex: 'categoryType',
    width: 160
  },
  {
    title: '货币',
    dataIndex: 'currencyName',
    width: 120
  },
  {
    title: '原价',
    dataIndex: 'delta',
    width: 100
  },
  {
    title: '折扣',
    dataIndex: 'discountPercent',
    width: 100
  },
  {
    title: '折扣价',
    dataIndex: 'discountedDelta',
    width: 100
  },
  {
    title: '最终价',
    dataIndex: 'finalDelta',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 180,
    sorter: true
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 180,
    sorter: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    sorter: true
  }
]
</script>
