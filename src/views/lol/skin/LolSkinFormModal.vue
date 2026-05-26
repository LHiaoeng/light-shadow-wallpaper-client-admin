<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }"
    :confirm-loading="submitLoading"
    :width="1080"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item v-if="isUpdateForm" style="display: none">
        <a-input v-model:value="formModel.id" />
      </a-form-item>

      <a-row :gutter="[16, 0]">
        <a-col :span="24">
          <a-divider orientation="left">基础信息</a-divider>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="皮肤ID">
            <a-input-number v-model:value="formModel.riotSkinId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="英雄ID">
            <a-input-number v-model:value="formModel.championId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="皮肤类型">
            <a-input v-model:value="formModel.skinType" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="Content ID">
            <a-input v-model:value="formModel.contentId" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="中文名">
            <a-input v-model:value="formModel.name" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="英文名">
            <a-input v-model:value="formModel.nameEng" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="中文描述" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea v-model:value="formModel.description" :auto-size="{ minRows: 2, maxRows: 5 }" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="英文描述" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea v-model:value="formModel.descriptionEng" :auto-size="{ minRows: 2, maxRows: 5 }" />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-divider orientation="left">稀有度与状态</a-divider>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="国服稀有度">
            <dict-select
              v-model:value="formModel.regionRarityId"
              dict-code="lol_skin_rarity_cn"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="直营服稀有度">
            <dict-select
              v-model:value="formModel.rarity"
              dict-code="lol_skin_rarity_global"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="基础皮肤">
            <a-select v-model:value="formModel.isBase">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="PBE">
            <a-select v-model:value="formModel.isPbeOnly">
              <a-select-option :value="1">仅 PBE</a-select-option>
              <a-select-option :value="0">已上线</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="国服绝版">
            <a-select v-model:value="formModel.isLegacy">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="直营服绝版">
            <a-select v-model:value="formModel.isLegacyGlobal">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="PBE 首次发现">
            <a-date-picker
              v-model:value="formModel.pbeFirstSeenTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :show-time="true"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="上架时间">
            <a-date-picker
              v-model:value="formModel.releaseTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :show-time="true"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-divider orientation="left">资源路径</a-divider>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原画路径">
            <a-input v-model:value="formModel.splashPath" />
            <div v-if="getAssetPreviewUrl(formModel.splashPath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.splashPath)" :width="120" />
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="非居中原画">
            <a-input v-model:value="formModel.uncenteredSplashPath" />
            <div v-if="getAssetPreviewUrl(formModel.uncenteredSplashPath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.uncenteredSplashPath)" :width="120" />
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="小图路径">
            <a-input v-model:value="formModel.tilePath" />
            <div v-if="getAssetPreviewUrl(formModel.tilePath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.tilePath)" :width="96" />
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="载入图路径">
            <a-input v-model:value="formModel.loadScreenPath" />
            <div v-if="getAssetPreviewUrl(formModel.loadScreenPath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.loadScreenPath)" :width="96" />
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="稀有度图标">
            <a-input v-model:value="formModel.rarityGemPath" />
            <div v-if="getAssetPreviewUrl(formModel.rarityGemPath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.rarityGemPath)" :width="48" />
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="炫彩路径">
            <a-input v-model:value="formModel.chromaPath" />
            <div v-if="getAssetPreviewUrl(formModel.chromaPath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.chromaPath)" :width="96" />
            </div>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-divider orientation="left">关联与原始数据</a-divider>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="皮肤系列">
            <a-input v-model:value="formModel.skinlineIdSets" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="徽章">
            <a-input v-model:value="formModel.emblemNames" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="炫彩 JSON" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea
              v-model:value="formModel.chromasJson"
              class="json-textarea"
              :auto-size="{ minRows: 4, maxRows: 10 }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="任务皮肤 JSON" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea
              v-model:value="formModel.questSkinInfoJson"
              class="json-textarea"
              :auto-size="{ minRows: 4, maxRows: 10 }"
            />
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
import { DictSelect } from '@/components/Dict'
import { toBreadjAssetUrl } from '@/utils/community-dragon-utils'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 8 } }
const wrapperCol: ColProps = { sm: { span: 24 }, md: { span: 15 } }
const fullLabelCol: ColProps = { sm: { span: 24 }, md: { span: 3 } }
const fullWrapperCol: ColProps = { sm: { span: 24 }, md: { span: 20 } }

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()

const getDefaultFormModel = (): LolSkinDTO => ({
  id: undefined,
  riotSkinId: undefined,
  contentId: undefined,
  championId: undefined,
  isBase: 0,
  name: undefined,
  nameEng: undefined,
  description: undefined,
  descriptionEng: undefined,
  skinType: undefined,
  regionRarityId: undefined,
  rarity: undefined,
  isLegacy: 0,
  isLegacyGlobal: 0,
  isPbeOnly: 0,
  pbeFirstSeenTime: undefined,
  releaseTime: undefined,
  splashPath: undefined,
  uncenteredSplashPath: undefined,
  tilePath: undefined,
  loadScreenPath: undefined,
  rarityGemPath: undefined,
  chromaPath: undefined,
  skinlineIdSets: undefined,
  emblemNames: undefined,
  chromasJson: undefined,
  questSkinInfoJson: undefined
})

const formModel = reactive<LolSkinDTO>(getDefaultFormModel())

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

const getAssetPreviewUrl = (path?: string) => {
  return toBreadjAssetUrl(path, formModel.isPbeOnly === 1 ? 'pbe' : 'latest')
}

const resetFormModel = () => {
  Object.assign(formModel, getDefaultFormModel())
}

const fillFormModel = (record?: LolSkinPageVO) => {
  if (!record) {
    return
  }
  const model = formModel as Record<string, unknown>
  const source = record as Record<string, unknown>
  Object.keys(getDefaultFormModel()).forEach(key => {
    model[key] = source[key]
  })
}

defineExpose({
  open(newFormAction: FormAction, record?: LolSkinPageVO) {
    openModal()
    resetFields()
    resetFormModel()
    if (newFormAction === FormAction.CREATE) {
      title.value = '新增皮肤'
    } else {
      title.value = '编辑皮肤'
      fillFormModel(record)
    }
    formAction.value = newFormAction
  }
})
</script>

<style scoped lang="less">
:deep(.ant-divider-horizontal.ant-divider-with-text-left) {
  margin: 8px 0 18px;
}

.asset-preview {
  margin-top: 8px;
  min-height: 36px;
}

.asset-preview :deep(.ant-image-img) {
  max-height: 72px;
  object-fit: contain;
  object-position: left center;
}

.json-textarea {
  font-family: Consolas, Monaco, 'Courier New', monospace;
}
</style>
