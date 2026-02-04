<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useI18n, useRoute, useRuntimeConfig } from '#imports'
import BookingWidget from '@/components/BookingWidget.vue'
import { beds24Apartments } from '~/config/beds24'

const { locale } = useI18n()
const route = useRoute()

// Optional prefill from search
const qAdults = computed(() => Number(route.query.adults || 1))
const qCheckin = computed(() => String(route.query.checkin || ''))
const qCheckout = computed(() => String(route.query.checkout || ''))

// Apartment UI data (static)
const apartments = computed(() =>
  Object.entries(beds24Apartments).map(([slug, p]) => {
    const dir = `/img/apt_${slug}`
    const main = `${dir}/${slug}.avif`
    return {
      slug,
      roomId: p.roomId,
      capacity: p.capacity,
      floor: p.floor,
      title: p.name?.en || slug.replace(/^\w/, c => c.toUpperCase()),
      description: `Sleeps up to ${p.capacity}`,
      images: [main],
    }
  })
)

// Image slider
const slideIndex = ref<number[]>([])
watchEffect(() => {
  slideIndex.value = Array.from({ length: apartments.value.length }, () => 0)
})
function next(i: number) {
  const imgs = apartments.value[i]?.images ?? []
  if (!imgs.length) return
  slideIndex.value[i] = (slideIndex.value[i] + 1) % imgs.length
}

// Transition handlers to avoid inline arrow functions in template
function onEnter(el: Element) {
  const h = (el as HTMLElement).scrollHeight
  ;(el as HTMLElement).style.height = h + 'px'
}
function onAfterEnter(el: Element) {
  ;(el as HTMLElement).style.height = 'auto'
}
function onLeave(el: Element) {
  const h = (el as HTMLElement).scrollHeight
  ;(el as HTMLElement).style.height = h + 'px'
}

// Beds24 booking URL
function bookingUrl(roomId: string) {
  const runtimeConfig = useRuntimeConfig()
  const params = new URLSearchParams({
    propid: String(runtimeConfig.public?.beds24PropertyId || ''),
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

// Dropdown open state per apartment
const open = ref<Set<string>>(new Set())
function toggle(slug: string) {
  const s = new Set(open.value)
  if (s.has(slug)) s.delete(slug)
  else s.add(slug)
  open.value = s
}
</script>

<template>
  <section class="section bg-gray-200 pt-40">
    <div class="container">

   
      <!-- Header -->
      <div class="text-center mb-14">
        <h1 class="heading text-4xl md:text-6xl">Apartments</h1>
        <p class="subheading text-gray-700 pb-10 md:pb-20">
          Select an apartment and complete your booking securely.
        </p>
      </div>

      <!-- Rows: image left, widget right -->
      <div class="space-y-16">
        <div v-for="(apt, i) in apartments" :key="apt.slug" class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <!-- Image column -->
          <div>
            <div class="mb-3 space-y-1">
              <h3 class="uppercase tracking-widest text-blue-600 text-2xl font-black">{{ apt.title }}</h3>
              <p class="text-gray-800 tracking-wide">Floor: {{ apt.floor }}</p>
              <p class="text-gray-800 tracking-wide">Guests: up to {{ apt.capacity }}</p>
            </div>
            <div class="relative h-72 md:h-80 rounded-2xl overflow-hidden border border-black/10">
              <img :src="apt.images[slideIndex[i] ?? 0]" :alt="apt.title" class="absolute inset-0 w-full h-full object-cover" />
              <button v-if="apt.images.length > 1" @click="next(i)" class="absolute right-3 bottom-3 bg-black/60 text-white px-3 py-1 rounded-full">→</button>
            </div>

            <!-- Actions under the image -->
            <div class="mt-3 flex gap-3 flex-wrap">
              <button class="btn-primary" @click="toggle(apt.slug)">
                {{ open.has(apt.slug) ? 'Hide availability' : 'Check availability' }}
              </button>
              <a :href="bookingUrl(apt.roomId)" target="_blank" rel="noopener" class="btn-secondary text-lime-700 hover:text-lime-800">Book on Beds24</a>
            </div>
          </div>

          <!-- Widget column -->
          <div class="flex flex-col gap-4">
            <transition
              name="expand"
              @enter="onEnter"
              @after-enter="onAfterEnter"
              @leave="onLeave"
            >
              <div v-if="open.has(apt.slug)" class="overflow-hidden">
                <BookingWidget :fixed-room-id="Number(apt.roomId)" compact />
              </div>
            </transition>
          </div>
        </div>
      </div>

    </div>
  </section>
  <Contact />
  
</template>

<style scoped>
/* using global expand transition classes from main.css */
</style>
