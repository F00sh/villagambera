<template>
  <section class="section bg-gray-200 py-40">
    <div class="container">
      <div class="text-center mb-12">
        <h2 class="heading">Location</h2>
        <p class="subheading text-gray-800 tracking-wide mt-3">
          Mecanovo 7, 22213 Pirovac, Croatia
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <!-- Map -->
        <div class="rounded-2xl overflow-hidden border border-black/10 shadow-sm">
          <iframe
            class="w-full h-[380px] md:h-[600px]"
            style="border:0;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Mecanovo%207%2C%2022213%2C%20Pirovac%2C%20Croatia&output=embed">
          </iframe>
        </div>

        <!-- Street View -->
        <div class="rounded-2xl overflow-hidden border border-black/10 shadow-sm">
          <iframe
            class="w-full h-[380px] md:h-[600px]"
            style="border:0;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=&layer=c&cbll=43.8192550,15.6655633&cbp=11,0,0,0,0&output=svembed">
          </iframe>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// simple presentational component
</script>

<style scoped>
</style>
