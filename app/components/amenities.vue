<script setup lang="ts">
import BackgroundCarousel from '~/components/BackgroundCarousel.vue'

const amenitySlides = [
  '/img/slide-1.jpg',
      '/img/slide-2.jpg',
      '/img/slide-3.jpg',
      '/img/slide-4.jpg',
      '/img/slide-5.jpg'
]
</script>

<template>
  <section class="section bg-gray-200">
    <BackgroundCarousel
      :slides="amenitySlides"
      class="min-h-[700px] flex items-center"
    >
      <div class="container py-24">
        <!-- Section Title -->
        <div class="mb-12 text-center">
          <h2 class="heading">Amenities</h2>
          <p class="subheading">
            Everything you need inside and out for a comfortable stay.
          </p>
        </div>

        <!-- Two feature groups -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Apartments -->
          <div
            class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/60 to-gray-900/20 border border-white/10 p-6 md:p-8 shadow-lg hover:shadow-lime-500/10 transition-shadow"
            aria-labelledby="amenities-apartments"
          >
            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-lime-500/20 blur-2xl" />
            <div class="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-lime-400/10 blur-2xl" />

            <div class="flex items-center gap-3 mb-6">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/15 text-lime-300 text-2xl">
                🏠
              </div>
              <h3 id="amenities-apartments" class="text-2xl md:text-3xl tracking-tight text-blue-600">
                Apartments
              </h3>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <li class="amenity-chip"><span class="amenity-icon">❄️</span><span class="amenity-text">Air Conditioning</span></li>
              <li class="amenity-chip"><span class="amenity-icon">📶</span><span class="amenity-text">Wi-Fi</span></li>
              <li class="amenity-chip"><span class="amenity-icon">📺</span><span class="amenity-text">TV</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🚿</span><span class="amenity-text">Bathroom</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🍳</span><span class="amenity-text">Small Kitchen</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🌅</span><span class="amenity-text">Balcony</span></li>
            </ul>
          </div>

          <!-- Outdoors -->
          <div
            class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/60 to-gray-900/20 border border-white/10 p-6 md:p-8 shadow-lg hover:shadow-lime-500/10 transition-shadow"
            aria-labelledby="amenities-outdoors"
          >
            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-lime-500/20 blur-2xl" />
            <div class="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-lime-400/10 blur-2xl" />

            <div class="flex items-center gap-3 mb-6">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/15 text-lime-300 text-2xl">
                🌿
              </div>
              <h3 id="amenities-outdoors" class="text-2xl md:text-3xl tracking-tight text-blue-600">
                Outdoors
              </h3>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <li class="amenity-chip"><span class="amenity-icon">🪑</span><span class="amenity-text">Lounge Area</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🅿️</span><span class="amenity-text">Parking</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🚿</span><span class="amenity-text">Outdoor Shower</span></li>
              <li class="amenity-chip"><span class="amenity-icon">🍖</span><span class="amenity-text">Barbecue</span></li>
            </ul>
          </div>
        </div>
      </div>
    </BackgroundCarousel>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.amenity-chip {
  @apply flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition duration-200 hover:bg-white/10 hover:-translate-y-0.5;
}
.amenity-icon {
  @apply text-xl md:text-2xl;
}
.amenity-text {
  @apply text-sm md:text-base tracking-wide;
}
</style>
