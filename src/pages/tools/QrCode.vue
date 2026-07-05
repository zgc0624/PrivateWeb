<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { QrCode, Download, Upload, Copy, Check, Wifi, User, MessageSquare, Mail, Trash2 } from 'lucide-vue-next'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import ToolPageLayout from '@/components/ToolPageLayout.vue'

const activeTab = ref<'generate' | 'parse'>('generate')
const qrText = ref('https://example.com')
const qrSize = ref(256)
const qrLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrFg = ref('#000000')
const qrBg = ref('#ffffff')
const qrDataUrl = ref('')
const copied = ref(false)
const generating = ref(false)

const parseResult = ref('')
const parseError = ref('')
const parseLoading = ref(false)
const parseCanvas = ref<HTMLCanvasElement | null>(null)

async function generateQR() {
  if (!qrText.value.trim()) {
    qrDataUrl.value = ''
    return
  }
  generating.value = true
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrText.value, {
      width: qrSize.value,
      margin: 2,
      errorCorrectionLevel: qrLevel.value,
      color: { dark: qrFg.value, light: qrBg.value }
    })
  } catch {
    qrDataUrl.value = ''
  }
  generating.value = false
}

function downloadQR(format: 'png' | 'svg') {
  if (!qrDataUrl.value) return
  if (format === 'png') {
    const a = document.createElement('a')
    a.href = qrDataUrl.value
    a.download = 'qrcode.png'
    a.click()
  } else {
    QRCode.toString(qrText.value, {
      type: 'svg',
      width: qrSize.value,
      margin: 2,
      errorCorrectionLevel: qrLevel.value,
      color: { dark: qrFg.value, light: qrBg.value }
    }, (_err, svg) => {
      if (!svg) return
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.svg'
      a.click()
      URL.revokeObjectURL(url)
    })
  }
}

function copyText() {
  if (!parseResult.value) return
  navigator.clipboard.writeText(parseResult.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function useTemplate(type: string) {
  switch (type) {
    case 'wifi':
      qrText.value = 'WIFI:T:WPA;S:网络名称;P:密码;;'
      break
    case 'contact':
      qrText.value = 'BEGIN:VCARD\nVERSION:3.0\nN:姓名\nTEL:手机号\nEMAIL:邮箱\nEND:VCARD'
      break
    case 'sms':
      qrText.value = 'SMSTO:手机号:短信内容'
      break
    case 'email':
      qrText.value = 'mailto:someone@example.com?subject=主题&body=内容'
      break
  }
}

async function handleFileUpload(file: File) {
  parseError.value = ''
  parseResult.value = ''
  parseLoading.value = true
  try {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        parseResult.value = code.data
      } else {
        parseError.value = '无法识别二维码，请上传清晰的二维码图片'
      }
      parseLoading.value = false
    }
    img.onerror = () => {
      parseError.value = '图片加载失败，请重试'
      parseLoading.value = false
    }
    img.src = URL.createObjectURL(file)
  } catch {
    parseError.value = '处理图片时出错'
    parseLoading.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) handleFileUpload(file)
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFileUpload(file)
}

async function onPaste(e: ClipboardEvent) {
  if (activeTab.value !== 'parse') return
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const file = items[i].getAsFile()
      if (file) handleFileUpload(file)
      break
    }
  }
}

onMounted(() => {
  generateQR()
  window.addEventListener('paste', onPaste)
})

watch([qrText, qrSize, qrLevel, qrFg, qrBg], generateQR)
</script>

<template>
  <ToolPageLayout
    title="二维码工具"
    description="生成和解析二维码，支持多种快捷模板"
    :icon="QrCode"
    gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
  >
    <div class="flex gap-2 mb-6">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'generate' }"
        @click="activeTab = 'generate'"
      >生成二维码</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'parse' }"
        @click="activeTab = 'parse'"
      >解析二维码</button>
    </div>

    <div v-if="activeTab === 'generate'" class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容</label>
          <textarea
            v-model="qrText"
            rows="4"
            placeholder="输入文本、网址或其他内容..."
            class="input-field resize-none"
          ></textarea>
        </div>

        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">快捷模板</p>
          <div class="flex flex-wrap gap-2">
            <button @click="useTemplate('wifi')" class="btn-secondary !py-2 !px-3 text-sm">
              <Wifi :size="16" /> WiFi
            </button>
            <button @click="useTemplate('contact')" class="btn-secondary !py-2 !px-3 text-sm">
              <User :size="16" /> 联系人
            </button>
            <button @click="useTemplate('sms')" class="btn-secondary !py-2 !px-3 text-sm">
              <MessageSquare :size="16" /> 短信
            </button>
            <button @click="useTemplate('email')" class="btn-secondary !py-2 !px-3 text-sm">
              <Mail :size="16" /> 邮件
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">尺寸</label>
            <select v-model="qrSize" class="input-field">
              <option :value="128">128px</option>
              <option :value="256">256px</option>
              <option :value="512">512px</option>
              <option :value="1024">1024px</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">容错级别</label>
            <select v-model="qrLevel" class="input-field">
              <option value="L">低 (L)</option>
              <option value="M">中 (M)</option>
              <option value="Q">较高 (Q)</option>
              <option value="H">高 (H)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">前景色</label>
            <input type="color" v-model="qrFg" class="w-full h-11 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-600" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景色</label>
            <input type="color" v-model="qrBg" class="w-full h-11 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-600" />
          </div>
        </div>
      </div>

      <div class="card p-6 flex flex-col items-center justify-center">
        <div v-if="generating" class="text-gray-400">生成中...</div>
        <div v-else-if="qrDataUrl" class="text-center">
          <div class="bg-white rounded-2xl p-6 shadow-inner mb-5 inline-block">
            <img :src="qrDataUrl" alt="QR Code" class="block" />
          </div>
          <div class="flex gap-3 justify-center">
            <button @click="downloadQR('png')" class="btn-primary">
              <Download :size="18" /> 下载 PNG
            </button>
            <button @click="downloadQR('svg')" class="btn-outline">
              <Download :size="18" /> 下载 SVG
            </button>
          </div>
        </div>
        <div v-else class="text-gray-400 text-center">
          <QrCode :size="48" class="mx-auto mb-3 opacity-30" />
          <p>输入内容以生成二维码</p>
        </div>
      </div>
    </div>

    <div v-else class="card p-6">
      <div
        @dragover.prevent
        @drop="onDrop"
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer"
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        <Upload :size="40" class="mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-300 font-medium mb-1">拖拽图片到这里，或点击上传</p>
        <p class="text-sm text-gray-400">也可以直接 Ctrl+V 粘贴图片</p>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInput" />
      </div>

      <div v-if="parseLoading" class="mt-6 text-center text-gray-500">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>解析中...</p>
      </div>

      <div v-if="parseError" class="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center">
        {{ parseError }}
      </div>

      <div v-if="parseResult" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">解析结果</span>
          <button @click="copyText" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 text-sm">
            <Check v-if="copied" :size="16" />
            <Copy v-else :size="16" />
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-800 dark:text-gray-200 break-all whitespace-pre-wrap">
          {{ parseResult }}
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>
