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
            <a-textarea
              v-model:value="formModel.description"
              :auto-size="{ minRows: 2, maxRows: 5 }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="英文描述" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea
              v-model:value="formModel.descriptionEng"
              :auto-size="{ minRows: 2, maxRows: 5 }"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-divider orientation="left">稀有度与状态</a-divider>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="国服稀有度">
            <a-select
              v-model:value="regionRarityIdValue"
              allow-clear
              show-search
              option-label-prop="label"
              :filter-option="filterDictOption"
            >
              <a-select-option
                v-for="item in cnRarityDictItems"
                :key="item.id"
                :value="String(item.value)"
                :label="item.name"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img
                    v-if="getCnRarityIconUrl(item.value)"
                    :src="getCnRarityIconUrl(item.value)"
                  />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="直营服稀有度">
            <a-select
              v-model:value="formModel.rarity"
              allow-clear
              show-search
              option-label-prop="label"
              :filter-option="filterDictOption"
            >
              <a-select-option
                v-for="item in globalRarityDictItems"
                :key="item.id"
                :value="item.value"
                :label="item.name"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img
                    v-if="getGlobalRarityIconUrl(item.value)"
                    :src="getGlobalRarityIconUrl(item.value)"
                  />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
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
          <a-form-item label="老版载入图">
            <a-input v-model:value="formModel.loadScreenVintagePath" />
            <div v-if="getAssetPreviewUrl(formModel.loadScreenVintagePath)" class="asset-preview">
              <a-image :src="getAssetPreviewUrl(formModel.loadScreenVintagePath)" :width="96" />
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
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="原画视频">
            <a-input v-model:value="formModel.splashVideoPath" />
            <div v-if="getAssetPreviewUrl(formModel.splashVideoPath)" class="asset-link">
              <a
                :href="getAssetPreviewUrl(formModel.splashVideoPath)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开视频
              </a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="预览视频">
            <a-input v-model:value="formModel.previewVideoUrl" />
            <div v-if="getAssetPreviewUrl(formModel.previewVideoUrl)" class="asset-link">
              <a
                :href="getAssetPreviewUrl(formModel.previewVideoUrl)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开视频
              </a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="收藏页视频">
            <a-input v-model:value="formModel.collectionSplashVideoPath" />
            <div v-if="getAssetPreviewUrl(formModel.collectionSplashVideoPath)" class="asset-link">
              <a
                :href="getAssetPreviewUrl(formModel.collectionSplashVideoPath)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开视频
              </a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="卡片悬停视频">
            <a-input v-model:value="formModel.collectionCardHoverVideoPath" />
            <div
              v-if="getAssetPreviewUrl(formModel.collectionCardHoverVideoPath)"
              class="asset-link"
            >
              <a
                :href="getAssetPreviewUrl(formModel.collectionCardHoverVideoPath)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开视频
              </a>
            </div>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-divider orientation="left">关联与原始数据</a-divider>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="任务母皮肤ID">
            <a-input-number v-model:value="formModel.questSkinParentId" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="任务阶段">
            <a-input-number v-model:value="formModel.questSkinStage" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :xl="8" :md="12" :sm="24">
          <a-form-item label="阶段短名称">
            <a-input v-model:value="formModel.questSkinShortName" />
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="英雄数据源">
            <a-input v-model:value="formModel.championDataSourcePath" />
            <div v-if="getDataSourceUrl(formModel.championDataSourcePath)" class="asset-link">
              <a
                :href="getDataSourceUrl(formModel.championDataSourcePath)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开英雄数据
              </a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="皮肤数据源">
            <a-input v-model:value="formModel.skinDataSourcePath" />
            <div v-if="getDataSourceUrl(formModel.skinDataSourcePath)" class="asset-link">
              <a
                :href="getDataSourceUrl(formModel.skinDataSourcePath)"
                target="_blank"
                rel="noopener noreferrer"
              >
                打开皮肤数据
              </a>
            </div>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="皮肤系列">
            <a-select
              v-model:value="skinlineIdList"
              mode="multiple"
              allow-clear
              show-search
              option-label-prop="label"
              :loading="skinlineLoading"
              :filter-option="filterDictOption"
            >
              <a-select-option
                v-for="item in skinlineOptions"
                :key="item.riotSkinlineId"
                :value="String(item.riotSkinlineId)"
                :label="item.name"
                :name="`${item.name || ''} ${item.engName || ''} ${item.riotSkinlineId}`"
              >
                {{ item.name || item.engName || item.riotSkinlineId }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xl="12" :md="12" :sm="24">
          <a-form-item label="徽章">
            <a-select
              v-model:value="emblemNameList"
              mode="multiple"
              allow-clear
              show-search
              option-label-prop="label"
              :filter-option="filterDictOption"
            >
              <a-select-option
                v-for="item in emblemDictItems"
                :key="item.id"
                :value="String(item.value)"
                :label="item.name"
                :disabled="item.disabled"
                :name="item.name"
              >
                <span class="dict-option">
                  <img v-if="getEmblemIconUrl(item.value)" :src="getEmblemIconUrl(item.value)" />
                  <span>{{ item.name }}</span>
                </span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="炫彩 JSON" :label-col="fullLabelCol" :wrapper-col="fullWrapperCol">
            <a-textarea
              v-model:value="formModel.chromasJson"
              class="json-textarea"
              readonly
              :auto-size="{ minRows: 4, maxRows: 10 }"
            />
            <div v-if="chromaItems.length" class="chroma-list">
              <div v-for="chroma in chromaItems" :key="chroma.key" class="chroma-item">
                <a-image
                  v-if="chroma.imageUrl"
                  :src="chroma.imageUrl"
                  :width="96"
                  :height="96"
                  class="chroma-image"
                />
                <div class="chroma-meta">
                  <div class="chroma-name">{{ chroma.name || chroma.id || '-' }}</div>
                  <div v-if="chroma.colors.length" class="chroma-colors">
                    <span
                      v-for="color in chroma.colors"
                      :key="color"
                      class="chroma-color"
                      :style="{ backgroundColor: color }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="任务皮肤 JSON"
            :label-col="fullLabelCol"
            :wrapper-col="fullWrapperCol"
          >
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
import { pageSkinline } from '@/api/lol/skinline'
import type { SkinlinePageVO } from '@/api/lol/skinline/types'
import { toBreadjAssetUrl } from '@/utils/community-dragon-utils'
import { useLolSkinDictPresentation } from './lol-skin-dict-presentation'

const labelCol: ColProps = { sm: { span: 24 }, md: { span: 8 } }
const wrapperCol: ColProps = { sm: { span: 24 }, md: { span: 15 } }
const fullLabelCol: ColProps = { sm: { span: 24 }, md: { span: 3 } }
const fullWrapperCol: ColProps = { sm: { span: 24 }, md: { span: 20 } }

interface ChromaJsonItem {
  id?: number | string
  name?: string
  chromaPath?: string
  colors?: string[]
}

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const { title, visible, openModal, closeModal } = useModal()
const { formAction, isUpdateForm } = useFormAction()
const {
  cnRarityDictItems,
  globalRarityDictItems,
  emblemDictItems,
  getCnRarityIconUrl,
  getGlobalRarityIconUrl,
  getEmblemIconUrl
} = useLolSkinDictPresentation()

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
  loadScreenVintagePath: undefined,
  rarityGemPath: undefined,
  chromaPath: undefined,
  splashVideoPath: undefined,
  previewVideoUrl: undefined,
  collectionSplashVideoPath: undefined,
  collectionCardHoverVideoPath: undefined,
  skinlineIdSets: undefined,
  emblemNames: undefined,
  chromasJson: undefined,
  questSkinInfoJson: undefined,
  questSkinParentId: undefined,
  questSkinStage: undefined,
  questSkinShortName: undefined,
  championDataSourcePath: undefined,
  skinDataSourcePath: undefined
})

const formModel = reactive<LolSkinDTO>(getDefaultFormModel())
const skinlineLoading = ref(false)
const skinlineOptions = ref<SkinlinePageVO[]>([])
const regionRarityIdValue = computed<string | undefined>({
  get: () => {
    if (
      formModel.regionRarityId === undefined ||
      formModel.regionRarityId === null ||
      formModel.regionRarityId === ''
    ) {
      return undefined
    }
    return String(formModel.regionRarityId)
  },
  set: value => {
    formModel.regionRarityId = value
  }
})
const skinlineIdList = computed<string[]>({
  get: () => {
    if (!formModel.skinlineIdSets) {
      return []
    }
    return formModel.skinlineIdSets
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  },
  set: value => {
    formModel.skinlineIdSets = value.length ? value.join(',') : undefined
  }
})
const emblemNameList = computed<string[]>({
  get: () => {
    if (!formModel.emblemNames) {
      return []
    }
    return formModel.emblemNames
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  },
  set: value => {
    formModel.emblemNames = value.length ? value.join(',') : undefined
  }
})

const chromaItems = computed(() => {
  if (!formModel.chromasJson) {
    return []
  }
  try {
    const chromas = JSON.parse(formModel.chromasJson)
    if (!Array.isArray(chromas)) {
      return []
    }
    return chromas.map((item: ChromaJsonItem, index: number) => ({
      key: `${item.id || index}`,
      id: item.id,
      name: item.name,
      colors: Array.isArray(item.colors) ? item.colors : [],
      imageUrl: getAssetPreviewUrl(item.chromaPath)
    }))
  } catch {
    return []
  }
})

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

const getAssetPreviewUrl = (path?: string) => {
  return toBreadjAssetUrl(path, formModel.isPbeOnly === 1 ? 'pbe' : 'latest')
}

const getDataSourceUrl = (path?: string) => {
  return toBreadjAssetUrl(path, formModel.isPbeOnly === 1 ? 'pbe' : 'latest')
}

const filterDictOption = (input: string, option?: { name?: string }) => {
  return String(option?.name || '')
    .toLowerCase()
    .includes(input.toLowerCase())
}

const loadSkinlineOptions = () => {
  if (skinlineOptions.value.length || skinlineLoading.value) {
    return
  }
  skinlineLoading.value = true
  pageSkinline({ current: 1, size: 100, sort: 'riot_skinline_id,asc' })
    .then(res => {
      skinlineOptions.value = res.data.records || []
    })
    .finally(() => {
      skinlineLoading.value = false
    })
}

const resetFormModel = () => {
  Object.assign(formModel, getDefaultFormModel())
}

const formatJsonText = (value?: unknown) => {
  if (value === undefined || value === null || value === '') {
    return value as string | undefined
  }
  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2)
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
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
  formModel.chromasJson = formatJsonText(record.chromasJson)
  formModel.questSkinInfoJson = formatJsonText(record.questSkinInfoJson)
}

defineExpose({
  open(newFormAction: FormAction, record?: LolSkinPageVO) {
    openModal()
    loadSkinlineOptions()
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

.asset-preview,
.asset-link {
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

.chroma-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.chroma-item {
  min-width: 0;
}

.chroma-image :deep(.ant-image-img) {
  object-fit: contain;
}

.chroma-meta {
  margin-top: 6px;
}

.chroma-name {
  overflow: hidden;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chroma-colors {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.chroma-color {
  width: 14px;
  height: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
}

.dict-option {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  img {
    width: 22px;
    height: 22px;
    flex: none;
    object-fit: contain;
  }
}
</style>
