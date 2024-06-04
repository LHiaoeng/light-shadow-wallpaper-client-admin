<template>
  <a-card :bordered="false" style="margin-bottom: 16px" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="labelCol">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="标题">
            <a-input
              v-model:value="formModel.title"
              placeholder="请输入标题"
              allow-clear
              @change="onTitleChange"
            />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="壁纸网址">
            <dict-select v-model:value="formModel.hasMainUrl" dict-code="content_flag" />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="类型">
            <dict-select v-model:value="formModel.type" dict-code="wallpaper_type" />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="来源">
            <dict-select v-model:value="formModel.source" dict-code="wallpaper_source" />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="状态">
            <dict-select v-model:value="formModel.status" dict-code="wallpaper_status" />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="上架时间">
            <a-range-picker v-model:value="lunchTimeRange" value-format="YYYY-MM-DD" />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="必应壁纸ID">
            <a-input
              v-model:value="formModel.urlBase"
              placeholder="请输入标题"
              allow-clear
              @change="onTitleChange"
            />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <search-actions :loading="props.loading" @search="search" @reset="reset" />
        </a-col>
      </a-row>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { Form } from 'ant-design-vue'
import type { WallpaperQO } from '@/api/wallpaper/wallpaper/types'
import SearchActions from '@/components/Search/SearchActions.vue'
import { DictSelect } from '@/components/Dict'

const useForm = Form.useForm

// 表单 label 全局配置
const labelCol = { md: { span: 6 } }

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emits = defineEmits<{
  (e: 'search', params: Record<string, any>): void
}>()

const lunchTimeRange = ref<[string, string] | null>(null)

const formModel = reactive<WallpaperQO>({
  title: '',
  type: undefined,
  source: undefined,
  status: undefined,
  launchTimeStart: undefined,
  launchTimeEnd: undefined,
  hasMainUrl: undefined,
  bingCountry: undefined,
  urlBase: undefined
})

const { resetFields } = useForm(formModel)

const onTitleChange = () => {
  search()
}

const search = () => {
  if (lunchTimeRange.value) {
    const [start, end] = lunchTimeRange.value
    formModel.launchTimeStart = start
    formModel.launchTimeEnd = end
  }
  emits('search', toRaw(formModel))
}

const reset = () => {
  lunchTimeRange.value = null

  resetFields()
  search()
}
</script>
