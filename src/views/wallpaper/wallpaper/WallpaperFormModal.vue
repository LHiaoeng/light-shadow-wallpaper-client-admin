<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="860"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <template #footer>
      <a-button key="back" @click="handleClose">取消</a-button>
      <a-button key="submit" type="primary" :loading="submitLoading" @click="handleSubmit">
        保存
      </a-button>
    </template>

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
      <a-form-item v-if="formModel.source === 2" label="必应地区">
        <a-input v-model:value="formModel.bingCountry" allow-clear />
      </a-form-item>
      <a-form-item label="壁纸状态">
        <dict-select v-model:value="formModel.status" dict-code="wallpaper_status" />
      </a-form-item>
      <a-form-item label="壁纸标题">
        <a-input v-model:value="formModel.title" placeholder="请输入壁纸标题" allow-clear />
      </a-form-item>
      <a-form-item label="标题链接">
        <a-input v-model:value="formModel.titleLink" placeholder="请输入标题链接" allow-clear />
      </a-form-item>

      <a-divider orientation="left">原始资源</a-divider>
      <a-form-item :label="formModel.type === 2 ? '视频地址' : '图片地址'">
        <wallpaper-resource-upload
          v-model:value="formModel.url"
          :accept="formModel.type === 2 ? 'video/*' : 'image/*'"
          :preview-type="formModel.type === 2 ? 'video' : 'image'"
          :upload-directory="formModel.type === 2 ? 'wallpaper/video/original' : 'wallpaper/image/original'"
          placeholder="请输入或上传主资源地址"
        />
      </a-form-item>
      <a-form-item label="海报地址">
        <wallpaper-resource-upload
          v-model:value="formModel.poster"
          accept="image/*"
          preview-type="image"
          upload-directory="wallpaper/poster/original"
          placeholder="请输入或上传海报地址"
        />
      </a-form-item>

      <a-divider orientation="left">OSS 备份资源</a-divider>
      <a-form-item :label="formModel.type === 2 ? '备份视频' : '备份图片'">
        <wallpaper-resource-upload
          v-model:value="formModel.urlBackup"
          :accept="formModel.type === 2 ? 'video/*' : 'image/*'"
          :preview-type="formModel.type === 2 ? 'video' : 'image'"
          :upload-directory="formModel.type === 2 ? 'wallpaper/video/backup' : 'wallpaper/image/backup'"
          :placeholder="formModel.type === 2 ? '请输入或上传 OSS 备份视频地址' : '请输入或上传 OSS 备份图片地址'"
        />
      </a-form-item>
      <a-form-item label="备份海报">
        <wallpaper-resource-upload
          v-model:value="formModel.posterBackup"
          accept="image/*"
          preview-type="image"
          upload-directory="wallpaper/poster/backup"
          placeholder="请输入或上传 OSS 备份海报地址"
        />
      </a-form-item>

      <a-form-item v-if="formModel.source === 2" label="壁纸默认地址">
        <a-input v-model:value="formModel.urlBase" placeholder="请输入壁纸默认地址" allow-clear />
      </a-form-item>
      <a-form-item label="版权信息">
        <a-input v-model:value="formModel.copyright" placeholder="请输入版权信息" allow-clear />
      </a-form-item>
      <a-form-item label="版权链接">
        <a-input v-model:value="formModel.copyrightLink" placeholder="请输入版权链接" allow-clear />
      </a-form-item>
      <a-form-item label="壁纸描述">
        <a-textarea
          v-model:value="formModel.description"
          placeholder="请输入壁纸描述"
          auto-size
          allow-clear
        />
      </a-form-item>
      <a-form-item label="上架时间">
        <a-date-picker
          v-model:value="formModel.launchTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
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
import dayjs from 'dayjs'
import WallpaperResourceUpload from './WallpaperResourceUpload.vue'

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

const formModel = reactive<WallpaperDTO>({
  id: undefined,
  type: 1,
  title: '',
  titleLink: '',
  url: '',
  urlBase: '',
  poster: '',
  urlBackup: '',
  posterBackup: '',
  copyright: '英雄联盟',
  copyrightLink: 'https://lol.qq.com/',
  description: '',
  source: 1,
  launchTime: '',
  status: 0,
  bingCountry: ''
})

const formRule = reactive({})

const formRequestMapping: FormRequestMapping<WallpaperDTO> = {
  [FormAction.CREATE]: createWallpaper,
  [FormAction.UPDATE]: updateWallpaper
}

const { submitLoading, validateAndSubmit, resetFields } = useAdminForm(
  formAction,
  formRequestMapping,
  formModel,
  formRule
)

const handleSubmit = () => {
  const model = { ...formModel }
  validateAndSubmit(model, {
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
