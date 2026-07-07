<template>
  <prestige-chroma-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="臻彩皮肤管理"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 2300 }"
  >
    <template #toolBarRender>
      <a-space>
        <new-button v-if="hasPermission('lol:prestige-chroma:add')" @click="handleNew" />
        <a-button
          v-if="hasPermission('lol:prestige-chroma:sync')"
          type="primary"
          :loading="syncLoading"
          @click="handleSync"
        >
          同步臻彩
        </a-button>
      </a-space>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'itemName'">
        <a-typography-text copyable>{{ record.itemName }}</a-typography-text>
      </template>
      <template v-if="column.key === 'sourceSkinName'">
        <a-typography-text copyable>{{ record.sourceSkinName || '-' }}</a-typography-text>
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
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import PrestigeChromaPageSearch from './PrestigeChromaPageSearch.vue'
import PrestigeChromaFormModal from './PrestigeChromaFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import {
  deletePrestigeChroma,
  pagePrestigeChroma,
  syncPrestigeChroma
} from '@/api/lol/prestigeChroma'
import type { PrestigeChromaPageVO, PrestigeChromaQO } from '@/api/lol/prestigeChroma/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'PrestigeChromaPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof PrestigeChromaFormModal>>()
const syncLoading = ref(false)

let searchParams: PrestigeChromaQO = {}

const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  if (!pageParam.sort || pageParam.sort.length === 0) {
    pageParam.sort = ['rank,desc', 'skin_id,desc']
  }
  return pagePrestigeChroma({ ...pageParam, ...searchParams })
}

const searchTable = (params: PrestigeChromaQO) => {
  searchParams = params
  reloadTable(true)
}

const handleNew = () => {
  formModalRef.value?.open(FormAction.CREATE)
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

const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'id',
    width: 70,
    customRender: ({ index }) => index + 1
  },
  {
    title: '版本',
    dataIndex: 'gameVer',
    width: 110
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
    key: 'itemName',
    title: '臻彩名称',
    dataIndex: 'itemName',
    width: 210,
    ellipsis: true
  },
  {
    title: '臻彩英文',
    dataIndex: 'itemNameEng',
    width: 220,
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
    title: '分类',
    dataIndex: 'categoryName',
    width: 120,
    ellipsis: true
  },
  {
    title: '标签ID',
    dataIndex: 'tagId',
    width: 110
  },
  {
    title: '排序',
    dataIndex: 'rank',
    width: 90,
    sorter: true
  },
  {
    key: 'isNew',
    title: '新增',
    dataIndex: 'isNew',
    width: 90
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
