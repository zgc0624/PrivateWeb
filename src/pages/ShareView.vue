<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCloudStorage } from '@/composables/useCloudStorage'
import { Lock, Download, AlertCircle, FileText, Loader2, CheckCircle } from 'lucide-vue-next'

const route = useRoute()
const { verifyAndDownload, formatSize, formatDate } = useCloudStorage()

const shareId = route.params.shareId as string
const code = ref('')
const error = ref('')
const loading = ref(false)
const verified = ref(false)
const downloadUrl = ref('')
const fileName = ref('')
const fileSize = ref(0)
const shareInfo = ref<any>(null)
const checking = ref(true)

onMounted(async () => {
  try {
    const { getShare } = useCloudStorage()
    shareInfo.value = await getShare(shareId)
  } catch (e) {
    // ignore
  } finally {
    checking.value = false
  }
})

async function handleVerify() {
  if (!code.value.trim()) {
    error.value = '请输入提取码'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const result = await verifyAndDownload(shareId, code.value.trim())
    if (result) {
      downloadUrl.value = result.url
      fileName.value = result.fileName
      verified.value = true
    }
  } catch (e: any) {
    error.value = e.message || '验证失败'
  } finally {
    loading.value = false
  }
}

function handleDownload() {
  if (!downloadUrl.value) return
  const a = document.createElement('a')
  a.href = downloadUrl.value
  a.download = fileName.value
  a.click()
}

function getExpiresText(expiresAt: number): string {
  if (!expiresAt) return '永久有效'
  if (Date.now() > expiresAt) return '已过期'
  const days = Math.ceil((expiresAt - Date.now()) / 86400000)
  return `剩余 ${days} 天`
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div v-if="checking" class="card p-8 text-center">
        <Loader2 :size="32" class="animate-spin mx-auto mb-4 text-primary-500" />
        <p class="text-gray-500">正在加载...</p>
      </div>

      <div v-else-if="!shareInfo" class="card p-8 text-center">
        <AlertCircle :size="48" class="mx-auto mb-4 text-red-400" />
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">分享不存在</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">该分享链接无效或已被删除</p>
      </div>

      <div v-else-if="shareInfo.expiresAt && Date.now() > shareInfo.expiresAt" class="card p-8 text-center">
        <AlertCircle :size="48" class="mx-auto mb-4 text-orange-400" />
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">分享已过期</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">该分享链接已超过有效期</p>
      </div>

      <div v-else class="card p-8 shadow-xl">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
            <Lock class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">文件分享</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ shareInfo.fileName }} · {{ formatSize(shareInfo.fileSize) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">{{ getExpiresText(shareInfo.expiresAt) }}</p>
        </div>

        <div v-if="!verified">
          <form @submit.prevent="handleVerify" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">提取码</label>
              <input
                v-model="code"
                type="text"
                placeholder="请输入4位提取码"
                maxlength="4"
                class="input-field text-center text-2xl font-mono tracking-widest uppercase"
                :disabled="loading"
              />
            </div>

            <div v-if="error" class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle :size="18" class="flex-shrink-0 mt-0.5" />
              <span>{{ error }}</span>
            </div>

            <button
              type="submit"
              class="btn-primary w-full !py-3 text-base"
              :disabled="loading"
            >
              <Loader2 v-if="loading" :size="18" class="animate-spin mr-2" />
              验证并下载
            </button>
          </form>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
            <CheckCircle :size="32" class="mx-auto mb-2 text-emerald-500" />
            <p class="font-medium text-emerald-700 dark:text-emerald-300">验证成功！</p>
          </div>

          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileText :size="24" class="text-primary-500 flex-shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-gray-800 dark:text-white truncate text-sm">{{ fileName }}</p>
              <p class="text-xs text-gray-400">{{ formatSize(fileSize) }}</p>
            </div>
          </div>

          <button @click="handleDownload" class="btn-primary w-full !py-3 text-base">
            <Download :size="18" class="mr-2" />
            下载文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
