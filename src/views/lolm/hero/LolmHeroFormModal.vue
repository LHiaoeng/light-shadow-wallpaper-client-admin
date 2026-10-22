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
      <a-form-item label="别名" name="alias">
        <a-input v-model:value="formModel.alias" />
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
      <a-form-item label="难度等级" name="difficultyL">
        <a-input v-model:value="formModel.difficultyL" />
      </a-form-item>
      <a-form-item label="伤害等级" name="damage">
        <a-input v-model:value="formModel.damage" />
      </a-form-item>
      <a-form-item label="生存等级" name="surviveL">
        <a-input v-model:value="formModel.surviveL" />
      </a-form-item>
      <a-form-item label="辅助等级" name="assistL">
        <a-input v-model:value="formModel.assistL" />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-textarea v-model:value="formModel.tags" :rows="2" />
      </a-form-item>
      <a-form-item label="检索词" name="searchkey">
        <a-textarea v-model:value="formModel.searchkey" :rows="2" />
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
import { resetLolmCatalogForm, useLolmCatalogFormSubmit } from '@/hooks/lolmCatalog'
import { useModal } from '@/hooks/modal'
import type { ColProps } from 'ant-design-vue'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 5 } }
const emits = defineEmits<{ (event: 'submit-success'): void }>()
const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()
const formRef = ref()
const submitLoading = ref(false)
const initialFormModel: LolmHero = {
  id: undefined,
  heroId: undefined,
  name: undefined,
  alias: undefined,
  title: undefined,
  roles: undefined,
  lane: undefined,
  difficultyL: undefined,
  damage: undefined,
  surviveL: undefined,
  assistL: undefined,
  tags: undefined,
  searchkey: undefined,
  intro: undefined,
  avatar: undefined,
  card: undefined,
  poster: undefined
}
const formModel = reactive<LolmHero>({ ...initialFormModel })
const rules = {
  heroId: [{ required: true, whitespace: true, message: '请输入来源英雄 ID' }]
}

const resetForm = () => resetLolmCatalogForm(formModel, initialFormModel, formRef)
const handleSubmit = useLolmCatalogFormSubmit({
  formRef,
  formAction,
  submitLoading,
  create: () => createLolmHero({ ...formModel }),
  update: () => updateLolmHero({ ...formModel }),
  closeModal,
  onSuccess: () => emits('submit-success')
})

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
