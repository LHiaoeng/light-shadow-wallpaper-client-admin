<template>
  <game-version-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="游戏版本管理"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1200 }"
  >
    <template #toolBarRender>
      <a-space>
        <new-button v-if="hasPermission('lol:game-ver:add')" @click="handleNew" />
        <a-popconfirm
          v-if="hasPermission('lol:game-ver:sync')"
          title="确认同步最新游戏版本吗？"
          ok-text="确认"
          cancel-text="取消"
          :disabled="syncLoading"
          @confirm="handleSync"
        >
          <a-button type="primary" :loading="syncLoading">同步版本</a-button>
        </a-popconfirm>
      </a-space>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'cnPatchUrl'">
        <a-tooltip :title="record.cnPatchUrl">
          <a :href="record.cnPatchUrl" target="_blank" rel="noopener noreferrer">查看国服公告</a>
        </a-tooltip>
      </template>
      <template v-if="column.key === 'globalPatchUrl'">
        <a-tooltip :title="record.globalPatchUrl">
          <a :href="record.globalPatchUrl" target="_blank" rel="noopener noreferrer">
            查看直营服公告
          </a>
        </a-tooltip>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lol:game-ver:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('lol:game-ver:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <game-version-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import type { ProColumns } from '#/table'
import ProTable from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import { deleteGameVersion, pageGameVersion, syncGameVersion } from '@/api/lol/gameVersion'
import type { GameVersionPageVO, GameVersionQO } from '@/api/lol/gameVersion/types'
import { DeleteTextButton, NewButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { FormAction } from '@/hooks/form'
import { useAuthorize } from '@/hooks/permission'
import { doRequest } from '@/utils/axios/request'
import { mergePageParam } from '@/utils/page-utils'
import GameVersionFormModal from './GameVersionFormModal.vue'
import GameVersionPageSearch from './GameVersionPageSearch.vue'

defineOptions({ name: 'GameVersionPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof GameVersionFormModal>>()
const syncLoading = ref(false)
let searchParams: GameVersionQO = {}

const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

const tableRequest: TableRequest = async (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageGameVersion({ ...pageParam, ...searchParams })
}

const searchTable = (params: GameVersionQO) => {
  searchParams = params
  reloadTable(true)
}

const handleNew = () => {
  formModalRef.value?.open(FormAction.CREATE)
}

const handleEdit = (record: GameVersionPageVO) => {
  formModalRef.value?.open(FormAction.UPDATE, record)
}

const handleDelete = (record: GameVersionPageVO) => {
  doRequest(deleteGameVersion(record.id), {
    successMessage: '删除成功',
    onSuccess: () => reloadTable()
  })
}

const handleSync = () => {
  syncLoading.value = true
  doRequest(syncGameVersion(), {
    successMessage: '同步任务已开始，请稍后刷新查看结果',
    onSuccess: () => reloadTable(),
    onFinally: () => {
      syncLoading.value = false
    }
  })
}

const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'id',
    width: 80,
    customRender: ({ index }) => index + 1
  },
  {
    title: '游戏版本',
    dataIndex: 'gameVer',
    width: 130
  },
  {
    key: 'cnPatchUrl',
    title: '国服版本公告',
    dataIndex: 'cnPatchUrl',
    width: 180
  },
  {
    key: 'globalPatchUrl',
    title: '直营服版本公告',
    dataIndex: 'globalPatchUrl',
    width: 180
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 180
  },
  {
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 120,
    fixed: 'right'
  }
]
</script>
