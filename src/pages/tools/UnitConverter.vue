<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Ruler, ArrowRightLeft } from 'lucide-vue-next'
import ToolPageLayout from '@/components/ToolPageLayout.vue'
import { unitCategories, convert, formatNumber, type Unit } from '@/utils/units'

const activeCategory = ref(unitCategories[0])
const fromValue = ref<string>('1')
const fromUnit = ref<Unit>(activeCategory.value.units[2])
const toUnit = ref<Unit>(activeCategory.value.units[3])
const toValue = ref<string>('')
let internalUpdate = false

function doConvertFrom() {
  if (internalUpdate) return
  const val = parseFloat(fromValue.value)
  if (isNaN(val)) {
    toValue.value = ''
    return
  }
  const result = convert(val, fromUnit.value, toUnit.value, activeCategory.value)
  toValue.value = formatNumber(result)
}

function doConvertTo() {
  if (internalUpdate) return
  const val = parseFloat(toValue.value)
  if (isNaN(val)) {
    fromValue.value = ''
    return
  }
  const result = convert(val, toUnit.value, fromUnit.value, activeCategory.value)
  fromValue.value = formatNumber(result)
}

function swap() {
  internalUpdate = true
  const tmp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = tmp
  const tmpVal = fromValue.value
  fromValue.value = toValue.value
  toValue.value = tmpVal
  setTimeout(() => { internalUpdate = false }, 0)
}

watch([fromUnit, toUnit, activeCategory], () => {
  doConvertFrom()
})

watch(activeCategory, (cat) => {
  fromUnit.value = cat.units[Math.min(2, cat.units.length - 1)]
  toUnit.value = cat.units[Math.min(3, cat.units.length - 1)]
})
</script>

<template>
  <ToolPageLayout
    title="单位换算"
    description="长度、重量、温度、面积、体积、速度单位实时换算"
    :icon="Ruler"
    gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
  >
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="cat in unitCategories"
        :key="cat.key"
        class="tab-btn"
        :class="{ active: activeCategory.key === cat.key }"
        @click="activeCategory = cat"
      >{{ cat.name }}</button>
    </div>

    <div class="card p-6">
      <div class="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">从</label>
          <div class="flex gap-2">
            <input
              v-model="fromValue"
              type="number"
              step="any"
              class="input-field text-lg"
              placeholder="输入数值"
              @input="doConvertFrom"
            />
            <select v-model="fromUnit" class="input-field min-w-[140px]">
              <option v-for="u in activeCategory.units" :key="u.key" :value="u">{{ u.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-center md:pb-1">
          <button
            @click="swap"
            class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center transition-all hover:rotate-180 duration-500"
            title="交换"
          >
            <ArrowRightLeft :size="18" />
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">到</label>
          <div class="flex gap-2">
            <input
              v-model="toValue"
              type="number"
              step="any"
              class="input-field text-lg"
              placeholder="结果"
              @input="doConvertTo"
            />
            <select v-model="toUnit" class="input-field min-w-[140px]">
              <option v-for="u in activeCategory.units" :key="u.key" :value="u">{{ u.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>
