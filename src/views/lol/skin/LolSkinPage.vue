<template>
  <lol-skin-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="LOL 皮肤"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1900 }"
  >
    <template #toolBarRender>
      <new-button v-if="hasPermission('lol:skin:add')" @click="handleNew" />
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'tilePath'">
        <a-image v-if="getPreviewUrl(record)" :src="getPreviewUrl(record)" :width="72" />
        <span v-else>-</span>
      </template>
      <template v-if="column.key === 'name'">
        <a-typography-text copyable>{{ record.name }}</a-typography-text>
      </template>
      <template v-if="column.key === 'regionRarityId'">
        <a-tooltip
          v-if="getCnRarityIconUrl(record.regionRarityId)"
          :title="getCnRarityName(record.regionRarityId)"
        >
          <img
            class="rarity-icon"
            :src="getCnRarityIconUrl(record.regionRarityId)"
            :alt="String(getCnRarityName(record.regionRarityId) || '')"
          />
        </a-tooltip>
        <span v-else>{{ getCnRarityName(record.regionRarityId) || '-' }}</span>
      </template>
      <template v-if="column.key === 'rarity'">
        <a-tooltip
          v-if="getGlobalRarityIconUrl(record.rarity)"
          :title="getGlobalRarityName(record.rarity)"
        >
          <img
            class="rarity-icon"
            :src="getGlobalRarityIconUrl(record.rarity)"
            :alt="String(getGlobalRarityName(record.rarity) || '')"
          />
        </a-tooltip>
        <span v-else>{{ getGlobalRarityName(record.rarity) || '-' }}</span>
      </template>
      <template v-if="column.key === 'emblemNames'">
        <div v-if="getEmblemDisplayItems(record.emblemNames).length" class="dict-icon-group">
          <a-tooltip
            v-for="emblem in getEmblemDisplayItems(record.emblemNames)"
            :key="String(emblem.value)"
            :title="emblem.name"
          >
            <img
              v-if="emblem.iconUrl"
              class="dict-icon"
              :src="emblem.iconUrl"
              :alt="String(emblem.name || '')"
            />
            <span v-else class="dict-text-fallback">{{ emblem.name }}</span>
          </a-tooltip>
        </div>
        <span v-else>-</span>
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
      <template v-if="column.key === 'isLegacyGlobal'">
        <a-tag v-if="record.isLegacyGlobal === 1" color="red">直营服绝版</a-tag>
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
import { toBreadjAssetUrl } from '@/utils/community-dragon-utils'
import { useLolSkinDictPresentation } from './lol-skin-dict-presentation'

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
  if (!pageParam.sort || pageParam.sort.length === 0) {
    pageParam.sort = ['isPbeOnly,desc', 'riotSkinId,asc']
  }
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

const getPreviewUrl = (record: LolSkinPageVO) => {
  const version = record.isPbeOnly === 1 ? 'pbe' : 'latest'
  return toBreadjAssetUrl(record.tilePath, version) || toBreadjAssetUrl(record.splashPath, version)
}

const {
  getCnRarityIconUrl,
  getGlobalRarityIconUrl,
  getCnRarityName,
  getGlobalRarityName,
  getEmblemDisplayItems
} = useLolSkinDictPresentation()

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
    title: 'Content ID',
    dataIndex: 'contentId',
    width: 220,
    ellipsis: true
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
    key: 'regionRarityId',
    title: '国服稀有度',
    dataIndex: 'regionRarityId',
    width: 150
  },
  {
    key: 'rarity',
    title: '直营服稀有度',
    dataIndex: 'rarity',
    width: 160
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
    key: 'isLegacyGlobal',
    title: '直营服绝版',
    dataIndex: 'isLegacyGlobal',
    width: 120
  },
  {
    title: '皮肤系列',
    dataIndex: 'skinlineIdSets',
    width: 160,
    ellipsis: true
  },
  {
    key: 'emblemNames',
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

<style scoped lang="less">
.rarity-icon,
.dict-icon {
  width: 28px;
  height: 28px;
  flex: none;
  object-fit: contain;
  vertical-align: middle;
}

.dict-icon-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.dict-text-fallback {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}
</style>
