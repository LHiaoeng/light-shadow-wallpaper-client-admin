import httpClient from '@/utils/axios'
import type { ApiResult } from '@/api/types'
import type { CustomerCreateResult, CustomerPageQuery, CustomerPageVO } from './types'

export function pageCustomers(query: CustomerPageQuery) {
  return httpClient.get<ApiResult<{ records: CustomerPageVO[]; total: number }>>(
    '/system/customer/page',
    {
      params: query
    }
  )
}

export function createCustomer(data: { username: string; nickname: string; password: string }) {
  return httpClient.post<ApiResult<CustomerCreateResult>>('/system/customer', data)
}

export function recordCustomerDelivery(userId: number, data: { recipient: string }) {
  return httpClient.post<ApiResult<void>>(`/system/customer/${userId}/delivery`, data)
}

export function resetCustomerPassword(userId: number, data: { password: string }) {
  return httpClient.post<ApiResult<CustomerCreateResult>>(
    `/system/customer/${userId}/reset-password`,
    data
  )
}

export function freezeCustomer(userId: number) {
  return httpClient.post<ApiResult<void>>(`/system/customer/${userId}/freeze`)
}

export function unfreezeCustomer(userId: number) {
  return httpClient.post<ApiResult<void>>(`/system/customer/${userId}/unfreeze`)
}
