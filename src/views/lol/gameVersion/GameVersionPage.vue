<template>
  <game-version-page-search :loading="tableRef?.loading" @search="searchTable" />

  <a-card :bordered="false" class="cd-version-card" title="CommunityDragon 版本状态">
    <template #extra>
      <a-button size="small" :loading="cdVersionLoading" @click="loadCdVersionStatus">
        刷新
      </a-button>
    </template>
    <a-spin :spinning="cdVersionLoading">
      <a-row :gutter="[16, 16]">
        <a-col v-for="item in cdVersionItems" :key="item.version" :xs="24" :md="12">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="环境">
              {{ item.version === 'latest' ? 'Latest 正式服' : 'PBE 测试服' }}
            </a-descriptions-item>
            <a-descriptions-item label="源站版本">
              {{ item.sourceVersion || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="Redis 版本">
              {{ item.redisVersion || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="同步状态">
              <a-tag :color="item.consistent ? 'success' : 'error'">
                {{ item.consistent ? '一致' : '不一致' }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>
      <a-empty v-if="!cdVersionLoading && cdVersionItems.length === 0" description="暂无版本状态" />
    </a-spin>
  </a-card>

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
import {
  deleteGameVersion,
  getCdContentVersionStatus,
  pageGameVersion,
  syncGameVersion
} from '@/api/lol/gameVersion'
import type {
  CdContentVersionItem,
  GameVersionPageVO,
  GameVersionQO
} from '@/api/lol/gameVersion/types'
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
const cdVersionLoading = ref(false)
const cdVersionItems = ref<CdContentVersionItem[]>([])
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

const loadCdVersionStatus = () => {
  cdVersionLoading.value = true
  doRequest(getCdContentVersionStatus(), {
    onSuccess: res => {
      cdVersionItems.value = res.data.items
    },
    onFinally: () => {
      cdVersionLoading.value = false
    }
  })
}

onMounted(loadCdVersionStatus)

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

<style scoped>
.cd-version-card {
  margin-bottom: 16px;
}
</style>
