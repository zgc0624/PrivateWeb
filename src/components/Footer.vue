<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
</script>

<template>
  <footer class="relative z-10 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-gray-950/30 backdrop-blur-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p>© {{ new Date().getFullYear() }} 实用工具箱. 所有工具在浏览器本地运行，保护您的隐私。</p>
        <p class="flex items-center gap-1">
          Made with <Heart :size="14" class="text-red-400 fill-red-400" /> for everyday use
        </p>
      </div>
    </div>
  </footer>
</template>
