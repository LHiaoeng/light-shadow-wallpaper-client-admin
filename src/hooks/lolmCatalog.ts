import type { ApiResult } from '@/api/types'
import { FormAction } from '@/hooks/form'
import { doRequest } from '@/utils/axios/request'
import type { Ref } from 'vue'

export const LOLM_CATALOG_STATUS = {
  AUTOMATIC: 0,
  MANUAL: 1,
  NOT_DELETED: 0,
  DELETED: 1
} as const

interface LolmCatalogItem {
  id?: number
}

interface LolmCatalogPageApi<T extends LolmCatalogItem> {
  get: (id: number) => Promise<ApiResult<T>>
  remove: (id: number) => Promise<ApiResult<void>>
  restore: (id: number) => Promise<ApiResult<void>>
  restoreAuto: (id: number) => Promise<ApiResult<void>>
  sync: () => Promise<ApiResult<void>>
}

export function useLolmCatalogSearch<T extends Record<string, unknown>>(
  initialValues: T,
  reloadTable: (resetPageIndex?: boolean) => void
) {
  const formModel = reactive({ ...initialValues }) as T
  const searchParams = ref<T>({ ...initialValues })

  const search = () => {
    searchParams.value = { ...formModel }
    reloadTable(true)
  }

  const resetSearch = () => {
    Object.assign(formModel, initialValues)
    search()
  }

  return { formModel, searchParams, search, resetSearch }
}

export function useLolmCatalogPageActions<T extends LolmCatalogItem>(
  api: LolmCatalogPageApi<T>,
  reloadTable: () => void
) {
  const detail = ref<T>()
  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const syncLoading = ref(false)

  const showDetail = (record: T) => {
    detail.value = undefined
    detailVisible.value = true
    detailLoading.value = true
    doRequest(api.get(record.id!), {
      onSuccess: res => {
        detail.value = res.data
      },
      onFinally: () => {
        detailLoading.value = false
      }
    })
  }

  const remove = (record: T) =>
    doRequest(api.remove(record.id!), {
      successMessage: '删除成功',
      onSuccess: reloadTable
    })

  const restore = (record: T) =>
    doRequest(api.restore(record.id!), {
      successMessage: '恢复成功',
      onSuccess: reloadTable
    })

  const restoreAuto = (record: T) =>
    doRequest(api.restoreAuto(record.id!), {
      successMessage: '已恢复自动同步',
      onSuccess: reloadTable
    })

  const handleSync = () => {
    syncLoading.value = true
    doRequest(api.sync(), {
      successMessage: '目录同步完成',
      onSuccess: reloadTable,
      onFinally: () => {
        syncLoading.value = false
      }
    })
  }

  return {
    detail,
    detailVisible,
    detailLoading,
    syncLoading,
    showDetail,
    remove,
    restore,
    restoreAuto,
    handleSync
  }
}

interface FormValidationRef {
  value?: {
    validate: () => Promise<unknown>
    clearValidate?: () => void
  }
}

interface LolmCatalogFormOptions {
  formRef: FormValidationRef
  formAction: Ref<FormAction>
  submitLoading: Ref<boolean>
  create: () => Promise<ApiResult<void>>
  update: () => Promise<ApiResult<void>>
  closeModal: () => void
  onSuccess: () => void
}

export function resetLolmCatalogForm<T extends object>(
  formModel: T,
  initialValues: T,
  formRef: FormValidationRef
) {
  Object.assign(formModel, initialValues)
  formRef.value?.clearValidate?.()
}

export function useLolmCatalogFormSubmit(options: LolmCatalogFormOptions) {
  return async () => {
    if (!options.formRef.value) return
    try {
      await options.formRef.value.validate()
    } catch {
      return
    }

    options.submitLoading.value = true
    const request =
      options.formAction.value === FormAction.CREATE ? options.create() : options.update()
    doRequest(request, {
      successMessage: options.formAction.value === FormAction.CREATE ? '新增成功' : '保存成功',
      onSuccess: () => {
        options.closeModal()
        options.onSuccess()
      },
      onFinally: () => {
        options.submitLoading.value = false
      }
    })
  }
}
