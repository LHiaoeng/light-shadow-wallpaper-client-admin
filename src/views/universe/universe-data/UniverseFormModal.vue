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
      <a-form-item label="英雄联盟宇宙id">
        <a-input v-model:value="formModel.lolUniverseId" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="属于该宇宙的英雄联盟皮肤系列id集合。用英文逗号分隔">
        <a-input v-model:value="formModel.lolSkinlineIdSets" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="formModel.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="描述">
        <a-input v-model:value="formModel.description" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="图片地址">
        <a-input v-model:value="formModel.imagePath" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="所属品牌">
        <a-input v-model:value="formModel.brand" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英文名称">
        <a-input v-model:value="formModel.engName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英文描述">
        <a-input v-model:value="formModel.engDescription" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import type { FormRequestMapping } from '@/hooks/form'
import type { UniverseDTO, UniversePageVO } from '@/api/universe/types'
import { createUniverse, updateUniverse } from '@/api/universe/universe-data'
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
const formModel = reactive<UniverseDTO>({
  // 主键
  id: undefined,
  // 英雄联盟宇宙id
  lolUniverseId: undefined,
  // 属于该宇宙的英雄联盟皮肤系列id集合。用英文逗号分隔
  lolSkinlineIdSets: undefined,
  // 名称
  name: undefined,
  // 描述
  description: undefined,
  // 图片地址
  imagePath: undefined,
  // 所属品牌
  brand: undefined,
  // 英文名称
  engName: undefined,
  // 英文描述
  engDescription: undefined
})

// 表单的校验规则
const formRule = reactive({})

// 表单的提交请求
const formRequestMapping: FormRequestMapping<UniverseDTO> = {
  [FormAction.CREATE]: createUniverse,
  [FormAction.UPDATE]: updateUniverse
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
  open(newFormAction: FormAction, record?: UniversePageVO) {
    openModal()
    resetFields()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新建宇宙表'
    } else {
      title.value = '编辑宇宙表'
      overrideProperties(formModel, record)
    }
    formAction.value = newFormAction
  }
})
</script>
