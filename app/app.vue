<template>
  <div class="w-full overflow-x-hidden">
    <Navbar />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
  
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const saved = (() => { try { return localStorage.getItem('theme') } catch { return null } })()
  const prefersDark = saved ? (saved === 'dark') : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const html = document.documentElement
  if (prefersDark) html.setAttribute('data-theme', 'dark')
  else html.setAttribute('data-theme', 'light')
})
</script>
