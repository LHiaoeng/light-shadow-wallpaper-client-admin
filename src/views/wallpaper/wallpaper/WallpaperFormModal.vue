<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>
      <a-form-item label="壁纸类型">
        <dict-select v-model:value="formModel.type" dict-code="wallpaper_type" />
      </a-form-item>
      <a-form-item label="壁纸来源">
        <dict-select v-model:value="formModel.source" dict-code="wallpaper_source" />
      </a-form-item>
      <a-form-item label="必应壁纸所属地区">
        <a-input v-model:value="formModel.bingCountry" />
      </a-form-item>
      <a-form-item label="壁纸状态">
        <dict-select v-model:value="formModel.status" dict-code="wallpaper_status" />
      </a-form-item>
      <a-form-item label="壁纸标题">
        <a-input v-model:value="formModel.title" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="标题链接">
        <a-input v-model:value="formModel.titleLink" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="壁纸网址">
        <a-input v-model:value="formModel.url" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="壁纸默认地址">
        <a-input v-model:value="formModel.urlBase" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="预览海报地址">
        <a-input v-model:value="formModel.poster" placeholder="请输入预览海报地址" />
      </a-form-item>
      <a-form-item label="版权信息">
        <a-input v-model:value="formModel.copyright" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="版权信息链接">
        <a-input v-model:value="formModel.copyrightLink" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="壁纸描述">
        <a-textarea v-model:value="formModel.description" placeholder="请输入壁纸描述" auto-size />
      </a-form-item>

      <a-form-item label="上架时间">
        <a-date-picker
          v-model:value="formModel.launchTime"
          format="YYYY-MM-DD 00:00:00"
          value-format="YYYY-MM-DD 00:00:00"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import { FormAction, useAdminForm, useFormAction } from '@/hooks/form'
import type { FormRequestMapping } from '@/hooks/form'
import type { WallpaperDTO, WallpaperPageVO } from '@/api/wallpaper/wallpaper/types'
import { createWallpaper, updateWallpaper } from '@/api/wallpaper/wallpaper'
import { overrideProperties } from '@/utils/bean-utils'
import type { ColProps } from 'ant-design-vue'
import { DictSelect } from '@/components/Dict'

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
const formModel = reactive<WallpaperDTO>({
  // 主键id
  id: undefined,
  // 壁纸类型。1：图片；2：视频
  type: 1,
  // 壁纸标题
  title: '',
  // 标题链接
  titleLink: '',
  // 壁纸网址
  url: '',
  // 壁纸默认地址
  urlBase: '',
  // 预览海报
  poster: '',
  // 版权信息
  copyright: '英雄联盟',
  // 版权信息链接
  copyrightLink: 'https://lol.qq.com/',
  // 壁纸描述
  description: '',
  // 壁纸来源(0-默认未知,1-英雄联盟,2-必应)
  source: 1,
  // 上架时间
  launchTime: '',
  // 壁纸状态(0-启用,1-停用)
  status: 0,
  // 必应壁纸所属地区
  bingCountry: ''
})

// 表单的校验规则
const formRule = reactive({})

// 表单的提交请求
const formRequestMapping: FormRequestMapping<WallpaperDTO> = {
  [FormAction.CREATE]: createWallpaper,
  [FormAction.UPDATE]: updateWallpaper
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
  open(newFormAction: FormAction, record?: WallpaperPageVO) {
    openModal()
    resetFields()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新建壁纸'
    } else {
      title.value = '编辑壁纸'
      overrideProperties(formModel, record)
    }
    formAction.value = newFormAction
  }
})
</script>
