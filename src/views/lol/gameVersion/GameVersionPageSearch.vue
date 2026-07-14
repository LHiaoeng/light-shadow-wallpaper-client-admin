<template>
  <a-card :bordered="false" style="margin-bottom: 16px" :body-style="{ paddingBottom: 0 }">
    <a-form :model="formModel" :label-col="labelCol">
      <a-row :gutter="16">
        <a-col :xl="6" :md="12" :sm="24">
          <a-form-item label="游戏版本">
            <a-input v-model:value="formModel.gameVer" placeholder="例如 26.13" allow-clear />
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
import type { GameVersionQO } from '@/api/lol/gameVersion/types'
import { Form } from 'ant-design-vue'

const useForm = Form.useForm
const labelCol = { md: { span: 7 } }

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emits = defineEmits<{
  (e: 'search', params: GameVersionQO): void
}>()

const getDefaultFormModel = (): GameVersionQO => ({
  gameVer: undefined
})

const formModel = reactive<GameVersionQO>(getDefaultFormModel())
const { resetFields } = useForm(formModel)

const search = () => {
  emits('search', toRaw(formModel))
}

const reset = () => {
  resetFields()
  Object.assign(formModel, getDefaultFormModel())
  search()
}
</script>
