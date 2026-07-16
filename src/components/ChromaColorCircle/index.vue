<template>
  <a-popover v-if="uniqueColors.length" placement="top" trigger="hover">
    <template #content>
      <a-space direction="vertical" size="small">
        <a-space v-for="color in uniqueColors" :key="color" size="small">
          <span class="color-swatch" :style="{ backgroundColor: color }" />
          <span class="color-value">{{ color }}</span>
        </a-space>
      </a-space>
    </template>
    <span class="color-circle" :style="circleStyle" />
  </a-popover>
  <span v-else class="color-circle empty" />
</template>

<script setup lang="ts">
const props = defineProps<{ colors?: string | string[] | null }>()

const uniqueColors = computed(() => {
  let colors: unknown = props.colors
  if (typeof colors === 'string') {
    try {
      colors = JSON.parse(colors)
    } catch {
      return []
    }
  }
  if (!Array.isArray(colors)) return []
  return [...new Set(colors.filter(color => /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/.test(color)))]
})

const circleStyle = computed(() => {
  if (uniqueColors.value.length === 1) return { backgroundColor: uniqueColors.value[0] }
  if (!uniqueColors.value.length) return {}
  const size = 100 / uniqueColors.value.length
  const stops = uniqueColors.value.map(
    (color, index) => `${color} ${index * size}% ${(index + 1) * size}%`
  )
  return { background: `conic-gradient(from 45deg, ${stops.join(', ')})` }
})
</script>

<style scoped>
.color-circle {
  display: inline-block;
  width: 30px;
  height: 30px;
  vertical-align: middle;
  border: 2px solid #d4af37;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgb(0 0 0 / 28%);
  cursor: pointer;
}

.color-circle.empty {
  background: transparent;
  cursor: default;
}

.color-swatch {
  width: 22px;
  height: 22px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
}

.color-value {
  font-family: monospace;
}
</style>
