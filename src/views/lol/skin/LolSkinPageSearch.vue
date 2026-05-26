<template>
  <a-card :bordered="false" style="margin-bottom: 16px" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="labelCol">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="英雄ID">
            <a-input-number v-model:value="formModel.championId" style="width: 100%" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="皮肤ID">
            <a-input-number v-model:value="formModel.riotSkinId" style="width: 100%" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="Content ID">
            <a-input v-model:value="formModel.contentId" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="关键词">
            <a-input v-model:value="formModel.keyword" placeholder="名称 / 描述" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="PBE">
            <a-select v-model:value="formModel.isPbeOnly" allow-clear>
              <a-select-option :value="1">仅 PBE</a-select-option>
              <a-select-option :value="0">已上线</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="国服稀有度">
            <dict-select
              v-model:value="formModel.regionRarityId"
              dict-code="lol_skin_rarity_cn"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="直营服稀有度">
            <dict-select
              v-model:value="formModel.rarity"
              dict-code="lol_skin_rarity_global"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="国服绝版">
            <a-select v-model:value="formModel.isLegacy" allow-clear>
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="直营服绝版">
            <a-select v-model:value="formModel.isLegacyGlobal" allow-clear>
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
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
import { DictSelect } from '@/components/Dict'
import type { LolSkinQO } from '@/api/lol/skin/types'

const useForm = Form.useForm
const labelCol = { md: { span: 7 } }

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emits = defineEmits<{
  (e: 'search', params: LolSkinQO): void
}>()

const formModel = reactive<LolSkinQO>({})
const { resetFields } = useForm(formModel)

const search = () => {
  emits('search', toRaw(formModel))
}

const reset = () => {
  resetFields()
  search()
}
</script>
