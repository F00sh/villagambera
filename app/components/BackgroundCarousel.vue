<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  slides: {
    type: Array as () => string[],
    default: () => [
      '/img/slide-1.jpg',
      '/img/slide-2.jpg',
      '/img/slide-3.jpg',
      '/img/slide-4.jpg',
      '/img/slide-5.jpg'
    ]
  },
  overlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const slidesList = computed(() => props.slides)
const currentIndex = ref(0)
const parallaxOffset = ref(0)
const container = ref<HTMLElement | null>(null)

let intervalId: ReturnType<typeof setInterval> | undefined

const handleScroll = () => {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  parallaxOffset.value = rect.top * -0.25
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })

  intervalId = setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % slidesList.value.length
  }, props.interval)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div ref="container" class="relative w-full overflow-hidden">
    <div
      v-for="(slide, index) in slidesList"
      :key="index"
      class="absolute inset-0 transition-opacity duration-1000"
      :class="currentIndex === index ? 'opacity-100' : 'opacity-0'"
    >
      <div
        class="absolute inset-0 bg-cover bg-center will-change-transform"
        :style="{
          backgroundImage: `url(${slide})`,
          transform: `translateY(${parallaxOffset}px) scale(1.1)`
        }"
      />
      <div v-if="props.overlay" class="absolute inset-0 bg-black/40" />
    </div>

    <div class="relative z-10 w-full h-full">
      <slot />
    </div>
  </div>
</template>
