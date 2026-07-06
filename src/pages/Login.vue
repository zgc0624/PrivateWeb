<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { LogIn, UserPlus, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { signIn, signUp } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const submitting = ref(false)

const pageTitle = computed(() => isLogin.value ? '登录' : '注册')
const submitLabel = computed(() => isLogin.value ? '登录' : '注册')
const toggleLabel = computed(() => isLogin.value ? '还没有账号？去注册' : '已有账号？去登录')

function resetState() {
  error.value = ''
  success.value = ''
}

function handleLeanCloudError(e: any): string {
  const code = e.code
  if (code === 202) return '该邮箱已注册，请直接登录'
  if (code === 211) return '邮箱或密码错误'
  if (code === 205) return '请先验证邮箱后再登录'
  if (code === 203) return '邮箱或密码错误'
  if (code === 200) return '用户名不存在'
  if (code === 210) return '邮箱已被使用'
  if (code === 141) return '密码格式不正确'
  if (e.message) return e.message
  return '操作失败，请重试'
}

async function handleSubmit() {
  resetState()

  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }
  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = '两次密码输入不一致'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码至少6位'
    return
  }

  submitting.value = true
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      await signUp(email.value, password.value)
      success.value = '注册成功！请查收邮箱验证邮件，验证后即可登录'
      isLogin.value = true
      password.value = ''
      confirmPassword.value = ''
    }
  } catch (e: any) {
    error.value = handleLeanCloudError(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card p-8 shadow-xl">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <LogIn v-if="isLogin" class="w-8 h-8 text-white" />
            <UserPlus v-else class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ pageTitle }}</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ isLogin ? '登录以使用更多功能' : '创建账号开始使用' }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="input-field !pl-10"
                :disabled="submitting"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                type="password"
                placeholder="至少6位"
                class="input-field !pl-10"
                :disabled="submitting"
              />
            </div>
          </div>

          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">确认密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                class="input-field !pl-10"
                :disabled="submitting"
              />
            </div>
          </div>

          <div v-if="error" class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <AlertCircle :size="18" class="flex-shrink-0 mt-0.5" />
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
            <CheckCircle :size="18" class="flex-shrink-0 mt-0.5" />
            <span>{{ success }}</span>
          </div>

          <button
            type="submit"
            class="btn-primary w-full !py-3 text-base"
            :disabled="submitting"
          >
            <Loader2 v-if="submitting" :size="18" class="animate-spin mr-2" />
            {{ submitLabel }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            @click="() => { isLogin = !isLogin; resetState() }"
            class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            :disabled="submitting"
          >
            {{ toggleLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
