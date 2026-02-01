<template>
  <section class="section bg-gray-200">
    <BackgroundCarousel
      class="min-h-[520px] md:min-h-[600px] lg:min-h-[680px] flex items-center"
    >
      <div class="container w-full">
        <div class="mx-auto max-w-3xl text-center py-16 md:py-20 lg:py-24">
          <h1 class="heading text-gray-100">
            Welcome to Villa Gambera
          </h1>

          <p class="subheading text-gray-300 mt-4 max-w-2xl mx-auto">
            The perfect base to explore the seaside charm and hidden gems of Pirovac.
          </p>

          <div class="mt-8">
            <BookingWidget />
          </div>

          <div class="mt-6">
            <NuxtLink class="btn-primary inline-block" to="/apartments">
              Browse Apartments
            </NuxtLink>
          </div>
        </div>
      </div>
    </BackgroundCarousel>
  </section>
</template>
