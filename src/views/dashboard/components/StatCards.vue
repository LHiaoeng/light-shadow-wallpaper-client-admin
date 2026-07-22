<template>
  <a-row :gutter="16">
    <a-col v-for="item in cards" :key="item.key" :xs="24" :sm="12" :md="6">
      <a-card :bordered="false" class="stat-card">
        <a-statistic :title="t(item.titleKey)" :value="statistics[item.key]" :loading="loading" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDashboardStatistics } from '@/api/dashboard'
import type { DashboardStatisticsVO } from '@/api/dashboard/types'

const { t } = useI18n()
const loading = ref(true)
const statistics = ref<DashboardStatisticsVO>({
  wallpaperTotal: 0,
  wallpaperToday: 0,
  userTotal: 0,
  visitToday: 0
})

const cards = [
  { key: 'wallpaperTotal', titleKey: 'dashboard.stat.wallpaperTotal' },
  { key: 'wallpaperToday', titleKey: 'dashboard.stat.wallpaperToday' },
  { key: 'userTotal', titleKey: 'dashboard.stat.userTotal' },
  { key: 'visitToday', titleKey: 'dashboard.stat.visitToday' }
] as const

onMounted(async () => {
  try {
    const { data } = await getDashboardStatistics()
    if (data?.code === 200 && data.data) {
      statistics.value = data.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 16px;
}
</style>
