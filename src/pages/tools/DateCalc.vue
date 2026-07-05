<script setup lang="ts">
import { ref, computed } from 'vue'
import { CalendarDays } from 'lucide-vue-next'
import ToolPageLayout from '@/components/ToolPageLayout.vue'

const activeTab = ref<'diff' | 'add'>('diff')

const today = new Date()
const todayStr = formatDateInput(today)

const date1 = ref(todayStr)
const date2 = ref(formatDateInput(new Date(today.getTime() + 7 * 86400000)))

const addDate = ref(todayStr)
const addOp = ref<'add' | 'sub'>('add')
const addNum = ref(7)
const addUnit = ref<'days' | 'weeks' | 'months' | 'years'>('days')
const addResult = ref('')

function formatDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatCN(d: Date): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

const d1 = computed(() => new Date(date1.value + 'T00:00:00'))
const d2 = computed(() => new Date(date2.value + 'T00:00:00'))

const diffDays = computed(() => {
  const ms = d2.value.getTime() - d1.value.getTime()
  return Math.round(ms / 86400000)
})

const diffDetail = computed(() => {
  const days = Math.abs(diffDays.value)
  const weeks = Math.floor(days / 7)
  const remDays = days % 7
  const sign = diffDays.value >= 0 ? '晚' : '早'
  return `${sign} ${weeks > 0 ? weeks + '周' : ''}${remDays > 0 ? remDays + '天' : ''} (共 ${days} 天)`
})

const yearsMonths = computed(() => {
  const d1v = d1.value
  const d2v = d2.value
  let y = d2v.getFullYear() - d1v.getFullYear()
  let m = d2v.getMonth() - d1v.getMonth()
  let d = d2v.getDate() - d1v.getDate()
  if (d < 0) {
    m--
    const prevMonth = new Date(d2v.getFullYear(), d2v.getMonth(), 0)
    d += prevMonth.getDate()
  }
  if (m < 0) {
    y--
    m += 12
  }
  return `${y}年${m}月${d}天`
})

function computeAdd() {
  const base = new Date(addDate.value + 'T00:00:00')
  const n = addOp.value === 'add' ? addNum.value : -addNum.value
  switch (addUnit.value) {
    case 'days': base.setDate(base.getDate() + n); break
    case 'weeks': base.setDate(base.getDate() + n * 7); break
    case 'months': base.setMonth(base.getMonth() + n); break
    case 'years': base.setFullYear(base.getFullYear() + n); break
  }
  addResult.value = formatCN(base)
}

function setQuick(days: number, unit: 'days' | 'weeks' | 'months' | 'years') {
  addNum.value = days
  addUnit.value = unit
  addDate.value = todayStr
  addOp.value = 'add'
  computeAdd()
}

function monthEnd() {
  const base = new Date(addDate.value + 'T00:00:00')
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  addResult.value = formatCN(lastDay)
}

function yearEnd() {
  const base = new Date(addDate.value + 'T00:00:00')
  const lastDay = new Date(base.getFullYear(), 11, 31)
  addResult.value = formatCN(lastDay)
}
</script>

<template>
  <ToolPageLayout
    title="日期计算"
    description="计算日期差、推算日期，支持天/周/月/年"
    :icon="CalendarDays"
    gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
  >
    <div class="flex gap-2 mb-6">
      <button class="tab-btn" :class="{ active: activeTab === 'diff' }" @click="activeTab = 'diff'">日期差计算</button>
      <button class="tab-btn" :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">日期推算</button>
    </div>

    <div v-if="activeTab === 'diff'" class="grid md:grid-cols-2 gap-6">
      <div class="card p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">起始日期</label>
          <input type="date" v-model="date1" class="input-field text-base" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">结束日期</label>
          <input type="date" v-model="date2" class="input-field text-base" />
        </div>
      </div>

      <div class="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">计算结果</h3>
        <div class="space-y-4">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ Math.abs(diffDays) }}</span>
            <span class="text-gray-600 dark:text-gray-300">天</span>
          </div>
          <div class="text-gray-600 dark:text-gray-300">{{ diffDetail }}</div>
          <div class="text-gray-600 dark:text-gray-300">约 {{ yearsMonths }}</div>
          <div class="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>起始：{{ formatCN(d1) }}</p>
            <p>结束：{{ formatCN(d2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-6">
      <div class="card p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">起始日期</label>
          <input type="date" v-model="addDate" class="input-field text-base" />
        </div>
        <div class="flex gap-2">
          <select v-model="addOp" class="input-field !w-24">
            <option value="add">加</option>
            <option value="sub">减</option>
          </select>
          <input type="number" v-model.number="addNum" min="0" class="input-field" />
          <select v-model="addUnit" class="input-field !w-28">
            <option value="days">天</option>
            <option value="weeks">周</option>
            <option value="months">月</option>
            <option value="years">年</option>
          </select>
        </div>
        <button @click="computeAdd" class="btn-primary w-full">计算</button>

        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">快捷选项</p>
          <div class="flex flex-wrap gap-2">
            <button @click="setQuick(1, 'weeks')" class="btn-secondary !py-1.5 !px-3 text-xs">一周后</button>
            <button @click="setQuick(1, 'months')" class="btn-secondary !py-1.5 !px-3 text-xs">一月后</button>
            <button @click="setQuick(3, 'months')" class="btn-secondary !py-1.5 !px-3 text-xs">三月后</button>
            <button @click="monthEnd" class="btn-secondary !py-1.5 !px-3 text-xs">本月底</button>
            <button @click="yearEnd" class="btn-secondary !py-1.5 !px-3 text-xs">今年底</button>
          </div>
        </div>
      </div>

      <div class="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex flex-col justify-center">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">目标日期</h3>
        <div v-if="addResult" class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ addResult }}
        </div>
        <div v-else class="text-gray-400">设置参数后点击计算</div>
      </div>
    </div>
  </ToolPageLayout>
</template>
