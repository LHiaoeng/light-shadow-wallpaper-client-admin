<template>
  <div class="dashboard">
    <a-card :bordered="false" class="welcome-card">
      <a-typography-title :level="4">{{ t(greeting) }}，{{ username }}！</a-typography-title>
      <a-typography-text type="secondary">{{ today }}</a-typography-text>
    </a-card>

    <stat-cards />

    <shortcut-grid />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user-store'
import StatCards from './components/StatCards.vue'
import ShortcutGrid from './components/ShortcutGrid.vue'

const { t } = useI18n()
const userStore = useUserStore()

const username = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || ''
)

const hour = dayjs().hour()
const greeting = computed(() => {
  if (hour < 6) return 'dashboard.welcome.evening'
  if (hour < 12) return 'dashboard.welcome.morning'
  if (hour < 18) return 'dashboard.welcome.afternoon'
  return 'dashboard.welcome.evening'
})

const today = dayjs().format('YYYY年MM月DD日')
</script>

<style scoped>
.dashboard {
  padding: 8px;
}

.welcome-card {
  margin-bottom: 16px;
}
</style>
