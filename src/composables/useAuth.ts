import { ref, computed, onMounted } from 'vue'
import { auth } from '@/lib/cloudbase'

const currentUser = ref<any>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const userEmail = computed(() => currentUser.value?.email ?? '')
  const uid = computed(() => currentUser.value?.uid ?? '')

  onMounted(async () => {
    const state = await auth.getLoginState()
    if (state) {
      currentUser.value = state
    }
    loading.value = false

    auth.onAuthStateChanged((user: any) => {
      currentUser.value = user
      loading.value = false
    })
  })

  async function signUp(email: string, password: string) {
    const { error } = await auth.signUp({
      email,
      password
    })
    if (error) throw error
  }

  async function signIn(email: string, password: string) {
    const { error } = await auth.signIn({
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
