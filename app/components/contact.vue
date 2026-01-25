<template>
  <section class="relative w-full">
    <BackgroundCarousel class="w-full py-16 min-h-[60vh]" :overlay="true">
      <div class="container max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">

        <!-- Contact Info -->
        <div class="flex flex-col justify-center space-y-6">
          <h2 class="heading">Get in touch</h2>

          <p class="subheading">
            Have a question or want to make a booking?
            Fill out the form or contact us directly.
          </p>

          <div class="space-y-3">
            <div>
              <span class="font-semibold text-slate-200">Email:</span>
              <a
                href="mailto:hello@example.com"
                class="ml-2 text-teal-300 hover:underline"
              >
                hello@example.com
              </a>
            </div>

            <div>
              <span class="font-semibold text-slate-200">Phone:</span>
              <a
                href="tel:+1234567890"
                class="ml-2 text-teal-300 hover:underline"
              >
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <form
          class="card bg-white/10 p-6 md:p-8 space-y-5"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              class="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              class="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Inquiry
            </label>
            <textarea
              rows="4"
              required
              placeholder="Tell us what you need…"
              class="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full btn-primary"
          >
            Book / Send Inquiry
          </button>
        </form>
      </div>
    </BackgroundCarousel>
  </section>
</template>

<script setup>
const handleSubmit = () => {
  alert('Booking request sent (demo)');
}
</script>
