<template>
  <a-card :bordered="false" class="search-card" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="{ md: { span: 6 } }">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="英雄 ID"
            ><a-input v-model:value="formModel.heroId" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="名称"
            ><a-input v-model:value="formModel.name" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="称号"
            ><a-input v-model:value="formModel.title" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="定位"
            ><a-input v-model:value="formModel.roles" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="分路"
            ><a-input v-model:value="formModel.lane" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="维护方式">
            <a-select v-model:value="formModel.manualMaintained" allow-clear>
              <a-select-option :value="LOLM_CATALOG_STATUS.AUTOMATIC">自动同步</a-select-option>
              <a-select-option :value="LOLM_CATALOG_STATUS.MANUAL">人工维护</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="记录状态">
            <a-select v-model:value="formModel.deleted" allow-clear>
              <a-select-option :value="LOLM_CATALOG_STATUS.NOT_DELETED">未删除</a-select-option>
              <a-select-option :value="LOLM_CATALOG_STATUS.DELETED">已删除</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="">
            <a-space>
              <a-button type="primary" :loading="tableRef?.loading" @click="search">查询</a-button>
              <a-button @click="resetSearch">重置</a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>

  <pro-table
    ref="tableRef"
    header-title="手游英雄"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1450 }"
  >
    <template #toolBarRender>
      <a-space>
        <new-button v-if="hasPermission('lolm:hero:add')" @click="handleNew" />
        <a-popconfirm
          v-if="hasPermission('lolm:catalog:sync')"
          title="立即同步英雄与皮肤目录？"
          ok-text="同步"
          cancel-text="取消"
          @confirm="handleSync"
        >
          <a-button type="primary" :loading="syncLoading">立即同步</a-button>
        </a-popconfirm>
      </a-space>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'avatar'">
        <a-image v-if="record.avatar" :src="record.avatar" :width="48" />
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'flags'">
        <a-space>
          <a-tag :color="record.manualMaintained === LOLM_CATALOG_STATUS.MANUAL ? 'orange' : 'blue'">
            {{ record.manualMaintained === LOLM_CATALOG_STATUS.MANUAL ? '人工维护' : '自动同步' }}
          </a-tag>
          <a-tag v-if="record.deleted === LOLM_CATALOG_STATUS.DELETED" color="red">已删除</a-tag>
        </a-space>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lolm:hero:read')" @click="showDetail(record)">详情</a>
          <a
            v-if="record.deleted !== LOLM_CATALOG_STATUS.DELETED && hasPermission('lolm:hero:edit')"
            @click="handleEdit(record)"
          >
            编辑
          </a>
          <a-popconfirm
            v-if="record.deleted === LOLM_CATALOG_STATUS.DELETED && hasPermission('lolm:hero:restore')"
            title="恢复这条英雄记录？"
            @confirm="restore(record)"
          >
            <a>恢复</a>
          </a-popconfirm>
          <a-popconfirm
            v-if="
              record.deleted !== LOLM_CATALOG_STATUS.DELETED &&
              record.manualMaintained === LOLM_CATALOG_STATUS.MANUAL &&
              hasPermission('lolm:hero:auto')
            "
            title="恢复自动同步后，后续同步会覆盖人工编辑内容。"
            @confirm="restoreAuto(record)"
          >
            <a>恢复自动同步</a>
          </a-popconfirm>
          <delete-text-button
            v-if="record.deleted !== LOLM_CATALOG_STATUS.DELETED && hasPermission('lolm:hero:del')"
            @confirm="() => remove(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <lolm-hero-form-modal ref="formModalRef" @submit-success="reloadTable" />
  <a-modal v-model:visible="detailVisible" title="手游英雄详情" :footer="null" width="760px">
    <a-spin :spinning="detailLoading">
      <a-descriptions v-if="detail" bordered :column="2" size="small">
        <a-descriptions-item label="来源英雄 ID">{{ detail.heroId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ detail.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="称号">{{ detail.title || '-' }}</a-descriptions-item>
        <a-descriptions-item label="定位">{{ detail.roles || '-' }}</a-descriptions-item>
        <a-descriptions-item label="分路">{{ detail.lane || '-' }}</a-descriptions-item>
        <a-descriptions-item label="维护方式">{{
          detail.manualMaintained === LOLM_CATALOG_STATUS.MANUAL ? '人工维护' : '自动同步'
        }}</a-descriptions-item>
        <a-descriptions-item label="简介" :span="2">{{ detail.intro || '-' }}</a-descriptions-item>
        <a-descriptions-item v-for="[label, url] in detailImages" :key="label" :label="label">
          <a-image v-if="url" :src="url" :width="120" />
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ detail.updateTime || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import {
  deleteLolmHero,
  getLolmHero,
  pageLolmHero,
  restoreLolmHero,
  restoreLolmHeroAuto,
  syncLolmCatalog
} from '@/api/lolmCatalog'
import type { LolmHero, LolmHeroPageParam } from '@/api/lolmCatalog/types'
import { DeleteTextButton, NewButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { FormAction } from '@/hooks/form'
import {
  LOLM_CATALOG_STATUS,
  useLolmCatalogPageActions,
  useLolmCatalogSearch
} from '@/hooks/lolmCatalog'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import LolmHeroFormModal from './LolmHeroFormModal.vue'

defineOptions({ name: 'LolmHeroPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof LolmHeroFormModal>>()
const initialSearch: LolmHeroPageParam = {
  heroId: undefined,
  name: undefined,
  title: undefined,
  roles: undefined,
  lane: undefined,
  manualMaintained: undefined,
  deleted: LOLM_CATALOG_STATUS.NOT_DELETED
}
const reloadTable = (resetPageIndex?: boolean) => tableRef.value?.actionRef?.reload(resetPageIndex)
const { formModel, searchParams, search, resetSearch } = useLolmCatalogSearch(
  initialSearch,
  reloadTable
)
const {
  detail,
  detailVisible,
  detailLoading,
  syncLoading,
  showDetail,
  remove,
  restore,
  restoreAuto,
  handleSync
} = useLolmCatalogPageActions(
  {
    get: getLolmHero,
    remove: deleteLolmHero,
    restore: restoreLolmHero,
    restoreAuto: restoreLolmHeroAuto,
    sync: syncLolmCatalog
  },
  reloadTable
)
const detailImages = computed(
  () =>
    [
      ['头像', detail.value?.avatar],
      ['卡片', detail.value?.card],
      ['海报', detail.value?.poster]
    ] as const
)

const tableRequest: TableRequest = (params, sorter, filter) =>
  pageLolmHero({ ...mergePageParam(params, sorter, filter), ...searchParams.value })

const handleNew = () => formModalRef.value?.open(FormAction.CREATE)
const handleEdit = (record: LolmHero) => formModalRef.value?.open(FormAction.UPDATE, record)

const columns: ProColumns[] = [
  { title: '序号', dataIndex: 'id', width: 70, customRender: ({ index }) => index + 1 },
  { key: 'avatar', title: '头像', dataIndex: 'avatar', width: 90 },
  { title: '英雄 ID', dataIndex: 'heroId', width: 100 },
  { title: '名称', dataIndex: 'name', width: 130 },
  { title: '称号', dataIndex: 'title', width: 180, ellipsis: true },
  { title: '定位', dataIndex: 'roles', width: 120 },
  { title: '分路', dataIndex: 'lane', width: 100 },
  { key: 'flags', title: '维护状态', dataIndex: 'manualMaintained', width: 150 },
  { title: '更新时间', dataIndex: 'updateTime', width: 180 },
  { key: 'operate', title: '操作', align: 'center', width: 260, fixed: 'right' }
]
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
</style>
