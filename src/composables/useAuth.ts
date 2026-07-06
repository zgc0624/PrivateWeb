import { ref, computed, onMounted } from 'vue'
import { auth } from '@/lib/cloudbase'

const currentUser = ref<any>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const userEmail = computed(() => currentUser.value?.email ?? '')
  const uid = computed(() => currentUser.value?.uid ?? '')

  onMounted(async () => {
    // 检查登录状态
    // @ts-ignore - v3 SDK 类型定义未更新
    const state = await auth.getLoginState()
    if (state) {
      currentUser.value = state
    }
    loading.value = false

    // 监听认证状态变化
    // @ts-ignore - v3 SDK 类型定义未更新
    auth.onAuthStateChange((user: any) => {
      currentUser.value = user
      loading.value = false
    })
  })

  async function signUp(email: string, password: string) {
    // @ts-ignore - v3 SDK 类型定义未更新
    const { error } = await auth.signUp({
      email,
      password
    })
    if (error) throw error
  }

  async function signIn(email: string, password: string) {
    // @ts-ignore - v3 SDK signInWithPassword 类型定义未更新
    const { error } = await auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  async function signOut() {
    await auth.signOut()
    currentUser.value = null
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    userEmail,
    uid,
    signUp,
    signIn,
    signOut
  }
}
