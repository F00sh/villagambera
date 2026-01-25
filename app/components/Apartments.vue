<script setup lang="ts">
const slides = [
  { src: '/img/apt-1.jpg', alt: 'Apartment interior' },
  { src: '/img/apt-2.jpg', alt: 'Bedroom and living area' },
  { src: '/img/apt-3.jpg', alt: 'Kitchen and dining space' },
  { src: '/img/apt-4.jpg', alt: 'Balcony view' },
  { src: '/img/apt-5.jpg', alt: 'Outdoor seating' },
]
</script>

<template>
  <section class="section bg-gray-200 pt-20">
    <div class="container">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        <!-- LEFT: Text -->
        <div class="text-center lg:text-left">
          <h2 class="heading text-gray-900">Apartments</h2>

          <p class="subheading text-gray-700 mt-4">
            Seven unique apartments, each with its own charm and comfort.
          </p>

          <p class="mt-6 text-gray-800 leading-relaxed max-w-xl">
            Each apartment at Villa Gambera is designed to be bright, functional,
            and comfortable, offering a relaxed space to unwind after a day by the
            sea. With fully equipped kitchens, private bathrooms, and outdoor areas,
            our apartments provide everything you need for a simple and enjoyable
            stay, whether you’re visiting for a weekend or a longer holiday.
          </p>

          <div class="mt-8">
            <NuxtLink to="/apartments" class="btn-primary">
              View All Apartments
            </NuxtLink>
          </div>
        </div>

        <!-- RIGHT: Gallery -->
        <div>
          <AboutGallery :slides="slides" :interval="5000" />
        </div>
      </div>
    </div>
  </section>
</template>
