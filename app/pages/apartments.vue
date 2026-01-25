<script setup lang="ts">
import { ref, computed, watchEffect, nextTick } from 'vue'
import { useI18n, useRoute } from '#imports'
import { beds24Apartments } from '~/config/beds24'

const { t, locale } = useI18n()
const route = useRoute()

/* ------------------------------------
   Optional prefill from search
------------------------------------ */
const qAdults = computed(() => Number(route.query.adults || 1))
const qCheckin = computed(() => String(route.query.checkin || ''))
const qCheckout = computed(() => String(route.query.checkout || ''))

/* ------------------------------------
   Apartment UI data (static only)
------------------------------------ */
const apartments = computed(() =>
  Object.entries(beds24Apartments).map(([slug, p]) => ({
    slug,
    roomId: p.roomId,
    capacity: p.capacity,
    title: slug.replace(/^\w/, c => c.toUpperCase()),
    description: `Sleeps up to ${p.capacity}`,
    images: [
      `/img/${slug}-1.jpg`,
      `/img/${slug}-2.jpg`,
      `/img/${slug}-3.jpg`,
    ],
  }))
)

/* ------------------------------------
   Image slider
------------------------------------ */
const slideIndex = ref<number[]>([])
watchEffect(() => {
  slideIndex.value = Array.from({ length: apartments.value.length }, () => 0)
})
function next(i: number) {
  const imgs = apartments.value[i]?.images ?? []
  if (!imgs.length) return
  slideIndex.value[i] = (slideIndex.value[i] + 1) % imgs.length
}

/* ------------------------------------
   Inline booking state
------------------------------------ */
const activeRoomId = ref<string | null>(null)
const iframeRefs = ref<HTMLElement[]>([])

/* ------------------------------------
   Beds24 booking URL (official params)
------------------------------------ */
function bookingUrl(roomId: string) {
  const params = new URLSearchParams({
    propid: '151309',
    roomid: roomId,
    lang: locale.value,
    hideheader: '1',
    hidefooter: '1',
  })

  if (qCheckin.value) params.set('checkin', qCheckin.value)
  if (qCheckout.value) params.set('checkout', qCheckout.value)
  if (qAdults.value) params.set('numadult', String(qAdults.value))

  return `https://beds24.com/booking2.php?${params.toString()}`
}

/* ------------------------------------
   Toggle inline booking
------------------------------------ */
async function toggleBooking(roomId: string, index: number) {
  if (activeRoomId.value === roomId) {
    activeRoomId.value = null
    return
  }

  activeRoomId.value = roomId
  await nextTick()

  iframeRefs.value[index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <section class="relative w-full py-16 md:py-24">
    <div class="container max-w-7xl">

      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="heading">Apartments</h1>
        <p class="subheading">
          Select an apartment and complete your booking securely.
        </p>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div
          v-for="(apt, i) in apartments"
          :key="apt.slug"
          class="rounded-2xl bg-white/10 overflow-hidden flex flex-col transition-shadow hover:shadow-xl"
        >
          <!-- Image -->
          <div class="relative h-52 overflow-hidden">
            <img
              :src="apt.images[slideIndex[i]]"
              :alt="apt.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <button
              @click="next(i)"
              class="absolute right-3 bottom-3 bg-black/60 text-white px-3 py-1 rounded-full"
            >
              →
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 flex flex-col grow">
            <h3 class="text-xl font-semibold mb-1">
              {{ apt.title }}
            </h3>

            <p class="text-slate-300 mb-2">
              {{ apt.description }}
            </p>

            <span class="chip w-fit mb-4">
              Max {{ apt.capacity }}
            </span>

            <button
              @click="toggleBooking(apt.roomId, i)"
              class="btn-primary mt-auto"
            >
              {{
                activeRoomId === apt.roomId
                  ? 'Close booking'
                  : 'Check availability'
              }}
            </button>
          </div>

          <!-- INLINE BOOKING (animated) -->
          <transition
            name="expand"
            @enter="el => (el.style.height = el.scrollHeight + 'px')"
            @after-enter="el => (el.style.height = 'auto')"
            @leave="el => (el.style.height = el.scrollHeight + 'px')"
          >
            <div
              v-if="activeRoomId === apt.roomId"
              ref="iframeRefs"
              class="bg-white overflow-hidden"
            >
              <iframe
                :src="bookingUrl(apt.roomId)"
                class="w-full min-h-[720px]"
                frameborder="0"
                loading="lazy"
              />
            </div>
          </transition>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: height 0.35s ease, opacity 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>
