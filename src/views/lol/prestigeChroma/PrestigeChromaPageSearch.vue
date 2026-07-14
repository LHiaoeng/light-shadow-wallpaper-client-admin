<template>
  <a-card :bordered="false" style="margin-bottom: 16px" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="labelCol">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="游戏版本">
            <a-input v-model:value="formModel.gameVer" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="英雄ID">
            <a-input-number v-model:value="formModel.heroId" style="width: 100%" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="臻彩ID">
            <a-input-number v-model:value="formModel.skinId" style="width: 100%" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="实例ID">
            <a-input v-model:value="formModel.instanceId" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="原皮ID">
            <a-input-number
              v-model:value="formModel.sourceSkinId"
              style="width: 100%"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="套装ID">
            <a-input v-model:value="formModel.sourceSkinlineId" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="宇宙ID">
            <a-input v-model:value="formModel.sourceUniverseId" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="是否新增">
            <a-select v-model:value="formModel.isNew" allow-clear>
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="关键字">
            <a-input v-model:value="formModel.keyword" placeholder="名称 / 英文名" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <search-actions :loading="props.loading" @search="search" @reset="reset" />
        </a-col>
      </a-row>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { Form } from 'ant-design-vue'
import type { PrestigeChromaQO } from '@/api/lol/prestigeChroma/types'
import { snapshotPrestigeChromaQuery } from './prestigeChromaDownloadState'

const useForm = Form.useForm
const labelCol = { md: { span: 7 } }

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emits = defineEmits<{
  (e: 'search', params: PrestigeChromaQO): void
}>()

const getDefaultFormModel = (): PrestigeChromaQO => ({
  gameVer: undefined,
  heroId: undefined,
  skinId: undefined,
  instanceId: undefined,
  sourceSkinId: undefined,
  sourceSkinlineId: undefined,
  sourceUniverseId: undefined,
  isNew: undefined,
  keyword: undefined
})

const formModel = reactive<PrestigeChromaQO>(getDefaultFormModel())
const { resetFields } = useForm(formModel)

const search = () => {
  emits('search', snapshotPrestigeChromaQuery(toRaw(formModel)))
}

const reset = () => {
  resetFields()
  Object.assign(formModel, getDefaultFormModel())
  search()
}

const getQuery = () => snapshotPrestigeChromaQuery(toRaw(formModel))

defineExpose({ getQuery })
</script>
