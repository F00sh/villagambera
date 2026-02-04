<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from '#imports'

const open = ref(false)
const hidden = ref(false)
const scrolled = ref(false)
let lastY = 0

function onScroll() {
  const y = window.scrollY || 0
  hidden.value = y > 60 && y > lastY
  scrolled.value = y > 4
  lastY = y
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const route = useRoute()
const isOlive = computed(() => route.path.startsWith('/apartments'))
function closeOnNavigate() { open.value = false }
</script>

<template>
  <header :class="['nav', hidden ? 'nav-hidden' : '', scrolled ? 'nav-scrolled' : '', isOlive ? 'nav-olive' : '']">
    <div class="container flex items-center justify-between h-14 md:h-16">
      <NuxtLink to="/" class="brand" @click="closeOnNavigate">Villa Gambera</NuxtLink>

      <!-- Desktop -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink to="/" class="link">Home</NuxtLink>
        <NuxtLink to="/apartments" class="link">Apartments</NuxtLink>
        <a href="/#about" class="link">About</a>
        <a href="/#location" class="link">Location</a>
        <a href="/#amenities" class="link">Amenities</a>
        <a href="/#contact" class="link">Contact</a>
      </nav>

      <!-- Mobile -->
      <div class="md:hidden flex items-center gap-2">
        <button class="hamb" type="button" @click="open = !open" aria-label="Menu">☰</button>
      </div>
    </div>

    <!-- Mobile sheet -->
    <transition name="fade">
      <div v-if="open" class="sheet md:hidden">
        <a href="/" class="item" @click="closeOnNavigate">Home</a>
        <a href="/apartments" class="item" @click="closeOnNavigate">Apartments</a>
        <a href="/#about" class="item" @click="closeOnNavigate">About</a>
        <a href="/#location" class="item" @click="closeOnNavigate">Location</a>
        <a href="/#amenities" class="item" @click="closeOnNavigate">Amenities</a>
        <a href="/#contact" class="item" @click="closeOnNavigate">Contact</a>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 50;
  background: transparent;
  color: var(--fg);
  transition: transform var(--dur-base) var(--ease-smooth), opacity var(--dur-base) var(--ease-smooth);
}
.nav-hidden { transform: translateY(-100%); }
.brand { font-weight: 400; letter-spacing: 0.08em; color: white; }
.link { color: white; opacity: 0.9; font-weight: 300; letter-spacing: 0.05em; }
.link:hover { opacity: 1; }
.hamb { color: white; padding: 6px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3); background: transparent; }
.sheet {
  position: absolute; top: 56px; left: 0; right: 0;
  display: grid; gap: 8px; padding: 10px;
  background: rgba(0,0,0,0.6);
}
.item { color: white; padding: 10px 12px; border-radius: 10px; }
.item:hover { background: rgba(255,255,255,0.1); }

/* Apartments page variant (dark olive text) */
.nav-olive .brand,
.nav-olive .link { color: #365314; opacity: 1; }
.nav-olive .hamb { color: #365314; border-color: rgba(54, 83, 20, 0.35); }
</style>
