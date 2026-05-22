<template>
  <a-card :bordered="false" style="margin-bottom: 16px" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="labelCol">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="商品ID">
            <a-input v-model:value="formModel.instanceId" placeholder="请输入商品ID" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="分区">
            <a-input v-model:value="formModel.catalog" placeholder="请输入分区" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="商品名称">
            <a-input v-model:value="formModel.itemName" placeholder="请输入商品名称" allow-clear />
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
import type { MythicShopQO } from '@/api/lol/mythic-shop/types'

const useForm = Form.useForm
const labelCol = { md: { span: 6 } }

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emits = defineEmits<{
  (e: 'search', params: MythicShopQO): void
}>()

const formModel = reactive<MythicShopQO>({})
const { resetFields } = useForm(formModel)

const search = () => {
  emits('search', toRaw(formModel))
}

const reset = () => {
  resetFields()
  search()
}
</script>

