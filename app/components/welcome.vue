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
      class="hero-smooth min-h-screen flex items-center"
      stickTop
    >
      <div class="container w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16 md:py-20 lg:py-24">
          <!-- Left: Title + CTAs -->
          <div class="text-center md:text-left">
            <h1 class="heading">Welcome to Villa Gambera</h1>
            <p class="subheading text-gray-300 mt-4 max-w-2xl mx-auto md:mx-0">
              The perfect base to explore the seaside charm and hidden gems of Pirovac.
            </p>
            <div class="mt-6 flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <button class="btn-primary" type="button" @click="toggleCalendar">
                {{ calOpen ? 'Hide calendar' : 'Book now' }}
              </button>
              <NuxtLink class="btn-secondary inline-block" to="/apartments">Browse apartments</NuxtLink>
            </div>
          </div>

          <!-- Right: Widget when active -->
          <transition name="expand">
            <div v-if="calOpen" class="w-full max-w-[860px] md:ml-auto md:mr-0 mx-auto mt-6 md:mt-0">
              <BookingWidget compact closable @close="calOpen = false" />
            </div>
          </transition>
        </div>
      </div>
    </BackgroundCarousel>

  </section>
</template>

<style scoped>
/* using global expand transition classes from main.css */
</style>
