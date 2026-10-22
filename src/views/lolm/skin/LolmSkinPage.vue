<template>
  <a-card :bordered="false" class="search-card" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="{ md: { span: 6 } }">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="皮肤 ID"
            ><a-input v-model:value="formModel.skinId" allow-clear
          /></a-form-item>
        </a-col>
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
          <a-form-item label="品质"
            ><a-input v-model:value="formModel.quality" allow-clear
          /></a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="维护方式">
            <a-select v-model:value="formModel.manualMaintained" allow-clear>
              <a-select-option :value="0">自动同步</a-select-option>
              <a-select-option :value="1">人工维护</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="记录状态">
            <a-select v-model:value="formModel.deleted" allow-clear>
              <a-select-option :value="0">未删除</a-select-option>
              <a-select-option :value="1">已删除</a-select-option>
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
    header-title="手游皮肤"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1550 }"
  >
    <template #toolBarRender>
      <a-space>
        <new-button v-if="hasPermission('lolm:skin:add')" @click="handleNew" />
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
      <template v-if="column.key === 'headIconPic'">
        <a-image v-if="record.headIconPic" :src="record.headIconPic" :width="48" />
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'flags'">
        <a-space>
          <a-tag :color="record.manualMaintained === 1 ? 'orange' : 'blue'">
            {{ record.manualMaintained === 1 ? '人工维护' : '自动同步' }}
          </a-tag>
          <a-tag v-if="record.deleted === 1" color="red">已删除</a-tag>
        </a-space>
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('lolm:skin:read')" @click="showDetail(record)">详情</a>
          <a
            v-if="record.deleted !== 1 && hasPermission('lolm:skin:edit')"
            @click="handleEdit(record)"
          >
            编辑
          </a>
          <a-popconfirm
            v-if="record.deleted === 1 && hasPermission('lolm:skin:restore')"
            title="恢复这条皮肤记录？"
            @confirm="restore(record)"
          >
            <a>恢复</a>
          </a-popconfirm>
          <a-popconfirm
            v-if="
              record.deleted !== 1 &&
              record.manualMaintained === 1 &&
              hasPermission('lolm:skin:auto')
            "
            title="恢复自动同步后，后续同步会覆盖人工编辑内容。"
            @confirm="restoreAuto(record)"
          >
            <a>恢复自动同步</a>
          </a-popconfirm>
          <delete-text-button
            v-if="record.deleted !== 1 && hasPermission('lolm:skin:del')"
            @confirm="() => remove(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <lolm-skin-form-modal ref="formModalRef" @submit-success="reloadTable" />
  <a-modal v-model:visible="detailVisible" title="手游皮肤详情" :footer="null" width="760px">
    <a-spin :spinning="detailLoading">
      <a-descriptions v-if="detail" bordered :column="2" size="small">
        <a-descriptions-item label="来源皮肤 ID">{{ detail.skinId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="所属英雄 ID">{{ detail.heroId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ detail.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="品质">{{ detail.quality || '-' }}</a-descriptions-item>
        <a-descriptions-item label="价格">{{ detail.couponPrice || '-' }}</a-descriptions-item>
        <a-descriptions-item label="排序权重">{{ detail.sortWeight || '-' }}</a-descriptions-item>
        <a-descriptions-item label="维护方式">{{
          detail.manualMaintained === 1 ? '人工维护' : '自动同步'
        }}</a-descriptions-item>
        <a-descriptions-item label="简介" :span="2">{{
          detail.briefIntro || '-'
        }}</a-descriptions-item>
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
  deleteLolmSkin,
  getLolmSkin,
  pageLolmSkin,
  restoreLolmSkin,
  restoreLolmSkinAuto,
  syncLolmCatalog
} from '@/api/lolmCatalog'
import type { LolmSkin, LolmSkinPageParam } from '@/api/lolmCatalog/types'
import { DeleteTextButton, NewButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { FormAction } from '@/hooks/form'
import { useAuthorize } from '@/hooks/permission'
import { doRequest } from '@/utils/axios/request'
import { mergePageParam } from '@/utils/page-utils'
import LolmSkinFormModal from './LolmSkinFormModal.vue'

defineOptions({ name: 'LolmSkinPage' })

const { hasPermission } = useAuthorize()
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof LolmSkinFormModal>>()
const formModel = reactive<LolmSkinPageParam>({ deleted: 0 })
const searchParams = ref<LolmSkinPageParam>({ deleted: 0 })
const detail = ref<LolmSkin>()
const detailVisible = ref(false)
const detailLoading = ref(false)
const syncLoading = ref(false)
const detailImages = computed(
  () =>
    [
      ['头像图', detail.value?.headIconPic],
      ['卡片', detail.value?.card],
      ['海报', detail.value?.poster]
    ] as const
)

const reloadTable = (resetPageIndex?: boolean) => tableRef.value?.actionRef?.reload(resetPageIndex)
const tableRequest: TableRequest = (params, sorter, filter) =>
  pageLolmSkin({ ...mergePageParam(params, sorter, filter), ...searchParams.value })

const search = () => {
  searchParams.value = { ...formModel }
  reloadTable(true)
}

const resetSearch = () => {
  Object.assign(formModel, {
    skinId: undefined,
    heroId: undefined,
    name: undefined,
    quality: undefined,
    manualMaintained: undefined,
    deleted: 0
  })
  search()
}

const handleNew = () => formModalRef.value?.open(FormAction.CREATE)
const handleEdit = (record: LolmSkin) => formModalRef.value?.open(FormAction.UPDATE, record)

const showDetail = (record: LolmSkin) => {
  detail.value = undefined
  detailVisible.value = true
  detailLoading.value = true
  doRequest(getLolmSkin(record.id!), {
    onSuccess: res => {
      detail.value = res.data
    },
    onFinally: () => {
      detailLoading.value = false
    }
  })
}

const remove = (record: LolmSkin) =>
  doRequest(deleteLolmSkin(record.id!), {
    successMessage: '删除成功',
    onSuccess: () => reloadTable()
  })
const restore = (record: LolmSkin) =>
  doRequest(restoreLolmSkin(record.id!), {
    successMessage: '恢复成功',
    onSuccess: () => reloadTable()
  })
const restoreAuto = (record: LolmSkin) =>
  doRequest(restoreLolmSkinAuto(record.id!), {
    successMessage: '已恢复自动同步',
    onSuccess: () => reloadTable()
  })
const handleSync = () => {
  syncLoading.value = true
  doRequest(syncLolmCatalog(), {
    successMessage: '目录同步完成',
    onSuccess: () => reloadTable(),
    onFinally: () => {
      syncLoading.value = false
    }
  })
}

const columns: ProColumns[] = [
  { title: '序号', dataIndex: 'id', width: 70, customRender: ({ index }) => index + 1 },
  { key: 'headIconPic', title: '预览', dataIndex: 'headIconPic', width: 90 },
  { title: '皮肤 ID', dataIndex: 'skinId', width: 120 },
  { title: '英雄 ID', dataIndex: 'heroId', width: 100 },
  { title: '名称', dataIndex: 'name', width: 160 },
  { title: '简介', dataIndex: 'briefIntro', width: 220, ellipsis: true },
  { title: '品质', dataIndex: 'quality', width: 100 },
  { title: '价格', dataIndex: 'couponPrice', width: 90 },
  { title: '排序权重', dataIndex: 'sortWeight', width: 110 },
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
