<template>
  <a-card
    v-for="group in visibleGroups"
    :key="group.groupKey"
    :title="t(group.groupKey)"
    :bordered="false"
    class="shortcut-group"
  >
    <a-row :gutter="[16, 16]">
      <a-col v-for="item in group.items" :key="item.target" :xs="12" :sm="8" :md="6" :lg="4">
        <a-card hoverable class="shortcut-card" @click="go(item.target)">
          <component :is="item.icon" class="shortcut-icon" />
          <span class="shortcut-title">{{ t(item.titleKey) }}</span>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { shortcutGroups, useShortcutVisible } from '../shortcuts'

const { t } = useI18n()
const router = useRouter()
const isVisible = useShortcutVisible()

const visibleGroups = computed(() =>
  shortcutGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => isVisible(item.target))
    }))
    .filter(group => group.items.length > 0)
)

const go = (target: string) => router.push(target)
</script>

<style scoped>
.shortcut-group {
  margin-bottom: 16px;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
}

.shortcut-icon {
  font-size: 28px;
  color: var(--primary-color, #1890ff);
  margin-bottom: 8px;
}

.shortcut-title {
  font-size: 14px;
}
</style>
