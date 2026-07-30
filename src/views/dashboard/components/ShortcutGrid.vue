<template>
  <a-space direction="vertical" :size="16" style="width: 100%">
    <a-card
      v-for="group in visibleGroups"
      :key="group.groupKey"
      :title="t(group.groupKey)"
      :bordered="false"
    >
      <a-row :gutter="[16, 16]">
        <a-col v-for="item in group.items" :key="item.target" :xs="12" :sm="8" :md="6" :lg="4">
          <a-card
            hoverable
            :body-style="{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '72px' }"
            @click="go(item.target)"
          >
            <a-space :size="10" align="center">
              <component :is="item.icon" :style="{ display: 'block' }" />
              <span :style="{ fontSize: '14px', lineHeight: 1 }">{{ t(item.titleKey) }}</span>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </a-space>
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
