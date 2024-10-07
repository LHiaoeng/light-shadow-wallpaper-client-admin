<template>
  <!-- 查询表单 -->
  <universe-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="宇宙表"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1000 }"
  >
    <!-- 操作按钮区域 -->
    <template #toolBarRender>
      <new-button v-if="hasPermission('universe-data:universe-data:add')" @click="handleNew" />
    </template>

    <!-- 数据表格区域 -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('universe-data:universe-data:edit')" @click="handleEdit(record)"
            >编辑</a
          >
          <delete-text-button
            v-if="hasPermission('universe-data:universe-data:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <!-- 系统配置新建修改的表单弹窗 -->
  <universe-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import UniversePageSearch from './UniversePageSearch.vue'
import UniverseFormModal from './UniverseFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { pageUniverse, deleteUniverse } from '@/api/universe/universe-data'
import type { UniversePageVO, UniverseQO } from '@/api/universe/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'UniversePage' })

// 鉴权方法
const { hasPermission } = useAuthorize()

// 表格组件引用
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof UniverseFormModal>>()

/* 刷新表格 */
const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

// 查询参数
let searchParams: UniverseQO = {}

/* 远程加载表格数据 */
const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageUniverse({ ...pageParam, ...searchParams })
}

/* 查询宇宙表 */
const searchTable = (params: UniverseQO) => {
  searchParams = params
  reloadTable(true) // 会调用 tableRequest
}

/* 新建宇宙表 */
const handleNew = () => {
  formModalRef.value.open(FormAction.CREATE)
}

/* 编辑宇宙表 */
const handleEdit = (record: UniversePageVO) => {
  formModalRef.value.open(FormAction.UPDATE, record)
}

/* 删除宇宙表 */
const handleDelete = (record: UniversePageVO) => {
  doRequest(deleteUniverse(record.id), {
    successMessage: '删除成功！',
    onSuccess: () => reloadTable()
  })
}

const columns: ProColumns[] = [
  {
    title: '#',
    dataIndex: 'id'
  },
  {
    title: '英雄联盟宇宙id',
    dataIndex: 'lolUniverseId'
  },
  {
    title: '属于该宇宙的英雄联盟皮肤系列id集合。用英文逗号分隔',
    dataIndex: 'lolSkinlineIdSets'
  },
  {
    title: '名称',
    dataIndex: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description'
  },
  {
    title: '图片地址',
    dataIndex: 'imagePath'
  },
  {
    title: '所属品牌',
    dataIndex: 'brand'
  },
  {
    title: '英文名称',
    dataIndex: 'engName'
  },
  {
    title: '英文描述',
    dataIndex: 'engDescription'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    sorter: true
  },
  {
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 100
  }
]
</script>
