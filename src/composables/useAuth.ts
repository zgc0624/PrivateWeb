import { ref, computed, onMounted, onUnmounted } from 'vue'
import AV from '@/lib/leancloud'

const currentUser = ref<AV.User | null>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const userEmail = computed(() => currentUser.value?.get('email') ?? '')
  const username = computed(() => currentUser.value?.get('username') ?? '')

  onMounted(() => {
    currentUser.value = AV.User.current()
    loading.value = false

    const onLogin = (user: AV.User) => {
      currentUser.value = user
      loading.value = false
    }
    const onLogout = () => {
      currentUser.value = null
      loading.value = false
    }

    AV.User.on('login', onLogin)
    AV.User.on('logout', onLogout)

    onUnmounted(() => {
      AV.User.off('login', onLogin)
      AV.User.off('logout', onLogout)
    })
  })

  async function signUp(email: string, password: string) {
    const user = new AV.User()
    user.setUsername(email)
    user.setPassword(password)
    user.setEmail(email)
    await user.signUp()
    return user
  }

  async function signIn(email: string, password: string) {
    const user = await AV.User.logIn(email, password)
    return user
  }

  async function signOut() {
    await AV.User.logOut()
    currentUser.value = null
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    userEmail,
    username,
    signUp,
    signIn,
    signOut
  }
}
