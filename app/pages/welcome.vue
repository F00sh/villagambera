<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18n } from '#imports'

const { locale } = useI18n()

const iframeRef = ref<HTMLElement | null>(null)

const searchParams = ref<{
  checkin: string
  checkout: string
  adults: number
} | null>(null)

/* --------------------------------------------------
  Handle search from SearchWidget
-------------------------------------------------- */
async function onSearch(payload: {
  checkin: string
  checkout: string
  adults: number
}) {
  console.log('SEARCH PAYLOAD:', payload)
  searchParams.value = payload
  await nextTick()
  iframeRef.value?.scrollIntoView({ behavior: 'smooth' })
}

/* --------------------------------------------------
  Beds24 iframe URL
-------------------------------------------------- */
const iframeUrl = computed(() => {
  if (!searchParams.value) return ''

  const params = new URLSearchParams({
    propid: '151309',
    checkin: searchParams.value.checkin,
    checkout: searchParams.value.checkout,
    numadult: String(searchParams.value.adults),
    lang: locale.value,
  })

  return `https://beds24.com/booking2.php?${params.toString()}`
})
</script>

<template>
  <section class="relative">

    <!-- HERO -->
    <BackgroundCarousel class="h-[85vh] min-h-[600px]">
      <div
        class="
          absolute inset-0
          bg-black/40
          flex items-center
        "
      >
        <div class="container text-center text-white pt-24">
          <h1 class="heading mb-4">
            Welcome to Villa Gambera
          </h1>

          <p class="subheading max-w-2xl mx-auto mb-10">
            A refined seaside retreat in Pirovac — calm, sun, and Mediterranean charm.
          </p>

          <SearchWidget @search="onSearch" />

          <div class="mt-8">
            <NuxtLink
              to="/apartments"
              class="
                inline-block
                text-white/90
                underline
                hover:text-white
              "
            >
              Browse apartments →
            </NuxtLink>
          </div>
        </div>
      </div>
    </BackgroundCarousel>

    <!-- BEDS24 EMBED -->
    <section
      v-if="iframeUrl"
      ref="iframeRef"
      class="container py-20"
    >
      <div
        class="
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
      >
        <iframe
          :src="iframeUrl"
          class="w-full h-[900px]"
          frameborder="0"
          loading="lazy"
        />
      </div>
    </section>

  </section>
</template>
