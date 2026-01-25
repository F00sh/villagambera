<template>
  <div
    class="relative w-full overflow-hidden rounded-xl"
    @mouseenter="pause"
    @mouseleave="play"
  >
    <!-- Slides -->
    <div
      class="flex transition-transform duration-700 ease-in-out"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="w-full flex-shrink-0"
      >
        <img
          :src="slide.src"
          :alt="slide.alt"
          class="h-64 w-full object-cover sm:h-80 md:h-96"
        />
      </div>
    </div>

    <!-- Prev / Next -->
    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      @click="prev"
    >
      ‹
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      @click="next"
    >
      ›
    </button>

    <!-- Dots -->
    <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="h-2.5 w-2.5 rounded-full transition"
        :class="index === current ? 'bg-white' : 'bg-white/50'"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Slide {
  src: string
  alt?: string
}

const props = defineProps<{
  slides: Slide[]
  interval?: number
}>()

const current = ref(0)
const delay = props.interval ?? 4000
let timer: ReturnType<typeof setInterval> | null = null

const next = () => {
  current.value = (current.value + 1) % props.slides.length
}

const prev = () => {
  current.value =
    (current.value - 1 + props.slides.length) % props.slides.length
}

const goTo = (index: number) => {
  current.value = index
}

const play = () => {
  if (!timer) {
    timer = setInterval(next, delay)
  }
}

const pause = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(play)
onBeforeUnmount(pause)
</script>
