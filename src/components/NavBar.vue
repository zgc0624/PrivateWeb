<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { Sun, Moon, Wrench, LogIn, LogOut, User } from 'lucide-vue-next'

const router = useRouter()
const { theme, toggleTheme } = useTheme()
const { isAuthenticated, userEmail, signOut } = useAuth()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

async function handleSignOut() {
  await signOut()
  userMenuOpen.value = false
  router.push('/')
}
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

          <div v-if="isAuthenticated" class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <User :size="18" />
              <span class="hidden sm:inline max-w-[120px] truncate">{{ userEmail }}</span>
            </button>
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 card py-2 shadow-xl"
            >
              <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mb-1">
                {{ userEmail }}
              </div>
              <button
                @click="handleSignOut"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut :size="16" /> 退出登录
              </button>
            </div>
          </div>

          <router-link
            v-else
            to="/login"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <LogIn :size="18" />
            <span class="hidden sm:inline">登录</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
