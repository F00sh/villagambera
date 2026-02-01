<script setup lang="ts">
type GuestDetails = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  arrivalTime: string;
  comments: string;
};

const props = defineProps<{
  modelValue: GuestDetails;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: GuestDetails): void;
  (e: "valid", ok: boolean): void;
}>();

const errors = ref<string[]>([]);

function update(patch: Partial<GuestDetails>) {
  emit("update:modelValue", { ...props.modelValue, ...patch });
}

function validate(): boolean {
  const g = props.modelValue;
  const errs: string[] = [];
  if (!g.title.trim()) errs.push("Title is required.");
  if (!g.firstName.trim()) errs.push("First name is required.");
  if (!g.lastName.trim()) errs.push("Surname is required.");
  if (!g.email.trim()) errs.push("Email is required.");
  if (!g.country.trim()) errs.push("Country is required.");

  errors.value = errs;
  emit("valid", errs.length === 0);
  return errs.length === 0;
}

// validate when fields change (lightweight)
watch(
  () => props.modelValue,
  () => validate(),
  { deep: true }
);

// expose validate() so parent can call before redirect
defineExpose({ validate });
</script>

<template>
  <div class="guest-form">
    <h3>Guest details</h3>

    <div v-if="errors.length" class="error">
      <div v-for="(e, i) in errors" :key="i">{{ e }}</div>
    </div>

    <div class="row">
      <label class="field">
        Title*
        <input
          :value="modelValue.title"
          @input="update({ title: ($event.target as HTMLInputElement).value })"
          placeholder="Mr / Ms"
        />
      </label>

      <label class="field">
        Arrival time
        <input
          :value="modelValue.arrivalTime"
          @input="update({ arrivalTime: ($event.target as HTMLInputElement).value })"
          placeholder="18:30"
        />
      </label>
    </div>

    <div class="row">
      <label class="field">
        First name*
        <input
          :value="modelValue.firstName"
          @input="update({ firstName: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="field">
        Surname*
        <input
          :value="modelValue.lastName"
          @input="update({ lastName: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="field">
      Email*
      <input
        type="email"
        :value="modelValue.email"
        @input="update({ email: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="row">
      <label class="field">
        Telephone
        <input
          :value="modelValue.phone"
          @input="update({ phone: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="field">
        Mobile
        <input
          :value="modelValue.mobile"
          @input="update({ mobile: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="field">
      Address
      <textarea
        rows="2"
        :value="modelValue.address"
        @input="update({ address: ($event.target as HTMLTextAreaElement).value })"
      />
    </label>

    <div class="row">
      <label class="field">
        City
        <input
          :value="modelValue.city"
          @input="update({ city: ($event.target as HTMLInputElement).value })"
        />
      </label>

            <label class="field">
              Postcode
              <input
                :value="modelValue.postcode"
                @input="update({ postcode: ($event.target as HTMLInputElement).value })"
              />
            </label>
      
            <label class="field">
              Country*
              <input
                :value="modelValue.country"
                @input="update({ country: ($event.target as HTMLInputElement).value })"
              />
            </label>
          </div>
      
          <label class="field">
            Comments
            <textarea
              rows="2"
              :value="modelValue.comments"
              @input="update({ comments: ($event.target as HTMLTextAreaElement).value })"
            ></textarea>
          </label>
        </div>
      </template>
