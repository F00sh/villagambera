<template>
  <section class="section bg-gray-200 py-20 md:py-40">
    <div class="container">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      >
        <!-- LEFT: Gallery (mobile second) -->
        <div class="order-2 lg:order-1">
          <AboutGallery
            :slides="[
              { src: '/img/about-1.jpg', alt: 'Seaside apartments' },
              { src: '/img/about-2.jpg', alt: 'Apartment interior' },
              { src: '/img/about-3.jpg', alt: 'Terrace view' },
              { src: '/img/about-4.jpg', alt: 'Outdoor area' },
              { src: '/img/about-5.jpg', alt: 'Coastal surroundings' },
              { src: '/img/about-6.jpg', alt: 'Details and comfort' },
              { src: '/img/about-7.jpg', alt: 'Relaxed seaside living' },
            ]"
            :interval="5000"
          />
        </div>

        <!-- RIGHT: Text (mobile first) -->
        <div class="order-1 lg:order-2 text-center lg:text-left">
          <h2 class="heading">About Us</h2>

          <p class="subheading text-gray-800 mt-4">
            Family-run seaside apartments designed for calm, comfort and easy living.
          </p>

          <p class="mt-6 text-gray-800 leading-relaxed max-w-xl">
            Villa Gambera is a small, family-run property located just steps from the
            Adriatic coast. Our apartments are designed to feel simple, bright, and
            welcoming — a place where you can slow down, enjoy the sea air, and feel
            at home from the moment you arrive. Whether you’re here to explore the
            coastline or simply relax, we focus on thoughtful details and quiet
            comfort to make your stay effortless.
          </p>

          <div class="mt-8 hidden md:block">
            <NuxtLink to="/apartments" class="btn-primary">
              Booking
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile button below gallery -->
        <div class="order-3 lg:hidden text-center">
          <div class="mt-4">
            <NuxtLink to="/apartments" class="btn-primary">
              Booking
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
