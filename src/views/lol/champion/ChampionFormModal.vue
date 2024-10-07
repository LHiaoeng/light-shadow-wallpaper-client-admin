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
      <a-form-item label="英雄联盟英雄识别id">
        <a-input v-model:value="formModel.heroId" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄联盟英雄实例id">
        <a-input v-model:value="formModel.instanceId" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄名称">
        <a-input v-model:value="formModel.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄英文名称">
        <a-input v-model:value="formModel.nameEng" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄称号">
        <a-input v-model:value="formModel.title" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄英文称号">
        <a-input v-model:value="formModel.titleEng" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="别称">
        <a-input v-model:value="formModel.alias" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄选取语言">
        <a-input v-model:value="formModel.selectAudio" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄被ban语音">
        <a-input v-model:value="formModel.banAudio" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄定位。例如：mage,support">
        <a-input v-model:value="formModel.roles" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄游戏商场售价">
        <a-input v-model:value="formModel.goldPrice" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="英雄搜索关键词">
        <a-input v-model:value="formModel.keywords" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="方形肖像图片地址">
        <a-input v-model:value="formModel.squarePortraitPath" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import type { FormRequestMapping } from '@/hooks/form'
import type { ChampionDTO, ChampionPageVO } from '@/api/lol/champion/types'
import { createChampion, updateChampion } from '@/api/lol/champion'
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
const formModel = reactive<ChampionDTO>({
  // 主键
  id: undefined,
  // 英雄联盟英雄识别id
  heroId: undefined,
  // 英雄联盟英雄实例id
  instanceId: undefined,
  // 英雄名称
  name: undefined,
  // 英雄英文名称
  nameEng: undefined,
  // 英雄称号
  title: undefined,
  // 英雄英文称号
  titleEng: undefined,
  // 别称
  alias: undefined,
  // 英雄选取语言
  selectAudio: undefined,
  // 英雄被ban语音
  banAudio: undefined,
  // 英雄定位。例如：mage,support
  roles: undefined,
  // 英雄游戏商场售价
  goldPrice: undefined,
  // 英雄搜索关键词
  keywords: undefined,
  // 方形肖像图片地址
  squarePortraitPath: undefined
})

// 表单的校验规则
const formRule = reactive({})

// 表单的提交请求
const formRequestMapping: FormRequestMapping<ChampionDTO> = {
  [FormAction.CREATE]: createChampion,
  [FormAction.UPDATE]: updateChampion
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
  open(newFormAction: FormAction, record?: ChampionPageVO) {
    openModal()
    resetFields()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新建英雄联盟英雄'
    } else {
      title.value = '编辑英雄联盟英雄'
      overrideProperties(formModel, record)
    }
    formAction.value = newFormAction
  }
})
</script>
