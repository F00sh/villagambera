<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

type Slide = { image: string; caption?: string }

const props = withDefaults(defineProps<{
  slides: Slide[]
  interval?: number
  autoplay?: boolean
}>(), {
  interval: 5000,
  autoplay: true
})

const index = ref(0)
const hovering = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const hasSlides = computed(() => props.slides?.length > 0)
const current = computed(() => (hasSlides.value ? props.slides[index.value] : null))

function next() {
  if (!hasSlides.value) return
  index.value = (index.value + 1) % props.slides.length
}
function prev() {
  if (!hasSlides.value) return
  index.value = (index.value - 1 + props.slides.length) % props.slides.length
}
function go(i: number) {
  index.value = i
}

function start() {
  stop()
  if (!props.autoplay || !hasSlides.value) return
  timer = setInterval(() => {
    if (!hovering.value) next()
  }, props.interval)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <div
    class="w-full"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div
      v-if="hasSlides"
      class="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg"
    >
      <!-- Keep a reliable height -->
      <div class="relative aspect-[16/9] md:aspect-[21/9]">
        <transition name="fade" mode="out-in">
          <img
            :key="current!.image"
            :src="current!.image"
            :alt="current?.caption || 'Apartment photo'"
            class="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </transition>

        <!-- Gradient + caption -->
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
          <p v-if="current?.caption" class="text-white text-sm md:text-base">
            {{ current.caption }}
          </p>
        </div>

        <!-- Arrows -->
        <button
          type="button"
          class="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/55"
          @click="prev"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/55"
          @click="next"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      <!-- Dots -->
      <div class="flex items-center justify-center gap-2 p-4">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          class="h-2.5 w-2.5 rounded-full transition"
          :class="i === index ? 'bg-gray-900' : 'bg-gray-400/60 hover:bg-gray-500'"
          @click="go(i)"
          :aria-label="`Go to slide ${i + 1}`"
        />
      </div>
    </div>

    <div v-else class="rounded-3xl border border-black/10 bg-white p-8 text-center text-gray-700">
      No apartment images found.
    </div>
  </div>
</template>

<style scoped>
/* use smoother, quicker fade for snappier feel */
.fade-enter-active,
.fade-leave-active { transition: opacity 240ms var(--ease-smooth); }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
