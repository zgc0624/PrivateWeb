<script setup lang="ts">
import { type Component } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  icon: Component
  title: string
  description: string
  to: string
  gradient: string
}

defineProps<Props>()
const router = useRouter()
</script>

<template>
  <div
    class="card card-hover p-6 group opacity-0-init animate-fade-in-up"
    @click="router.push(to)"
  >
    <div
      class="tool-icon-wrapper"
      :class="gradient"
    >
      <component :is="icon" :size="26" class="text-white drop-shadow-md" />
    </div>
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
