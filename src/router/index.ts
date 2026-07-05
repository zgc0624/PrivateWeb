import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/tools/qrcode',
      name: 'qrcode',
      component: () => import('@/pages/tools/QrCode.vue')
    },
    {
      path: '/tools/image-process',
      name: 'image-process',
      component: () => import('@/pages/tools/ImageProcess.vue')
    },
    {
      path: '/tools/unit-converter',
      name: 'unit-converter',
      component: () => import('@/pages/tools/UnitConverter.vue')
    },
    {
      path: '/tools/date-calc',
      name: 'date-calc',
      component: () => import('@/pages/tools/DateCalc.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
