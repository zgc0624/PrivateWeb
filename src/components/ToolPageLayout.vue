<script setup lang="ts">
import { type Component } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

interface Props {
  icon: Component
  title: string
  description: string
  gradient: string
}

defineProps<Props>()
const router = useRouter()
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 sm:py-12">
    <button
      @click="router.push('/')"
      class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors group"
    >
      <ArrowLeft :size="18" class="group-hover:-translate-x-1 transition-transform" />
      <span>返回首页</span>
    </button>

    <div class="flex items-center gap-4 mb-8">
      <div
        class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        :class="gradient"
      >
        <component :is="icon" :size="28" class="text-white" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">{{ description }}</p>
      </div>
    </div>

    <slot />
  </div>
</template>
