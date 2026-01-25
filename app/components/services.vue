<template>
  <section class="section bg-gray-200">
    <div class="container">

      <div class="text-center mb-12">
        <h2 class="heading text-gray-900">Our Services</h2>
        <p class="subheading text-gray-700">Simple, local, and sustainable options for your stay.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        <!-- Rent a Bike -->
        <div class="card p-8 flex flex-col items-center text-center shadow-sm hover:shadow-teal-500/10 transition">
          <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 text-2xl">
            🚲
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900">Rent a Bike</h3>
          <p class="text-gray-700 mb-6">
            Explore the area at your own pace with our comfortable and reliable bikes.
          </p>
          <button class="btn-primary mt-auto">Book a Bike</button>
        </div>

        <!-- Rent an Electric Scooter -->
        <div class="card p-8 flex flex-col items-center text-center shadow-sm hover:shadow-teal-500/10 transition">
          <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 text-2xl">
            🛴
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900">Rent an Electric Scooter</h3>
          <p class="text-gray-700 mb-6">
            A fun and eco-friendly way to move around quickly and effortlessly.
          </p>
          <button class="btn-primary mt-auto">Book a Scooter</button>
        </div>

        <!-- Buy Olive Oil -->
        <div class="card p-8 flex flex-col items-center text-center shadow-sm hover:shadow-teal-500/10 transition">
          <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 text-2xl">
            🫒
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900">Buy Olive Oil</h3>
          <p class="text-gray-700 mb-6">
            Premium local olive oil, cold-pressed and perfect for authentic Mediterranean dishes.
          </p>
          <button class="btn-primary mt-auto">Buy Olive Oil</button>
        </div>

      </div>
    </div>
  </section>
</template>
