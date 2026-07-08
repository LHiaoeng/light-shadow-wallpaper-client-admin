<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }"
    :confirm-loading="submitLoading"
    :width="920"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>

      <a-divider orientation="left">臻彩信息</a-divider>
      <a-row :gutter="[16, 0]">
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="游戏版本">
            <a-input v-model:value="formModel.gameVer" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="臻彩ID">
            <a-input-number v-model:value="formModel.skinId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="实例ID">
            <a-input v-model:value="formModel.instanceId" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="臻彩名称">
            <a-input v-model:value="formModel.itemName" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="臻彩名称英文">
            <a-input v-model:value="formModel.itemNameEng" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="英雄ID">
            <a-input-number v-model:value="formModel.heroId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="英雄名称">
            <a-input v-model:value="formModel.heroName" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="英雄英文名">
            <a-input v-model:value="formModel.heroNameEng" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider orientation="left">原皮信息</a-divider>
      <a-row :gutter="[16, 0]">
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="原皮ID">
            <a-input-number v-model:value="formModel.sourceSkinId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="16" :md="12" :sm="24">
          <a-form-item label="原皮实例ID">
            <a-input v-model:value="formModel.sourceSkinInstanceId" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原皮名称">
            <a-input v-model:value="formModel.sourceSkinName" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原皮英文名">
            <a-input v-model:value="formModel.sourceSkinNameEng" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原皮套装ID_set">
            <a-input v-model:value="formModel.sourceSkinSkinlineIdSet" placeholder="英文逗号分隔" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原皮宇宙ID_set">
            <a-input v-model:value="formModel.sourceSkinUniverseIdSet" placeholder="英文逗号分隔" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider orientation="left">分类与状态</a-divider>
      <a-row :gutter="[16, 0]">
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="分类ID">
            <a-input v-model:value="formModel.categoryId" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="分类名称">
            <a-input v-model:value="formModel.categoryName" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="标签ID">
            <a-input v-model:value="formModel.tagId" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="系列ID">
            <a-input v-model:value="formModel.seriesId" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="排序">
            <a-input-number v-model:value="formModel.rank" disabled style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="是否新增">
            <a-select v-model:value="formModel.isNew">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import type { FormRequestMapping } from '@/hooks/form'
import type { ColProps } from 'ant-design-vue'
import { createPrestigeChroma, updatePrestigeChroma } from '@/api/lol/prestigeChroma'
import type { PrestigeChromaDTO, PrestigeChromaPageVO } from '@/api/lol/prestigeChroma/types'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 8 } }
const wrapperCol: ColProps = { sm: { span: 24 }, md: { span: 15 } }

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()

const getDefaultFormModel = (): PrestigeChromaDTO => ({
  id: undefined,
  gameVer: undefined,
  heroId: undefined,
  heroName: undefined,
  heroNameEng: undefined,
  skinId: undefined,
  instanceId: undefined,
  itemName: undefined,
  itemNameEng: undefined,
  sourceSkinId: undefined,
  sourceSkinInstanceId: undefined,
  sourceSkinName: undefined,
  sourceSkinNameEng: undefined,
  sourceSkinSkinlineIdSet: undefined,
  sourceSkinUniverseIdSet: undefined,
  categoryId: undefined,
  categoryName: undefined,
  tagId: undefined,
  seriesId: undefined,
  rank: undefined,
  isNew: 0
})

const formModel = reactive<PrestigeChromaDTO>(getDefaultFormModel())
const formRule = reactive({})
const formRequestMapping: FormRequestMapping<PrestigeChromaDTO> = {
  [FormAction.CREATE]: createPrestigeChroma,
  [FormAction.UPDATE]: updatePrestigeChroma
}

const { submitLoading, validateAndSubmit, resetFields } = useAdminForm(
  formAction,
  formRequestMapping,
  formModel,
  formRule
)

const resetFormModel = () => {
  Object.assign(formModel, getDefaultFormModel())
}

const fillFormModel = (record?: PrestigeChromaPageVO) => {
  if (!record) {
    return
  }
  Object.assign(formModel, record)
}

const handleSubmit = () => {
  validateAndSubmit(
    { ...formModel },
    {
      onSuccess: () => {
        closeModal()
        emits('submit-success')
      }
    }
  )
}

const handleClose = () => {
  closeModal()
  submitLoading.value = false
}

defineExpose({
  open(newFormAction: FormAction, record?: PrestigeChromaPageVO) {
    openModal()
    resetFields()
    resetFormModel()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新增臻彩皮肤'
    } else {
      title.value = '编辑臻彩皮肤'
      fillFormModel(record)
    }
    formAction.value = newFormAction
  }
})
</script>
