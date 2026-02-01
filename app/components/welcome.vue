<script setup lang="ts">
import { ref } from 'vue'
import BackgroundCarousel from '~/components/BackgroundCarousel.vue'
import BookingWidget from '@/components/BookingWidget.vue'

const calOpen = ref(false)
function toggleCalendar() {
  calOpen.value = !calOpen.value
}
</script>

<template>
  <section class="section bg-gray-200">
    <BackgroundCarousel
      class="min-h-[520px] md:min-h-[600px] lg:min-h-[680px] flex items-center"
      :class="{ 'min-h-[900px] md:min-h-[1000px]': calOpen }"
    >
      <div class="container w-full">
        <div class="mx-auto max-w-3xl text-center py-16 md:py-20 lg:py-24">
          <h1 class="heading text-gray-100">
            Welcome to Villa Gambera
          </h1>

          <p class="subheading text-gray-300 mt-4 max-w-2xl mx-auto">
            The perfect base to explore the seaside charm and hidden gems of Pirovac.
          </p>

          <div class="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button class="btn-primary" type="button" @click="toggleCalendar">
              {{ calOpen ? 'Hide calendar' : 'Book now' }}
            </button>
            <NuxtLink class="btn-secondary inline-block" to="/apartments">
              Browse apartments
            </NuxtLink>
          </div>

          <transition
            name="expand"
            @enter="el => (el.style.height = el.scrollHeight + 'px')"
            @after-enter="el => (el.style.height = 'auto')"
            @leave="el => (el.style.height = el.scrollHeight + 'px')"
          >
            <div v-if="calOpen" class="mt-6 overflow-hidden flex justify-center">
              <div class="w-full max-w-[760px]">
                <BookingWidget compact />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </BackgroundCarousel>

  </section>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: height 0.3s ease, opacity 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>
