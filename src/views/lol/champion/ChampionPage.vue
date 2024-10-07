<template>
  <!-- 查询表单 -->
  <champion-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="英雄列表"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1000 }"
  >
    <!-- 操作按钮区域 -->
    <template #toolBarRender>
      <new-button v-if="hasPermission('champion:champion:add')" @click="handleNew" />
    </template>

    <!-- 数据表格区域 -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'squarePortraitPath'">
        <a-image :src="record.squarePortraitPath" />
      </template>
      <template v-if="column.key === 'name'">
        <a-typography-text copyable>{{ record.name }}</a-typography-text>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('champion:champion:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('champion:champion:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <!-- 系统配置新建修改的表单弹窗 -->
  <champion-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import ChampionPageSearch from './ChampionPageSearch.vue'
import ChampionFormModal from './ChampionFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { pageChampion, deleteChampion } from '@/api/lol/champion'
import type { ChampionPageVO, ChampionQO } from '@/api/lol/champion/types'
import { FormAction } from '@/hooks/form'

defineOptions({ name: 'ChampionPage' })

// 鉴权方法
const { hasPermission } = useAuthorize()

// 表格组件引用
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof ChampionFormModal>>()

/* 刷新表格 */
const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

// 查询参数
let searchParams: ChampionQO = {}

/* 远程加载表格数据 */
const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageChampion({ ...pageParam, ...searchParams })
}

/* 查询英雄联盟英雄 */
const searchTable = (params: ChampionQO) => {
  searchParams = params
  reloadTable(true) // 会调用 tableRequest
}

/* 新建英雄联盟英雄 */
const handleNew = () => {
  formModalRef.value.open(FormAction.CREATE)
}

/* 编辑英雄联盟英雄 */
const handleEdit = (record: ChampionPageVO) => {
  formModalRef.value.open(FormAction.UPDATE, record)
}

/* 删除英雄联盟英雄 */
const handleDelete = (record: ChampionPageVO) => {
  doRequest(deleteChampion(record.id), {
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
    title: '方形肖像图片地址',
    dataIndex: 'squarePortraitPath'
  },
  {
    title: '英雄识别id',
    dataIndex: 'heroId'
  },
  {
    title: '实例id',
    dataIndex: 'instanceId'
  },
  {
    title: '名称',
    dataIndex: 'name'
  },
  {
    title: '英文名称',
    dataIndex: 'nameEng'
  },
  {
    title: '英雄称号',
    dataIndex: 'title'
  },
  {
    title: '英文称号',
    dataIndex: 'titleEng'
  },
  {
    title: '别称',
    dataIndex: 'alias'
  },
  {
    title: '英雄选取语音',
    dataIndex: 'selectAudio'
  },
  {
    title: '英雄被ban语音',
    dataIndex: 'banAudio'
  },
  {
    title: '英雄定位',
    dataIndex: 'roles'
  },
  {
    title: '游戏商城售价',
    dataIndex: 'goldPrice'
  },
  {
    title: '搜索关键词',
    dataIndex: 'keywords'
  },
  {
    title: '简介',
    dataIndex: 'description',
    ellipsis: true
  },
  {
    title: '英文简介',
    dataIndex: 'descriptionEng',
    ellipsis: true
  },
  {
    title: '上线时间',
    dataIndex: 'launchTime',
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
