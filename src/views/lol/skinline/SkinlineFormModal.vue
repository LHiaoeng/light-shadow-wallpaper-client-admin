<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="450"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>
      <a-form-item label="拳头皮肤系列编号">
        <a-input v-model:value="formModel.riotSkinlineId" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="皮肤系列名称">
        <a-input v-model:value="formModel.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="皮肤系列描述">
        <a-input v-model:value="formModel.description" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="皮肤系列英文名称">
        <a-input v-model:value="formModel.engName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="皮肤系列英文描述">
        <a-input v-model:value="formModel.engDescription" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import type { FormRequestMapping } from '@/hooks/form'
import type { SkinlineDTO, SkinlinePageVO } from '@/api/lol/skinline/types'
import { createSkinline, updateSkinline } from '@/api/lol/skinline'
import { overrideProperties } from '@/utils/bean-utils'
import type { ColProps } from 'ant-design-vue'

const labelCol: ColProps = {
  sm: { span: 24 },
  md: { span: 4 }
}

const wrapperCol: ColProps = {
  sm: { span: 24 },
  md: { span: 19 }
}

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()

const { formAction, isUpdateForm } = useFormAction()

// 表单模型
const formModel = reactive<SkinlineDTO>({
  //
  id: undefined,
  // 拳头皮肤系列编号
  riotSkinlineId: undefined,
  // 皮肤系列名称
  name: undefined,
  // 皮肤系列描述
  description: undefined,
  // 皮肤系列英文名称
  engName: undefined,
  // 皮肤系列英文描述
  engDescription: undefined
})

// 表单的校验规则
const formRule = reactive({})

// 表单的提交请求
const formRequestMapping: FormRequestMapping<SkinlineDTO> = {
  [FormAction.CREATE]: createSkinline,
  [FormAction.UPDATE]: updateSkinline
}

const { submitLoading, validateAndSubmit, resetFields, validateInfos } = useAdminForm(
  formAction,
  formRequestMapping,
  formModel,
  formRule
)

/* 表单提交处理 */
const handleSubmit = () => {
  const model = { ...formModel }
  validateAndSubmit(model, {
    onSuccess: () => {
      closeModal()
      emits('submit-success')
    }
  })
}

/* 弹窗关闭方法 */
const handleClose = () => {
  closeModal()
  submitLoading.value = false
}

defineExpose({
  open(newFormAction: FormAction, record?: SkinlinePageVO) {
    openModal()
    resetFields()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新建英雄联盟皮肤系列'
    } else {
      title.value = '编辑英雄联盟皮肤系列'
      overrideProperties(formModel, record)
    }
    formAction.value = newFormAction
  }
})
</script>
