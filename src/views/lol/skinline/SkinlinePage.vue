<template>
  <!-- 查询表单 -->
  <skinline-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="英雄联盟皮肤系列"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1000 }"
  >
    <!-- 操作按钮区域 -->
    <template #toolBarRender>
      <new-button v-if="hasPermission('lol:skinline:add')" @click="handleNew" />
    </template>

    <!-- 数据表格区域 -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <a-typography-text copyable>{{ record.name }}</a-typography-text>
      </template>
      <template v-if="column.key === 'engName'">
        <a-typography-text copyable>{{ record.engName }}</a-typography-text>
      </template>
      <template v-if="column.key === 'description'">
        <a-typography-text copyable>{{ record.description }} </a-typography-text>
      </template>
      <template v-if="column.key === 'engDescription'">
        <a-typography-text copyable>{{ record.engDescription }} </a-typography-text>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lol:skinline:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('lol:skinline:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <!-- 系统配置新建修改的表单弹窗 -->
  <skinline-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import SkinlinePageSearch from './SkinlinePageSearch.vue'
import SkinlineFormModal from './SkinlineFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { pageSkinline, deleteSkinline } from '@/api/lol/skinline'
import type { SkinlinePageVO, SkinlineQO } from '@/api/lol/skinline/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'SkinlinePage' })

// 鉴权方法
const { hasPermission } = useAuthorize()

// 表格组件引用
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof SkinlineFormModal>>()

/* 刷新表格 */
const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

// 查询参数
let searchParams: SkinlineQO = {}

/* 远程加载表格数据 */
const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageSkinline({ ...pageParam, ...searchParams })
}

/* 查询英雄联盟皮肤系列 */
const searchTable = (params: SkinlineQO) => {
  searchParams = params
  reloadTable(true) // 会调用 tableRequest
}

/* 新建英雄联盟皮肤系列 */
const handleNew = () => {
  formModalRef.value.open(FormAction.CREATE)
}

/* 编辑英雄联盟皮肤系列 */
const handleEdit = (record: SkinlinePageVO) => {
  formModalRef.value.open(FormAction.UPDATE, record)
}

/* 删除英雄联盟皮肤系列 */
const handleDelete = (record: SkinlinePageVO) => {
  doRequest(deleteSkinline(record.id), {
    successMessage: '删除成功！',
    onSuccess: () => reloadTable()
  })
}

const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'id',
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: '编号',
    dataIndex: 'riotSkinlineId',
    width: 120,
    align: 'center',
    sorter: true
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description'
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
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 100
  }
]
</script>
