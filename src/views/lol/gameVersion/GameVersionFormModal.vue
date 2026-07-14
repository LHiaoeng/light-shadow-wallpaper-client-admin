<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    :width="760"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>
      <a-form-item label="游戏版本" v-bind="validateInfos.gameVer">
        <a-input v-model:value="formModel.gameVer" placeholder="例如 26.13" />
      </a-form-item>
      <a-form-item label="国服公告链接" v-bind="validateInfos.cnPatchUrl">
        <a-input v-model:value="formModel.cnPatchUrl" placeholder="https://lol.qq.com/..." />
      </a-form-item>
      <a-form-item label="直营服公告链接" v-bind="validateInfos.globalPatchUrl">
        <a-input
          v-model:value="formModel.globalPatchUrl"
          placeholder="https://www.leagueoflegends.com/..."
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { createGameVersion, updateGameVersion } from '@/api/lol/gameVersion'
import type { GameVersionDTO, GameVersionPageVO } from '@/api/lol/gameVersion/types'
import type { FormRequestMapping } from '@/hooks/form'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import { useModal } from '@/hooks/modal'
import type { ColProps } from 'ant-design-vue'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 6 } }
const wrapperCol: ColProps = { sm: { span: 24 }, md: { span: 17 } }
const versionPattern = /^\d+\.\d+$/
const httpUrlPattern = /^https?:\/\/[^\s]+$/i

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()

const getDefaultFormModel = (): GameVersionDTO => ({
  id: undefined,
  gameVer: '',
  cnPatchUrl: '',
  globalPatchUrl: ''
})

const formModel = reactive<GameVersionDTO>(getDefaultFormModel())
const formRule = reactive({
  gameVer: [
    { required: true, message: '请输入游戏版本' },
    { pattern: versionPattern, message: '游戏版本格式应为 26.13' }
  ],
  cnPatchUrl: [
    { required: true, message: '请输入国服版本公告链接' },
    { pattern: httpUrlPattern, message: '请输入有效的 HTTP(S) 链接' }
  ],
  globalPatchUrl: [
    { required: true, message: '请输入直营服版本公告链接' },
    { pattern: httpUrlPattern, message: '请输入有效的 HTTP(S) 链接' }
  ]
})
const formRequestMapping: FormRequestMapping<GameVersionDTO> = {
  [FormAction.CREATE]: createGameVersion,
  [FormAction.UPDATE]: updateGameVersion
}

const { submitLoading, validateAndSubmit, resetFields, validateInfos } = useAdminForm(
  formAction,
  formRequestMapping,
  formModel,
  formRule
)

const resetFormModel = () => {
  Object.assign(formModel, getDefaultFormModel())
}

const handleSubmit = () => {
  formModel.gameVer = formModel.gameVer.trim()
  formModel.cnPatchUrl = formModel.cnPatchUrl.trim()
  formModel.globalPatchUrl = formModel.globalPatchUrl.trim()

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
  open(newFormAction: FormAction, record?: GameVersionPageVO) {
    openModal()
    resetFields()
    resetFormModel()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新增游戏版本'
    } else {
      title.value = '编辑游戏版本'
      if (record) {
        Object.assign(formModel, record)
      }
    }
    formAction.value = newFormAction
  }
})
</script>
