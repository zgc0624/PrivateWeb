<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden">
    <div class="blob w-96 h-96 bg-primary-300 dark:bg-primary-700 -top-48 -left-48 fixed"></div>
    <div class="blob w-80 h-80 bg-purple-300 dark:bg-purple-800 top-1/3 -right-40 fixed"></div>
    <div class="blob w-72 h-72 bg-accent-200 dark:bg-accent-800 bottom-0 left-1/4 fixed"></div>

    <NavBar />
    <main class="flex-1 relative z-10">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <Footer />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
