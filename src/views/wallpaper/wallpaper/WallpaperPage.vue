<template>
  <!-- 查询表单 -->
  <wallpaper-page-search :loading="tableRef?.loading" @search="searchTable" />

  <pro-table
    ref="tableRef"
    header-title="壁纸管理"
    row-key="id"
    :request="tableRequest"
    :columns="columns"
    :scroll="{ x: 1000 }"
  >
    <!-- 操作按钮区域 -->
    <template #toolBarRender>
      <new-button v-if="hasPermission('wallpaper:wallpaper:add')" @click="handleNew" />
    </template>

    <!-- 数据表格区域 -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'url'">
        <UrlCell :url="record.url" />
      </template>
      <template v-if="column.key === 'poster'">
        <UrlCell :url="record.poster" />
      </template>
      <template v-if="column.key === 'operate'">
        <operation-group>
          <a v-if="hasPermission('wallpaper:wallpaper:edit')" @click="handleEdit(record)">编辑</a>
          <delete-text-button
            v-if="hasPermission('wallpaper:wallpaper:del')"
            @confirm="() => handleDelete(record)"
          />
        </operation-group>
      </template>
    </template>
  </pro-table>

  <!-- 系统配置新建修改的表单弹窗 -->
  <wallpaper-form-modal ref="formModalRef" @submit-success="reloadTable" />
</template>

<script setup lang="ts">
import ProTable from '#/table'
import type { ProColumns } from '#/table'
import type { ProTableInstanceExpose, TableRequest } from '#/table'
import WallpaperPageSearch from './WallpaperPageSearch.vue'
import WallpaperFormModal from './WallpaperFormModal.vue'
import { NewButton, DeleteTextButton } from '@/components/Button'
import { OperationGroup } from '@/components/Operation'
import { useAuthorize } from '@/hooks/permission'
import { mergePageParam } from '@/utils/page-utils'
import { doRequest } from '@/utils/axios/request'
import { pageWallpaper, deleteWallpaper } from '@/api/wallpaper/wallpaper'
import type { WallpaperPageVO, WallpaperQO } from '@/api/wallpaper/wallpaper/types'
import { FormAction } from '@/hooks/form'
import { DictText } from '@/components/Dict'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import UrlCell from '@/components/UrlCell/index.vue'

defineOptions({ name: 'WallpaperPage' })

// 鉴权方法
const { hasPermission } = useAuthorize()

// 表格组件引用
const tableRef = ref<ProTableInstanceExpose>()
const formModalRef = ref<InstanceType<typeof WallpaperFormModal>>()

/* 刷新表格 */
const reloadTable = (resetPageIndex?: boolean) => {
  tableRef.value?.actionRef?.reload(resetPageIndex)
}

// 查询参数
let searchParams: WallpaperQO = {}

/* 远程加载表格数据 */
const tableRequest: TableRequest = (params, sorter, filter) => {
  const pageParam = mergePageParam(params, sorter, filter)
  return pageWallpaper({ ...pageParam, ...searchParams })
}

/* 查询壁纸 */
const searchTable = (params: WallpaperQO) => {
  searchParams = params
  reloadTable(true) // 会调用 tableRequest
}

/* 新建壁纸 */
const handleNew = () => {
  formModalRef.value.open(FormAction.CREATE)
}

/* 编辑壁纸 */
const handleEdit = (record: WallpaperPageVO) => {
  formModalRef.value.open(FormAction.UPDATE, record)
}

/* 删除壁纸 */
const handleDelete = (record: WallpaperPageVO) => {
  doRequest(deleteWallpaper(record.id), {
    successMessage: '删除成功！',
    onSuccess: () => reloadTable()
  })
}

const copyToClipboard = text => {
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  message.success('复制成功')
}

const columns: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'id',
    width: 80,
    align: 'center',
    fixed: 'left',
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: '壁纸类型',
    dataIndex: 'type',
    width: 80,
    customRender: function ({ value }) {
      return h(DictText, { dictCode: 'wallpaper_type', value: value })
    }
  },
  {
    title: '壁纸来源',
    dataIndex: 'source',
    width: 100,
    customRender: function ({ value }) {
      return h(DictText, { dictCode: 'wallpaper_source', value: value })
    }
  },
  {
    title: '壁纸状态',
    dataIndex: 'status',
    customRender: function ({ value }) {
      return h(DictText, { dictCode: 'wallpaper_status', value: value })
    }
  },
  {
    title: '壁纸标题',
    dataIndex: 'title'
  },
  {
    title: '标题链接',
    dataIndex: 'titleLink',
    ellipsis: true
  },
  {
    title: '壁纸网址',
    dataIndex: 'url',
    ellipsis: true
  },
  {
    title: '海报地址',
    dataIndex: 'poster',
    ellipsis: true
  },
  {
    title: '版权信息',
    dataIndex: 'copyright',
    ellipsis: true
  },
  {
    title: '版权信息链接',
    dataIndex: 'copyrightLink',
    ellipsis: true
  },
  {
    title: '壁纸描述',
    dataIndex: 'description',
    ellipsis: true
  },
  {
    title: '上架时间',
    dataIndex: 'launchTime',
    width: 100,
    sorter: true,
    customRender: function ({ value }) {
      return value ? dayjs(value).format('YYYY-MM-DD') : ''
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    sorter: true
  },
  {
    title: '必应壁纸ID',
    dataIndex: 'urlBase',
    ellipsis: true
  },
  {
    title: '地区',
    dataIndex: 'bingCountry'
  },
  {
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 100
  }
]
</script>
