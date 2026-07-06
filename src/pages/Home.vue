<script setup lang="ts">
import { ref, computed } from 'vue'
import { QrCode, ImageIcon, Ruler, CalendarDays, Search, Sparkles, Zap, ShieldCheck, HardDrive } from 'lucide-vue-next'
import ToolCard from '@/components/ToolCard.vue'

const searchQuery = ref('')

const tools = [
  {
    id: 'qrcode',
    title: '二维码工具',
    description: '快速生成和解析二维码，支持WiFi、联系人等快捷模板，一键下载',
    icon: QrCode,
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    to: '/tools/qrcode'
  },
  {
    id: 'image-process',
    title: '图片处理',
    description: '图片压缩、格式转换、尺寸调整，本地处理保护隐私，支持批量',
    icon: ImageIcon,
    gradient: 'bg-gradient-to-br from-rose-500 to-orange-500',
    to: '/tools/image-process'
  },
  {
    id: 'unit-converter',
    title: '单位换算',
    description: '长度、重量、温度、面积等常用单位实时换算，简单直观',
    icon: Ruler,
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    to: '/tools/unit-converter'
  },
  {
    id: 'date-calc',
    title: '日期计算',
    description: '计算日期差、推算日期，支持天数/周/月/年，快捷按钮一键直达',
    icon: CalendarDays,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    to: '/tools/date-calc'
  },
  {
    id: 'cloud-drive',
    title: '文件云盘',
    description: '上传文件到云端，生成带提取码的分享链接，随时随地存取文件',
    icon: HardDrive,
    gradient: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    to: '/cloud'
  }
]

const filteredTools = computed(() => {
  if (!searchQuery.value.trim()) return tools
  const q = searchQuery.value.toLowerCase()
  return tools.filter(t =>
    t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <section class="relative pt-16 sm:pt-24 pb-12 sm:pb-16 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-medium mb-6 opacity-0-init animate-fade-in-up">
          <Sparkles :size="16" />
          <span>所有工具免费使用，开箱即用</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 opacity-0-init animate-fade-in-up animate-delay-100">
          <span class="text-gray-900 dark:text-white">常用工具，</span>
          <span class="text-gradient">即开即用</span>
        </h1>

        <p class="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed opacity-0-init animate-fade-in-up animate-delay-200">
          一个简洁美观的在线工具箱，包含二维码生成、图片处理、单位换算、日期计算等实用工具，以及文件云盘功能。工具类功能在浏览器本地运行，云盘文件安全存储在云端。
        </p>

        <div class="relative max-w-xl mx-auto mb-10 opacity-0-init animate-fade-in-up animate-delay-300">
          <Search :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具..."
            class="input-field pl-12 py-4 text-base shadow-lg shadow-gray-200/50 dark:shadow-black/20 rounded-2xl"
          />
        </div>

        <div class="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 opacity-0-init animate-fade-in-up animate-delay-400">
          <div class="flex items-center gap-2">
            <Zap :size="18" class="text-accent-500" />
            <span>快速便捷</span>
          </div>
          <div class="flex items-center gap-2">
            <ShieldCheck :size="18" class="text-emerald-500" />
            <span>隐私保护</span>
          </div>
          <div class="flex items-center gap-2">
            <Sparkles :size="18" class="text-primary-500" />
            <span>完全免费</span>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 pb-20">
      <div class="max-w-6xl mx-auto">
        <div v-if="filteredTools.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            v-for="(tool, index) in filteredTools"
            :key="tool.id"
            :icon="tool.icon"
            :title="tool.title"
            :description="tool.description"
            :to="tool.to"
            :gradient="tool.gradient"
            :style="{ animationDelay: `${(index + 1) * 100 + 400}ms` }"
          />
        </div>
        <div v-else class="text-center py-16">
          <p class="text-gray-400 dark:text-gray-500 text-lg">没有找到匹配的工具</p>
        </div>
      </div>
    </section>
  </div>
</template>
