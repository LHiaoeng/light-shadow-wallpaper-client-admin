<template>
  <lol-skin-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="LOL 皮肤"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1600 }"
  >
    <template #toolBarRender>
      <new-button v-if="hasPermission('lol:skin:add')" @click="handleNew" />
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'tilePath'">
        <a-image :src="record.tilePath || record.splashPath" :width="72" />
      </template>
      <template v-if="column.key === 'name'">
        <a-typography-text copyable>{{ record.name }}</a-typography-text>
      </template>
      <template v-if="column.key === 'isPbeOnly'">
        <a-tag :color="record.isPbeOnly === 1 ? 'orange' : 'green'">
          {{ record.isPbeOnly === 1 ? '仅 PBE' : '已上线' }}
        </a-tag>
      </template>
      <template v-if="column.key === 'isLegacy'">
        <a-tag v-if="record.isLegacy === 1" color="red">绝版</a-tag>
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lol:skin:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('lol:skin:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <lol-skin-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import LolSkinPageSearch from './LolSkinPageSearch.vue'
import LolSkinFormModal from './LolSkinFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { deleteLolSkin, pageLolSkin } from '@/api/lol/skin'
import type { LolSkinPageVO, LolSkinQO } from '@/api/lol/skin/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'LolSkinPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof LolSkinFormModal>>()

let searchParams: LolSkinQO = {}

const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageLolSkin({ ...pageParam, ...searchParams })
}

const searchTable = (params: LolSkinQO) => {
  searchParams = params
  reloadTable(true)
}

const handleNew = () => {
  formModalRef.value?.open(FormAction.CREATE)
}

const handleEdit = (record: LolSkinPageVO) => {
  formModalRef.value?.open(FormAction.UPDATE, record)
}

const handleDelete = (record: LolSkinPageVO) => {
  doRequest(deleteLolSkin(record.id), {
    successMessage: '删除成功',
    onSuccess: () => reloadTable()
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
    key: 'tilePath',
    title: '预览',
    dataIndex: 'tilePath',
    width: 100
  },
  {
    title: '皮肤ID',
    dataIndex: 'riotSkinId',
    width: 130,
    sorter: true
  },
  {
    title: '英雄ID',
    dataIndex: 'championId',
    width: 100
  },
  {
    key: 'name',
    title: '名称',
    dataIndex: 'name',
    width: 180
  },
  {
    title: '英文名',
    dataIndex: 'nameEng',
    width: 180,
    ellipsis: true
  },
  {
    title: '国服稀有度',
    dataIndex: 'regionRarityId',
    width: 120
  },
  {
    title: '全球稀有度',
    dataIndex: 'rarity',
    width: 130
  },
  {
    key: 'isPbeOnly',
    title: 'PBE',
    dataIndex: 'isPbeOnly',
    width: 100
  },
  {
    key: 'isLegacy',
    title: '绝版',
    dataIndex: 'isLegacy',
    width: 90
  },
  {
    title: '皮肤系列',
    dataIndex: 'skinlineIdSets',
    width: 160,
    ellipsis: true
  },
  {
    title: '徽章',
    dataIndex: 'emblemNames',
    width: 160,
    ellipsis: true
  },
  {
    title: '上架时间',
    dataIndex: 'releaseTime',
    width: 170,
    sorter: true
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
