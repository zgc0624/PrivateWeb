<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, Wrench } from 'lucide-vue-next'

const { theme, toggleTheme } = useTheme()
const mobileMenuOpen = ref(false)
</script>

<template>
  <nav class="glass-nav sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
            <Wrench class="w-5 h-5 text-white" :size="20" />
          </div>
          <span class="text-lg font-bold text-gray-900 dark:text-white">实用工具箱</span>
        </router-link>

        <div class="flex items-center gap-2">
          <button
            @click="toggleTheme"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            :title="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          >
            <Sun v-if="theme === 'dark'" :size="20" />
            <Moon v-else :size="20" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
