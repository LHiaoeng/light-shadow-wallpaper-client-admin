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
            <a-select v-model:value="formModel.regionRarityId" allow-clear show-search>
              <a-select-option
                v-for="item in cnRarityDictItems"
                :key="item.id"
                :value="item.value"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img v-if="getCnRarityIconUrl(item.value)" :src="getCnRarityIconUrl(item.value)" />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="直营服稀有度">
            <a-select v-model:value="formModel.rarity" allow-clear show-search>
              <a-select-option
                v-for="item in globalRarityDictItems"
                :key="item.id"
                :value="item.value"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img v-if="getGlobalRarityIconUrl(item.value)" :src="getGlobalRarityIconUrl(item.value)" />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="徽章">
            <a-select v-model:value="formModel.emblemName" allow-clear show-search>
              <a-select-option
                v-for="item in emblemDictItems"
                :key="item.id"
                :value="item.value"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img v-if="getEmblemIconUrl(item.value)" :src="getEmblemIconUrl(item.value)" />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
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
import type { LolSkinQO } from '@/api/lol/skin/types'
import { useLolSkinDictPresentation } from './lol-skin-dict-presentation'

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

const getDefaultFormModel = (): LolSkinQO => ({
  championId: undefined,
  riotSkinId: undefined,
  contentId: undefined,
  keyword: undefined,
  isPbeOnly: undefined,
  regionRarityId: undefined,
  rarity: undefined,
  emblemName: undefined,
  isLegacy: undefined,
  isLegacyGlobal: undefined
})

const formModel = reactive<LolSkinQO>(getDefaultFormModel())
const { resetFields } = useForm(formModel)
const {
  cnRarityDictItems,
  globalRarityDictItems,
  emblemDictItems,
  getCnRarityIconUrl,
  getGlobalRarityIconUrl,
  getEmblemIconUrl
} = useLolSkinDictPresentation()

const search = () => {
  emits('search', toRaw(formModel))
}

const reset = () => {
  resetFields()
  Object.assign(formModel, getDefaultFormModel())
  search()
}
</script>

<style scoped lang="less">
.dict-option {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  img {
    width: 22px;
    height: 22px;
    flex: none;
    object-fit: contain;
  }
}
</style>
