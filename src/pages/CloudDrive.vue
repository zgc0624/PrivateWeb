<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCloudStorage } from '@/composables/useCloudStorage'
import { HardDrive, Upload, Trash2, Share2, Download, Copy, Check, Loader2, X, FileText, AlertCircle } from 'lucide-vue-next'
import type { FileRecord, ShareRecord } from '@/composables/useCloudStorage'

const router = useRouter()
const { isAuthenticated, userEmail, signOut } = useAuth()
const { uploadFile, getUserFiles, deleteFile, createShare, getUserShares, deleteShare, formatSize, formatDate } = useCloudStorage()

const files = ref<FileRecord[]>([])
const shares = ref<ShareRecord[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const loading = ref(true)
const activeTab = ref<'files' | 'shares'>('files')
const shareDialog = ref(false)
const shareTarget = ref<FileRecord | null>(null)
const shareExpires = ref(7)
const shareMaxDownloads = ref(0)
const shareResult = ref<ShareRecord | null>(null)
const shareError = ref('')
const copied = ref(false)

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login?redirect=/cloud')
    return
  }
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [fileList, shareList] = await Promise.all([
      getUserFiles(),
      getUserShares()
    ])
    files.value = fileList
    shares.value = shareList
  } catch (e: any) {
    console.error('加载数据失败:', e)
  } finally {
    loading.value = false
  }
}

async function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const fileList = input.files
  if (!fileList) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    for (const file of Array.from(fileList)) {
      await uploadFile(file, (percent) => {
        uploadProgress.value = percent
      })
    }
    await loadData()
  } catch (e: any) {
    console.error('上传失败:', e)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    input.value = ''
  }
}

async function handleDelete(file: FileRecord) {
  if (!confirm(`确定删除 "${file.fileName}" 吗？`)) return
  try {
    await deleteFile(file._id, file.cloudPath)
    await loadData()
  } catch (e: any) {
    console.error('删除失败:', e)
  }
}

function openShareDialog(file: FileRecord) {
  shareTarget.value = file
  shareResult.value = null
  shareError.value = ''
  shareExpires.value = 7
  shareMaxDownloads.value = 0
  shareDialog.value = true
}

async function handleCreateShare() {
  if (!shareTarget.value) return
  shareError.value = ''
  try {
    shareResult.value = await createShare(
      shareTarget.value._id,
      shareExpires.value,
      shareMaxDownloads.value
    )
  } catch (e: any) {
    shareError.value = e.message || '创建分享失败'
  }
}

async function handleDeleteShare(share: ShareRecord) {
  if (!confirm('确定删除这个分享链接吗？')) return
  try {
    await deleteShare(share._id)
    await loadData()
  } catch (e: any) {
    console.error('删除分享失败:', e)
  }
}

function getShareLink(shareId: string): string {
  return `${window.location.origin}/share/${shareId}`
}

async function copyShareLink(shareId: string) {
  const link = getShareLink(shareId)
  await navigator.clipboard.writeText(link)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function copyShareInfo(share: ShareRecord) {
  const link = getShareLink(share._id)
  navigator.clipboard.writeText(`链接: ${link}\n提取码: ${share.accessCode}`)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function getExpiresText(expiresAt: number): string {
  if (!expiresAt) return '永久有效'
  if (Date.now() > expiresAt) return '已过期'
  const days = Math.ceil((expiresAt - Date.now()) / 86400000)
  return `还剩 ${days} 天`
}

async function handleSignOut() {
  await signOut()
  router.push('/')
}

const totalSize = ref(0)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <HardDrive class="w-7 h-7 text-primary-500" />
          我的云盘
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ userEmail }}</p>
      </div>
      <div class="flex items-center gap-3">
        <label class="btn-primary cursor-pointer">
          <Upload :size="16" /> 上传文件
          <input type="file" multiple class="hidden" @change="onFileSelect" :disabled="uploading" />
        </label>
        <button @click="handleSignOut" class="btn-secondary text-sm">
          退出
        </button>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="card p-4 mb-6">
      <div class="flex items-center gap-3">
        <Loader2 :size="20" class="animate-spin text-primary-500" />
        <div class="flex-1">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600 dark:text-gray-300">上传中...</span>
            <span class="text-gray-500">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-primary-500 h-2 rounded-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
      <button
        @click="activeTab = 'files'"
        class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === 'files' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        我的文件 ({{ files.length }})
      </button>
      <button
        @click="activeTab = 'shares'"
        class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === 'shares' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        我的分享 ({{ shares.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-500">
      <Loader2 :size="24" class="animate-spin mx-auto mb-2" />
      加载中...
    </div>

    <!-- Files Tab -->
    <div v-else-if="activeTab === 'files'">
      <div v-if="files.length === 0" class="card p-12 text-center">
        <HardDrive :size="48" class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">还没有文件</p>
        <p class="text-gray-400 text-sm mt-1">点击上方"上传文件"开始使用</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="file in files" :key="file._id" class="card p-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <FileText :size="20" class="text-primary-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 dark:text-white truncate">{{ file.fileName }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatSize(file.fileSize) }} · {{ formatDate(file.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openShareDialog(file)" class="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="分享">
              <Share2 :size="18" />
            </button>
            <button @click="handleDelete(file)" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="删除">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shares Tab -->
    <div v-else-if="activeTab === 'shares'">
      <div v-if="shares.length === 0" class="card p-12 text-center">
        <Share2 :size="48" class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">还没有分享</p>
        <p class="text-gray-400 text-sm mt-1">在"我的文件"中选择文件创建分享</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="share in shares" :key="share._id" class="card p-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Share2 :size="20" class="text-amber-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 dark:text-white truncate">{{ share.fileName }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              提取码: <span class="font-mono font-bold text-amber-600 dark:text-amber-400">{{ share.accessCode }}</span>
              · {{ getExpiresText(share.expiresAt) }}
              <span v-if="share.maxDownloads > 0"> · 已下载 {{ share.downloadCount }}/{{ share.maxDownloads }} 次</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="copyShareInfo(share)" class="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="复制链接和提取码">
              <Check v-if="copied" :size="18" class="text-emerald-500" />
              <Copy v-else :size="18" />
            </button>
            <button @click="handleDeleteShare(share)" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="删除分享">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Dialog -->
    <div v-if="shareDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="shareDialog = false">
      <div class="card p-6 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">创建分享</h3>
          <button @click="shareDialog = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X :size="20" />
          </button>
        </div>

        <div v-if="!shareResult">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            分享文件: <span class="font-medium">{{ shareTarget?.fileName }}</span>
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">有效期</label>
              <select v-model.number="shareExpires" class="input-field">
                <option :value="1">1 天</option>
                <option :value="7">7 天</option>
                <option :value="30">30 天</option>
                <option :value="0">永久有效</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">最大下载次数</label>
              <select v-model.number="shareMaxDownloads" class="input-field">
                <option :value="0">不限</option>
                <option :value="1">1 次</option>
                <option :value="5">5 次</option>
                <option :value="10">10 次</option>
                <option :value="50">50 次</option>
              </select>
            </div>

            <div v-if="shareError" class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle :size="18" class="flex-shrink-0 mt-0.5" />
              <span>{{ shareError }}</span>
            </div>

            <button @click="handleCreateShare" class="btn-primary w-full !py-2.5">
              生成分享链接
            </button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <p class="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">分享创建成功！</p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">链接:</span>
                <span class="font-mono text-xs text-gray-800 dark:text-gray-200 break-all ml-2">{{ getShareLink(shareResult._id) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">提取码:</span>
                <span class="font-mono font-bold text-lg text-amber-600 dark:text-amber-400 tracking-widest">{{ shareResult.accessCode }}</span>
              </div>
            </div>
          </div>

          <button @click="copyShareInfo(shareResult)" class="btn-outline w-full !py-2.5">
            <Copy :size="16" class="mr-2" />
            {{ copied ? '已复制' : '复制链接和提取码' }}
          </button>

          <button @click="shareDialog = false" class="btn-secondary w-full !py-2.5">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
