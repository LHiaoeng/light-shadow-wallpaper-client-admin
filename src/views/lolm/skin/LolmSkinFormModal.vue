<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    :width="760"
    @ok="handleSubmit"
    @cancel="closeModal"
  >
    <a-form ref="formRef" :model="formModel" :rules="rules" :label-col="labelCol">
      <a-form-item label="来源皮肤 ID" name="skinId">
        <a-input v-model:value="formModel.skinId" :disabled="isUpdateForm" />
      </a-form-item>
      <a-form-item label="所属英雄" name="heroId">
        <a-select
          v-model:value="formModel.heroId"
          show-search
          option-filter-prop="label"
          :disabled="isUpdateForm && heroLoading"
          :loading="heroLoading"
          placeholder="请选择未删除的手游英雄"
        >
          <a-select-option
            v-for="hero in heroes"
            :key="hero.heroId"
            :value="hero.heroId"
            :label="`${hero.name || ''} ${hero.heroId || ''}`"
          >
            {{ hero.name || '未命名英雄' }}（{{ hero.heroId }}）
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="名称" name="name"><a-input v-model:value="formModel.name" /></a-form-item>
      <a-form-item label="简介" name="briefIntro">
        <a-textarea v-model:value="formModel.briefIntro" :rows="3" />
      </a-form-item>
      <a-form-item label="品质" name="quality"
        ><a-input v-model:value="formModel.quality"
      /></a-form-item>
      <a-form-item label="价格" name="couponPrice"
        ><a-input v-model:value="formModel.couponPrice"
      /></a-form-item>
      <a-form-item label="排序权重" name="sortWeight"
        ><a-input v-model:value="formModel.sortWeight"
      /></a-form-item>
      <a-form-item label="头像图地址" name="headIconPic"
        ><a-input v-model:value="formModel.headIconPic"
      /></a-form-item>
      <a-form-item label="卡片地址" name="card"
        ><a-input v-model:value="formModel.card"
      /></a-form-item>
      <a-form-item label="海报地址" name="poster"
        ><a-input v-model:value="formModel.poster"
      /></a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { createLolmSkin, pageLolmHero, updateLolmSkin } from '@/api/lolmCatalog'
import type { LolmHero, LolmSkin } from '@/api/lolmCatalog/types'
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
const heroLoading = ref(false)
const heroes = ref<LolmHero[]>([])
const formModel = reactive<LolmSkin>({})
const rules = {
  skinId: [{ required: true, whitespace: true, message: '请输入来源皮肤 ID' }],
  heroId: [{ required: true, whitespace: true, message: '请选择所属英雄' }]
}

const loadHeroes = () => {
  if (heroes.value.length || heroLoading.value) return
  heroLoading.value = true
  doRequest(pageLolmHero({ current: 1, size: 500, deleted: 0 }), {
    onSuccess: res => {
      heroes.value = res.data.records
    },
    onFinally: () => {
      heroLoading.value = false
    }
  })
}

const resetForm = () => {
  Object.assign(formModel, {
    id: undefined,
    skinId: undefined,
    heroId: undefined,
    name: undefined,
    briefIntro: undefined,
    quality: undefined,
    couponPrice: undefined,
    sortWeight: undefined,
    headIconPic: undefined,
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
      ? createLolmSkin({ ...formModel })
      : updateLolmSkin({ ...formModel })
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
  open(action: FormAction, record?: LolmSkin) {
    loadHeroes()
    resetForm()
    Object.assign(formModel, record || {})
    formAction.value = action
    title.value = action === FormAction.CREATE ? '新增手游皮肤' : '编辑手游皮肤'
    openModal()
  }
})
</script>
