<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '#imports'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'search', payload: {
    checkin: string
    checkout: string
    adults: number
  }): void
}>()

const today = new Date().toISOString().slice(0, 10)

const checkin = ref('')
const checkout = ref('')
const adults = ref(1)

/* --------------------------------------------------
  Keep checkout >= checkin
-------------------------------------------------- */
watch(checkin, (v) => {
  if (!v) return
  if (checkout.value && checkout.value < v) {
    checkout.value = v
  }
})

function submit(e: Event) {
  e.preventDefault()
  if (!checkin.value || !checkout.value || adults.value < 1) return

  emit('search', {
    checkin: checkin.value,
    checkout: checkout.value,
    adults: adults.value,
  })
}
</script>

<template>
  <form
    @submit="submit"
    class="relative w-full max-w-5xl mx-auto"
  >
    <div
      class="
        grid grid-cols-1
        md:grid-cols-4
        gap-4
        bg-white/95
        backdrop-blur
        rounded-2xl
        p-4
        shadow-xl
      "
    >
      <!-- CHECK IN -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">
          {{ t('checkIn') }}
        </label>
        <input
          v-model="checkin"
          type="date"
          :min="today"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <!-- CHECK OUT -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">
          {{ t('checkOut') }}
        </label>
        <input
          v-model="checkout"
          type="date"
          :min="checkin || today"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <!-- ADULTS -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">
          {{ t('adults') }}
        </label>
        <input
          v-model.number="adults"
          type="number"
          min="1"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <!-- SUBMIT -->
      <div class="flex items-end">
        <button
          type="submit"
          class="
            w-full
            h-[42px]
            rounded-xl
            bg-emerald-600
            text-white
            font-semibold
            hover:bg-emerald-700
            transition
          "
        >
          {{ t('search') }}
        </button>
      </div>
    </div>
  </form>
</template>
