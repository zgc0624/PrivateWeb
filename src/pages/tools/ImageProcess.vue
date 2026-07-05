<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImageIcon, Upload, Download, Lock, Unlock, X, Trash2 } from 'lucide-vue-next'
import ToolPageLayout from '@/components/ToolPageLayout.vue'

interface ImageItem {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  processedUrl: string
  processedSize: number
  processedWidth: number
  processedHeight: number
  processed: boolean
}

const images = ref<ImageItem[]>([])
const quality = ref(80)
const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
const resizeEnabled = ref(false)
const resizeWidth = ref(800)
const resizeHeight = ref(600)
const lockAspect = ref(true)
const processing = ref(false)
const isDragging = ref(false)

const formatOptions = [
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' }
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'png'
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

async function processImage(item: ImageItem): Promise<void> {
  const img = await loadImage(item.file)
  item.originalWidth = img.width
  item.originalHeight = img.height

  let targetW = img.width
  let targetH = img.height
  if (resizeEnabled.value) {
    if (lockAspect.value) {
      const ratio = img.width / img.height
      if (resizeWidth.value && !resizeHeight.value) {
        targetW = resizeWidth.value
        targetH = Math.round(resizeWidth.value / ratio)
      } else if (resizeHeight.value && !resizeWidth.value) {
        targetH = resizeHeight.value
        targetW = Math.round(resizeHeight.value * ratio)
      } else {
        targetW = resizeWidth.value || img.width
        targetH = Math.round(targetW / ratio)
      }
    } else {
      targetW = resizeWidth.value || img.width
      targetH = resizeHeight.value || img.height
    }
  }

  if (targetW > 3000) targetW = 3000
  if (targetH > 3000) targetH = 3000

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const q = outputFormat.value === 'image/png' ? undefined : quality.value / 100
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputFormat.value, q)
  })

  if (blob) {
    item.processedUrl = URL.createObjectURL(blob)
    item.processedSize = blob.size
    item.processedWidth = targetW
    item.processedHeight = targetH
    item.processed = true
  }
  URL.revokeObjectURL(img.src)
}

async function processAll() {
  if (images.value.length === 0) return
  processing.value = true
  try {
    for (const img of images.value) {
      await processImage(img)
    }
  } finally {
    processing.value = false
  }
}

async function addFiles(files: FileList | File[]) {
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const id = Math.random().toString(36).slice(2)
    const item: ImageItem = {
      id,
      file,
      originalUrl: URL.createObjectURL(file),
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      processedUrl: '',
      processedSize: 0,
      processedWidth: 0,
      processedHeight: 0,
      processed: false
    }
    images.value.push(item)
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

function onFileInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
  ;(e.target as HTMLInputElement).value = ''
}

function removeImage(id: string) {
  const idx = images.value.findIndex(i => i.id === id)
  if (idx >= 0) {
    URL.revokeObjectURL(images.value[idx].originalUrl)
    if (images.value[idx].processedUrl) URL.revokeObjectURL(images.value[idx].processedUrl)
    images.value.splice(idx, 1)
  }
}

function clearAll() {
  for (const img of images.value) {
    URL.revokeObjectURL(img.originalUrl)
    if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
  }
  images.value = []
}

function downloadOne(item: ImageItem) {
  if (!item.processed) return
  const a = document.createElement('a')
  a.href = item.processedUrl
  const baseName = item.file.name.replace(/\.[^.]+$/, '')
  a.download = `${baseName}.${extFromMime(outputFormat.value)}`
  a.click()
}

function downloadAll() {
  for (const img of images.value) {
    if (img.processed) {
      setTimeout(() => downloadOne(img), 100)
    }
  }
}

function syncRatioFromWidth() {
  if (!lockAspect.value || images.value.length === 0) return
  const first = images.value.find(i => i.originalWidth > 0)
  if (first) {
    const ratio = first.originalWidth / first.originalHeight
    resizeHeight.value = Math.round(resizeWidth.value / ratio)
  }
}

function syncRatioFromHeight() {
  if (!lockAspect.value || images.value.length === 0) return
  const first = images.value.find(i => i.originalWidth > 0)
  if (first) {
    const ratio = first.originalWidth / first.originalHeight
    resizeWidth.value = Math.round(resizeHeight.value * ratio)
  }
}

watch([quality, outputFormat, resizeEnabled, resizeWidth, resizeHeight, lockAspect], () => {
  if (images.value.length > 0 && images.value.some(i => i.processed)) {
    processAll()
  }
})

async function onImagesChange() {
  if (images.value.length > 0) {
    const first = images.value[0]
    const img = await loadImage(first.file)
    first.originalWidth = img.width
    first.originalHeight = img.height
    resizeWidth.value = img.width
    resizeHeight.value = img.height
    URL.revokeObjectURL(img.src)
    await processAll()
  }
}

watch(() => images.value.length, (n, o) => {
  if (n > o) onImagesChange()
})
</script>

<template>
  <ToolPageLayout
    title="图片处理"
    description="图片压缩、格式转换、尺寸调整，本地处理保护隐私"
    :icon="ImageIcon"
    gradient="bg-gradient-to-br from-rose-500 to-orange-500"
  >
    <div v-if="images.length === 0"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop="onDrop"
      class="card p-12 border-2 border-dashed text-center cursor-pointer transition-all"
      :class="isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'"
      @click="($refs.fileInput as HTMLInputElement).click()"
    >
      <Upload :size="48" class="mx-auto mb-4 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-300 font-medium text-lg mb-1">拖拽图片到这里，或点击上传</p>
      <p class="text-sm text-gray-400">支持 JPG、PNG、WebP 格式，可多选</p>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileInput" />
    </div>

    <div v-else class="space-y-6">
      <div class="card p-5">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[140px]">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">压缩质量: {{ quality }}%</label>
            <input type="range" v-model.number="quality" min="10" max="100" step="5" class="w-full accent-rose-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出格式</label>
            <select v-model="outputFormat" class="input-field !py-2">
              <option v-for="f in formatOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="resizeEnabled" class="w-4 h-4 rounded accent-rose-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">调整尺寸</span>
            </label>
          </div>
          <div v-if="resizeEnabled" class="flex items-end gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">宽 (px)</label>
              <input type="number" v-model.number="resizeWidth" class="input-field !py-2 !w-24" @input="syncRatioFromWidth" />
            </div>
            <button @click="lockAspect = !lockAspect" class="mb-0.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Lock v-if="lockAspect" :size="18" />
              <Unlock v-else :size="18" />
            </button>
            <div>
              <label class="block text-xs text-gray-500 mb-1">高 (px)</label>
              <input type="number" v-model.number="resizeHeight" class="input-field !py-2 !w-24" @input="syncRatioFromHeight" />
            </div>
          </div>
          <div class="flex gap-2 ml-auto">
            <button @click="clearAll" class="btn-secondary">
              <Trash2 :size="16" /> 清空
            </button>
            <button @click="downloadAll" class="btn-primary" :disabled="!images.some(i => i.processed)">
              <Download :size="16" /> 下载全部
            </button>
            <button @click="($refs.fileInput2 as HTMLInputElement).click()" class="btn-outline">
              <Upload :size="16" /> 添加
            </button>
            <input ref="fileInput2" type="file" accept="image/*" multiple class="hidden" @change="onFileInput" />
          </div>
        </div>
      </div>

      <div v-if="processing" class="text-center py-4 text-gray-500">
        <div class="animate-spin w-6 h-6 border-[3px] border-rose-500 border-t-transparent rounded-full inline-block mr-2"></div>
        处理中...
      </div>

      <div class="grid gap-4">
        <div v-for="img in images" :key="img.id" class="card p-4">
          <div class="flex items-start gap-4">
            <div class="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img :src="img.processed ? img.processedUrl : img.originalUrl" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <p class="font-medium text-gray-800 dark:text-white truncate">{{ img.file.name }}</p>
                <button @click="removeImage(img.id)" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <X :size="18" />
                </button>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span v-if="img.originalWidth">原始: {{ img.originalWidth }}×{{ img.originalHeight }} · {{ formatSize(img.originalSize) }}</span>
                <span v-if="img.processed" class="text-emerald-600 dark:text-emerald-400">
                  处理后: {{ img.processedWidth }}×{{ img.processedHeight }} · {{ formatSize(img.processedSize) }}
                  <span class="ml-1">({{ Math.round((1 - img.processedSize / img.originalSize) * 100) }}% ↓)</span>
                </span>
              </div>
            </div>
            <button v-if="img.processed" @click="downloadOne(img)" class="btn-primary !py-2 !px-4 flex-shrink-0">
              <Download :size="16" /> 下载
            </button>
          </div>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>
