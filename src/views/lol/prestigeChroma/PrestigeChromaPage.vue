<template>
  <prestige-chroma-page-search ref="searchRef" :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="臻彩皮肤管理"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 2900 }"
    :row-selection="{ selectedRowKeys, onChange: handleSelectionChange }"
  >
    <template #tableAlertOptionRender="{ intl, onCleanSelected, selectedRowKeys: selectedKeys }">
      <a-space :size="16">
        <a
          v-if="hasPermission('lol:prestige-chroma:edit')"
          @click="handleOpenBatchModal(selectedKeys, onCleanSelected)"
        >
          批量设置
        </a>
        <a @click="handleCleanSelected(onCleanSelected)">
          {{ intl.getMessage('alert.clear', '清空') }}
        </a>
      </a-space>
    </template>

    <template #toolBarRender>
      <a-space>
        <a-button
          v-if="hasPermission('lol:prestige-chroma:export')"
          :disabled="currentTotal === 0"
          @click="handleOpenExportModal"
        >
          <template #icon><DownloadOutlined /></template>
          导出文档
        </a-button>
        <a-button
          v-if="hasPermission('lol:prestige-chroma:export')"
          :disabled="currentTotal === 0"
          @click="handleOpenImageDownloadModal"
        >
          <template #icon><DownloadOutlined /></template>
          下载图片
        </a-button>
        <prestige-chroma-hub-actions v-if="hasPermission('lol:prestige:hub-download')" />
        <a-button v-if="hasPermission('lol:prestige:r2-sync')" @click="handleOpenR2SyncModal">
          同步资源到 R2
        </a-button>
        <new-button v-if="hasPermission('lol:prestige-chroma:add')" @click="handleNew" />
        <a-popconfirm
          v-if="hasPermission('lol:prestige-chroma:sync')"
          title="确认开始同步臻彩数据吗？"
          ok-text="确认"
          cancel-text="取消"
          :disabled="syncLoading"
          @confirm="handleSync"
        >
          <a-button type="primary" :loading="syncLoading">同步臻彩</a-button>
        </a-popconfirm>
      </a-space>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'chromaImage'">
        <img
          v-if="record.instanceId"
          class="chroma-image"
          :src="getChromaImageUrl(record.instanceId)"
          :alt="record.itemName || '臻彩图片'"
          @click="handleOpenChromaPreview(record)"
        />
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'itemName'">
        <a-typography-text copyable class="name-text">
          {{ record.itemName || '-' }}
        </a-typography-text>
      </template>
      <template v-if="column.key === 'itemNameEng'">
        <a-typography-text copyable class="name-text">
          {{ record.itemNameEng || '-' }}
        </a-typography-text>
      </template>
      <template v-if="column.key === 'colors'">
        <chroma-color-circle :colors="record.colors" />
      </template>
      <template v-if="column.key === 'sourceSkinName'">
        <a-typography-text copyable>{{ record.sourceSkinName || '-' }}</a-typography-text>
      </template>
      <template v-if="column.key === 'categoryName'">
        <a-popover v-if="record.tagImgUrl" placement="right" trigger="hover">
          <template #content>
            <img
              class="category-icon-preview"
              :src="record.tagImgUrl"
              :alt="record.categoryName || '分类图标'"
            />
          </template>
          <a-space :size="6">
            <img
              class="category-icon"
              :src="record.tagImgUrl"
              :alt="record.categoryName || '分类图标'"
            />
            <span>{{ record.categoryName || '-' }}</span>
          </a-space>
        </a-popover>
        <span v-else-if="record.categoryName">{{ record.categoryName }}</span>
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'isNew'">
        <a-tag :color="record.isNew === 1 ? 'orange' : 'default'">
          {{ record.isNew === 1 ? '新增' : '否' }}
        </a-tag>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lol:prestige-chroma:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('lol:prestige-chroma:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <prestige-chroma-form-modal ref="formModalRef" @submit-success="reloadTable" />
  <prestige-chroma-export-modal ref="exportModalRef" />
  <prestige-chroma-image-download-modal ref="imageDownloadModalRef" />
  <prestige-chroma-r2-sync-modal ref="r2SyncModalRef" />

  <a-image
    v-if="chromaPreviewUrl"
    :src="chromaPreviewUrl"
    :preview="{
      visible: chromaPreviewVisible,
      onVisibleChange: handleChromaPreviewVisibleChange
    }"
    :style="{ display: 'none' }"
  />

  <a-modal
    title="批量设置"
    :visible="batchModalVisible"
    :mask-closable="false"
    :confirm-loading="batchSubmitLoading"
    @ok="handleBatchSubmit"
    @cancel="handleBatchClose"
  >
    <a-form :model="batchFormModel" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="选中数量">
        <span>{{ batchSelectedIds.length }}</span>
      </a-form-item>
      <a-form-item label="游戏版本" required>
        <a-input v-model:value="batchFormModel.gameVer" placeholder="例如 Ver 26.13" />
      </a-form-item>
      <a-form-item label="是否新增" required>
        <a-select v-model:value="batchFormModel.isNew">
          <a-select-option :value="1">是</a-select-option>
          <a-select-option :value="0">否</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import { message } from 'ant-design-vue'
import PrestigeChromaPageSearch from './PrestigeChromaPageSearch.vue'
import PrestigeChromaFormModal from './PrestigeChromaFormModal.vue'
import PrestigeChromaExportModal from './PrestigeChromaExportModal.vue'
import PrestigeChromaImageDownloadModal from './PrestigeChromaImageDownloadModal.vue'
import PrestigeChromaHubActions from './PrestigeChromaHubActions.vue'
import ChromaColorCircle from '@/components/ChromaColorCircle/index.vue'
import PrestigeChromaR2SyncModal from './PrestigeChromaR2SyncModal.vue'
import { snapshotPrestigeChromaQuery } from './prestigeChromaDownloadState'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import {
  batchUpdatePrestigeChromaBasic,
  deletePrestigeChroma,
  pagePrestigeChroma,
  syncPrestigeChroma
} from '@/api/lol/prestigeChroma'
import type { PrestigeChromaPageVO, PrestigeChromaQO } from '@/api/lol/prestigeChroma/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'PrestigeChromaPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const searchRef = ref<InstanceType<typeof PrestigeChromaPageSearch>>()
const formModalRef = ref<InstanceType<typeof PrestigeChromaFormModal>>()
const exportModalRef = ref<InstanceType<typeof PrestigeChromaExportModal>>()
const imageDownloadModalRef = ref<InstanceType<typeof PrestigeChromaImageDownloadModal>>()
const r2SyncModalRef = ref<InstanceType<typeof PrestigeChromaR2SyncModal>>()
const syncLoading = ref(false)
const batchModalVisible = ref(false)
const batchSubmitLoading = ref(false)
const batchSelectedIds = ref<number[]>([])
const chromaPreviewVisible = ref(false)
const chromaPreviewUrl = ref('')
const selectedRowKeys = ref<Array<number | string>>([])
const selectedRows = ref<PrestigeChromaPageVO[]>([])
const currentTotal = ref(0)
const batchFormModel = reactive({
  gameVer: '',
  isNew: 1
})
let cleanSelectedRows: (() => void) | undefined

let searchParams: PrestigeChromaQO = {}

const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

const clearSelectedRows = () => {
  selectedRowKeys.value = []
  selectedRows.value = []
}

const tableRequest: TableRequest = async (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  const result = await pagePrestigeChroma({ ...pageParam, ...searchParams })
  currentTotal.value = result.data.total
  clearSelectedRows()
  return result
}

const searchTable = (params: PrestigeChromaQO) => {
  searchParams = snapshotPrestigeChromaQuery(params)
  reloadTable(true)
}

const handleNew = () => {
  formModalRef.value?.open(FormAction.CREATE)
}

const handleSelectionChange = (keys: Array<number | string>, rows: PrestigeChromaPageVO[]) => {
  selectedRowKeys.value = keys
  selectedRows.value = rows
}

const handleCleanSelected = (onCleanSelected: () => void) => {
  onCleanSelected()
  clearSelectedRows()
}

const handleOpenExportModal = () => {
  const ids = selectedRowKeys.value.map(Number).filter(id => Number.isFinite(id))
  exportModalRef.value?.open({
    selectedIds: ids,
    query: { ...searchParams },
    total: currentTotal.value,
    gameVersion: resolveExportGameVersion(ids)
  })
}

const handleOpenImageDownloadModal = () => {
  const ids = selectedRowKeys.value.map(Number).filter(id => Number.isFinite(id))
  imageDownloadModalRef.value?.open({
    selectedIds: ids,
    query: searchRef.value?.getQuery() ?? snapshotPrestigeChromaQuery(searchParams),
    total: currentTotal.value
  })
}

const handleOpenR2SyncModal = () => {
  const ids = selectedRows.value
    .map(row => row.instanceId?.trim())
    .filter((instanceId): instanceId is string => Boolean(instanceId))
  r2SyncModalRef.value?.open({ instanceIds: ids.length > 0 ? ids : undefined })
}

const resolveExportGameVersion = (ids: number[]) => {
  if (ids.length === 0) {
    return searchParams.gameVer
  }
  const versions = [
    ...new Set(
      selectedRows.value
        .map(row => row.gameVer?.trim())
        .filter((version): version is string => Boolean(version))
    )
  ]
  return versions.length === 1 ? versions[0] : undefined
}

const handleEdit = (record: PrestigeChromaPageVO) => {
  formModalRef.value?.open(FormAction.UPDATE, record)
}

const handleDelete = (record: PrestigeChromaPageVO) => {
  doRequest(deletePrestigeChroma(record.id), {
    successMessage: '删除成功',
    onSuccess: () => reloadTable()
  })
}

const handleSync = () => {
  syncLoading.value = true
  doRequest(syncPrestigeChroma(), {
    successMessage: '同步任务已开始，请稍后刷新查看结果',
    onFinally: () => {
      syncLoading.value = false
    }
  })
}

const handleOpenBatchModal = (
  selectedRowKeys: Array<number | string>,
  onCleanSelected: () => void
) => {
  const ids = selectedRowKeys.map(Number).filter(id => Number.isFinite(id))
  if (ids.length === 0) {
    message.warning('请选择需要批量设置的臻彩皮肤')
    return
  }

  batchSelectedIds.value = ids
  batchFormModel.gameVer = ''
  batchFormModel.isNew = 1
  cleanSelectedRows = onCleanSelected
  batchModalVisible.value = true
}

const handleBatchClose = () => {
  batchModalVisible.value = false
  batchSubmitLoading.value = false
}

const handleBatchSubmit = () => {
  if (!batchFormModel.gameVer?.trim()) {
    message.warning('请输入游戏版本')
    return
  }

  batchSubmitLoading.value = true
  doRequest(
    batchUpdatePrestigeChromaBasic({
      ids: batchSelectedIds.value,
      gameVer: batchFormModel.gameVer.trim(),
      isNew: batchFormModel.isNew
    }),
    {
      successMessage: '批量设置成功',
      onSuccess: () => {
        handleBatchClose()
        cleanSelectedRows?.()
        clearSelectedRows()
        reloadTable()
      },
      onFinally: () => {
        batchSubmitLoading.value = false
      }
    }
  )
}

const getChromaImageUrl = (instanceId: string) => {
  return `https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site5-${instanceId}.jpg`
}

const getChromaPreviewImageUrl = (instanceId: string) => {
  return `https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site3-${instanceId}.jpg`
}

const handleOpenChromaPreview = (record: PrestigeChromaPageVO) => {
  if (!record.instanceId) {
    return
  }
  chromaPreviewUrl.value = getChromaPreviewImageUrl(record.instanceId)
  chromaPreviewVisible.value = true
}

const handleChromaPreviewVisibleChange = (visible: boolean) => {
  chromaPreviewVisible.value = visible
}

const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'id',
    width: 70,
    customRender: ({ index }) => index + 1
  },
  {
    key: 'rankSort',
    title: '排序',
    dataIndex: 'rank',
    width: 90,
    sorter: true
  },
  {
    key: 'chromaImage',
    title: '图片',
    dataIndex: 'instanceId',
    width: 96
  },
  {
    key: 'colors',
    title: '炫彩颜色',
    dataIndex: 'colors',
    width: 100,
    align: 'center'
  },
  {
    key: 'categoryName',
    title: '分类',
    dataIndex: 'categoryName',
    width: 150,
    ellipsis: true
  },
  {
    key: 'itemName',
    title: '臻彩名称',
    dataIndex: 'itemName',
    width: 260,
    ellipsis: true
  },
  {
    title: '游戏版本',
    dataIndex: 'gameVer',
    width: 110
  },
  {
    key: 'isNew',
    title: '是否新增',
    dataIndex: 'isNew',
    width: 90
  },
  {
    key: 'itemNameEng',
    title: '臻彩名称英文',
    dataIndex: 'itemNameEng',
    width: 260,
    ellipsis: true
  },
  {
    title: '中文描述',
    dataIndex: 'description',
    width: 300,
    ellipsis: true
  },
  {
    title: '英文描述',
    dataIndex: 'descriptionEng',
    width: 320,
    ellipsis: true
  },
  {
    title: '英雄ID',
    dataIndex: 'heroId',
    width: 90
  },
  {
    title: '英雄',
    dataIndex: 'heroName',
    width: 140,
    ellipsis: true
  },
  {
    title: '英雄英文',
    dataIndex: 'heroNameEng',
    width: 150,
    ellipsis: true
  },
  {
    title: '臻彩ID',
    dataIndex: 'skinId',
    width: 110,
    sorter: true
  },
  {
    title: '实例ID',
    dataIndex: 'instanceId',
    width: 230,
    ellipsis: true
  },
  {
    title: '原皮ID',
    dataIndex: 'sourceSkinId',
    width: 110
  },
  {
    key: 'sourceSkinName',
    title: '原皮名称',
    dataIndex: 'sourceSkinName',
    width: 210,
    ellipsis: true
  },
  {
    title: '原皮英文',
    dataIndex: 'sourceSkinNameEng',
    width: 220,
    ellipsis: true
  },
  {
    title: '原皮套装ID_set',
    dataIndex: 'sourceSkinSkinlineIdSet',
    width: 170,
    ellipsis: true
  },
  {
    title: '原皮宇宙ID_set',
    dataIndex: 'sourceSkinUniverseIdSet',
    width: 170,
    ellipsis: true
  },
  {
    title: '标签ID',
    dataIndex: 'tagId',
    width: 110
  },
  {
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 110,
    fixed: 'right'
  }
]
</script>

<style scoped>
.chroma-image {
  display: block;
  width: 56px;
  height: 56px;
  overflow: hidden;
  object-fit: cover;
  object-position: top;
  vertical-align: middle;
  cursor: pointer;
}

.name-text {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  vertical-align: middle;
}

.category-icon-preview {
  max-width: 160px;
  max-height: 160px;
  object-fit: contain;
}
</style>
