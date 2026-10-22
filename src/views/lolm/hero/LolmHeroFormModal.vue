<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    :width="720"
    @ok="handleSubmit"
    @cancel="closeModal"
  >
    <a-form ref="formRef" :model="formModel" :rules="rules" :label-col="labelCol">
      <a-form-item label="来源英雄 ID" name="heroId">
        <a-input v-model:value="formModel.heroId" :disabled="isUpdateForm" />
      </a-form-item>
      <a-form-item label="名称" name="name">
        <a-input v-model:value="formModel.name" />
      </a-form-item>
      <a-form-item label="称号" name="title">
        <a-input v-model:value="formModel.title" />
      </a-form-item>
      <a-form-item label="定位" name="roles">
        <a-input v-model:value="formModel.roles" />
      </a-form-item>
      <a-form-item label="分路" name="lane">
        <a-input v-model:value="formModel.lane" />
      </a-form-item>
      <a-form-item label="简介" name="intro">
        <a-textarea v-model:value="formModel.intro" :rows="3" />
      </a-form-item>
      <a-form-item label="头像地址" name="avatar">
        <a-input v-model:value="formModel.avatar" />
      </a-form-item>
      <a-form-item label="卡片地址" name="card">
        <a-input v-model:value="formModel.card" />
      </a-form-item>
      <a-form-item label="海报地址" name="poster">
        <a-input v-model:value="formModel.poster" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { createLolmHero, updateLolmHero } from '@/api/lolmCatalog'
import type { LolmHero } from '@/api/lolmCatalog/types'
import { FormAction, useFormAction } from '@/hooks/form'
import { useModal } from '@/hooks/modal'
import { doRequest } from '@/utils/axios/request'
import type { ColProps } from 'ant-design-vue'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 5 } }
const emits = defineEmits<{ (event: 'submit-success'): void }>()
const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()
const formRef = ref()
const submitLoading = ref(false)
const formModel = reactive<LolmHero>({})
const rules = {
  heroId: [{ required: true, whitespace: true, message: '请输入来源英雄 ID' }]
}

const resetForm = () => {
  Object.assign(formModel, {
    id: undefined,
    heroId: undefined,
    name: undefined,
    title: undefined,
    roles: undefined,
    lane: undefined,
    intro: undefined,
    avatar: undefined,
    card: undefined,
    poster: undefined
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitLoading.value = true
  const request =
    formAction.value === FormAction.CREATE
      ? createLolmHero({ ...formModel })
      : updateLolmHero({ ...formModel })
  doRequest(request, {
    successMessage: formAction.value === FormAction.CREATE ? '新增成功' : '保存成功',
    onSuccess: () => {
      closeModal()
      emits('submit-success')
    },
    onFinally: () => {
      submitLoading.value = false
    }
  })
}

defineExpose({
  open(action: FormAction, record?: LolmHero) {
    resetForm()
    Object.assign(formModel, record || {})
    formAction.value = action
    title.value = action === FormAction.CREATE ? '新增手游英雄' : '编辑手游英雄'
    openModal()
  }
})
</script>
