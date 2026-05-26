<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="760"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="皮肤ID">
            <a-input-number v-model:value="formModel.riotSkinId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="英雄ID">
            <a-input-number v-model:value="formModel.championId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="中文名">
            <a-input v-model:value="formModel.name" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="英文名">
            <a-input v-model:value="formModel.nameEng" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="国服稀有度">
            <a-input-number v-model:value="formModel.regionRarityId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="全球稀有度">
            <a-input v-model:value="formModel.rarity" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="PBE">
            <a-select v-model:value="formModel.isPbeOnly">
              <a-select-option :value="1">仅 PBE</a-select-option>
              <a-select-option :value="0">已上线</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="绝版">
            <a-select v-model:value="formModel.isLegacy">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="原画地址">
            <a-input v-model:value="formModel.splashPath" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="小图地址">
            <a-input v-model:value="formModel.tilePath" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="描述">
            <a-textarea v-model:value="formModel.description" :rows="3" />
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
import { createLolSkin, updateLolSkin } from '@/api/lol/skin'
import type { LolSkinDTO, LolSkinPageVO } from '@/api/lol/skin/types'
import { overrideProperties } from '@/utils/bean-utils'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 6 } }
const wrapperCol: ColProps = { sm: { span: 24 }, md: { span: 17 } }

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()

const formModel = reactive<LolSkinDTO>({
  isBase: 0,
  isLegacy: 0,
  isPbeOnly: 0
})

const formRule = reactive({})
const formRequestMapping: FormRequestMapping<LolSkinDTO> = {
  [FormAction.CREATE]: createLolSkin,
  [FormAction.UPDATE]: updateLolSkin
}

const { submitLoading, validateAndSubmit, resetFields } = useAdminForm(
  formAction,
  formRequestMapping,
  formModel,
  formRule
)

const handleSubmit = () => {
  validateAndSubmit({ ...formModel }, {
    onSuccess: () => {
      closeModal()
      emits('submit-success')
    }
  })
}

const handleClose = () => {
  closeModal()
  submitLoading.value = false
}

defineExpose({
  open(newFormAction: FormAction, record?: LolSkinPageVO) {
    openModal()
    resetFields()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新增皮肤'
      formModel.isBase = 0
      formModel.isLegacy = 0
      formModel.isPbeOnly = 0
    } else {
      title.value = '编辑皮肤'
      overrideProperties(formModel, record)
    }
    formAction.value = newFormAction
  }
})
</script>
