<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useRoute } from '#imports'
import { beds24Apartments } from '~/config/beds24'

/* --------------------------------------------------
  Types
-------------------------------------------------- */
type ApartmentConfig = { roomId: string; capacity: number }

/* --------------------------------------------------
  Composables
-------------------------------------------------- */
const { locale, t } = useI18n()
const route = useRoute()

/* --------------------------------------------------
  Route params & query
-------------------------------------------------- */
const slug = String(route.params.slug)

const qCheckin = String(route.query.checkin || '')
const qCheckout = String(route.query.checkout || '')
const qAdults = Number(route.query.adults || 1)

/* --------------------------------------------------
  Apartment lookup (SAFE & TYPED)
-------------------------------------------------- */
const apartment = computed<{ slug: string; roomId: string; capacity: number } | null>(() => {
  const entry = Object.entries(beds24Apartments)
    .find(([s]) => s === slug) as [string, ApartmentConfig] | undefined

  if (!entry) return null

  const [s, p] = entry

  return {
    slug: s,
    roomId: p.roomId,
    capacity: p.capacity,
  }
})

/* --------------------------------------------------
  Beds24 booking URL
-------------------------------------------------- */
const beds24Url = computed(() => {
  if (!apartment.value) return '#'
  const params = new URLSearchParams()
  params.set('roomid', apartment.value.roomId)
  if (qCheckin) params.set('checkin', qCheckin)
  if (qCheckout) params.set('checkout', qCheckout)
  if (qAdults) params.set('numadult', String(qAdults))
  return `https://beds24.com/booking2.php?${params.toString()}`
})

/* --------------------------------------------------
  SEO
-------------------------------------------------- */
useSeoMeta({
  title: () =>
    apartment.value
      ? `${apartment.value.slug} – ${t('checkAvailability')}`
      : 'Apartment',
  description: () =>
    apartment.value
      ? `Sleeps up to ${apartment.value.capacity}.`
      : 'Apartment detail',
})
</script>

<template>
  <section class="relative w-full py-16 md:py-24">
    <div class="container max-w-5xl">

      <!-- Not found -->
      <div v-if="!apartment" class="text-center text-white/80">
        Apartment not found.
      </div>

      <!-- Apartment -->
      <div v-else>
        <header class="mb-10 text-center">
          <h1 class="heading">{{ apartment.slug }}</h1>
          <p class="subheading">Max {{ apartment.capacity }}</p>
        </header>

        <!-- Images -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <img
            v-for="i in 3"
            :key="i"
            :src="`/img/${apartment.slug}-${i}.jpg`"
            :alt="apartment.slug"
            class="w-full aspect-4/3 object-cover rounded-xl"
          />
        </div>

        <!-- Booking info -->
        <div class="bg-white/10 rounded-xl p-6 text-white/90 mb-8">
          <p>
            <strong>{{ t('checkin') }}:</strong> {{ qCheckin || '—' }}<br />
            <strong>{{ t('checkout') }}:</strong> {{ qCheckout || '—' }}<br />
            <strong>{{ t('adults') }}:</strong> {{ qAdults }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink to="/apartments" class="btn-ghost">← Back to results</NuxtLink>

          <a
            :href="beds24Url"
            target="_blank"
            rel="noopener"
            class="btn-primary"
            :class="{ 'opacity-50 pointer-events-none': beds24Url === '#' }"
          >
            {{ t('bookNow') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
