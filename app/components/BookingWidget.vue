<script setup lang="ts">
import { computed, ref, watch } from "vue";
const props = defineProps<{ fixedRoomId?: number; compact?: boolean }>();

type Room = { id: number; name: string; type: string; maxGuests: number };
type Day = {
  date: string;
  available: boolean;
  inventory: number;
  minStay: number;
  noCheckin: boolean;
  noCheckout: boolean;
  blackout: boolean;
  price: number | null;
};

const runtimeConfig = useRuntimeConfig();
const PROPERTY_ID = String(runtimeConfig.public?.beds24PropertyId || "151309");

const ROOMS: Room[] = [
  { id: 335370, name: "Lavander", type: "1 bed · ground floor", maxGuests: 4 },
  { id: 335357, name: "Bamboo", type: "Studio · 1st floor", maxGuests: 2 },
  { id: 335369, name: "Oleander", type: "1 bed · 1st floor", maxGuests: 4 },
  { id: 335366, name: "Olive", type: "Studio · 1st floor", maxGuests: 4 },
  { id: 335367, name: "Magnolia", type: "Room · 1st floor", maxGuests: 2 },
  { id: 335368, name: "Rosemary", type: "1 bed · 1st floor", maxGuests: 4 },
  { id: 335375, name: "Lime", type: "1 bed · 2nd floor", maxGuests: 4 },
];

const isFixedRoom = computed(() => typeof props.fixedRoomId === 'number' && (props.fixedRoomId as number) > 0);
const roomId = ref<number>(isFixedRoom.value ? (props.fixedRoomId as number) : (ROOMS[0]?.id ?? 0));
const adults = ref(2);
const children = ref(0);

const selectedRoom = computed(() => ROOMS.find(r => r.id === roomId.value) ?? ROOMS[0]);
const maxGuests = computed(() => selectedRoom.value?.maxGuests ?? 1);
const guests = computed(() => adults.value + children.value);

watch([roomId, adults, children], () => {
  if (adults.value < 1) adults.value = 1;
  if (children.value < 0) children.value = 0;
  if (guests.value > maxGuests.value) {
    adults.value = Math.min(adults.value, maxGuests.value);
    children.value = 0;
  }
});

// ---- Date helpers (NO toISOString) ----
function isoToLocalDate(iso: string) {
  // local midnight
  return new Date(iso + "T00:00:00");
}
function localDateToISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(iso: string, n: number) {
  const d = isoToLocalDate(iso);
  d.setDate(d.getDate() + n);
  return localDateToISO(d);
}
function diffNights(arr: string, dep: string) {
  const a = isoToLocalDate(arr).getTime();
  const b = isoToLocalDate(dep).getTime();
  return Math.round((b - a) / 86400000);
}

// Month navigation
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth() + 1);
const monthKey = computed(() => `${viewYear.value}-${String(viewMonth.value).padStart(2, "0")}`);

const days = ref<Day[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Selection
const arrival = ref<string | null>(null);
const departure = ref<string | null>(null);

// Nights toggle
const nightsToggle = ref<number>(0);
const nightsOptions = [0, 1, 2, 3, 4, 5, 7, 10, 14];

function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
function weekdayOfFirst(y: number, m: number) { return new Date(y, m - 1, 1).getDay(); }
function monthTitle() {
  return new Date(viewYear.value, viewMonth.value - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}
function prevMonth() {
  if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value -= 1; }
  else viewMonth.value -= 1;
}
function nextMonth() {
  if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value += 1; }
  else viewMonth.value += 1;
}

function dayObj(iso: string) { return days.value.find(d => d.date === iso) ?? null; }

// arrival allowed
function canSelectArrival(iso: string) {
  const d = dayObj(iso);
  return !!d && d.available && !d.noCheckin;
}

// night allowed
function isNightAvailable(iso: string) {
  const d = dayObj(iso);
  return !!d && d.available;
}

// departure clickability: only if all nights [arrival, departure) are available
function validateRangeForClick(arr: string, dep: string): boolean {
  if (diffNights(arr, dep) <= 0) return false;

  const cur = isoToLocalDate(arr);
  const end = isoToLocalDate(dep);

  while (cur < end) {
    const iso = localDateToISO(cur);
    if (!isNightAvailable(iso)) return false;
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

// strict booking validity
function validateRangeStrict(arr: string, dep: string): string | null {
  const stayNights = diffNights(arr, dep);
  if (stayNights <= 0) return "Departure must be after arrival.";

  const aObj = dayObj(arr);
  const minStay = aObj?.minStay ?? 1;
  if (stayNights < minStay) return `Minimum stay is ${minStay} night(s) for this arrival date.`;

  if (!validateRangeForClick(arr, dep)) return "Selected range includes unavailable night(s).";

  const depObj = dayObj(dep);
  if (depObj?.noCheckout) return "Selected departure date does not allow check-out.";

  return null;
}

const selectedNights = computed(() => (arrival.value && departure.value) ? diffNights(arrival.value, departure.value) : 0);

const rangeError = computed(() => {
  if (!arrival.value || !departure.value) return null;
  return validateRangeStrict(arrival.value, departure.value);
});

function clearDates() {
  arrival.value = null;
  departure.value = null;
  nightsToggle.value = 0;
}

function trySetDepartureByNights() {
  if (!arrival.value || nightsToggle.value <= 0) return;
  const dep = addDays(arrival.value, nightsToggle.value);

  // needs to exist in loaded month data to be validated/clickable
  if (!dayObj(dep)) { departure.value = null; return; }

  departure.value = validateRangeForClick(arrival.value, dep) ? dep : null;
}

watch([arrival, nightsToggle], () => {
  if (arrival.value && nightsToggle.value > 0) trySetDepartureByNights();
});

// Load month from API
async function loadMonth() {
  loading.value = true;
  error.value = null;
  try {
    const res = await $fetch<{ days: Day[] }>("/api/beds24/room-dates", {
      query: { roomId: roomId.value, month: monthKey.value },
    });
    days.value = res.days;

    // keep selection consistent
    if (arrival.value && !canSelectArrival(arrival.value)) arrival.value = null;
    if (arrival.value && departure.value && !validateRangeForClick(arrival.value, departure.value)) departure.value = null;
  } catch {
    error.value = "Could not load availability from Beds24. Check keys and server logs.";
    days.value = [];
  } finally {
    loading.value = false;
  }
}
watch([roomId, monthKey], loadMonth, { immediate: true });

// Grid
const grid = computed(() => {
  const dim = daysInMonth(viewYear.value, viewMonth.value);
  const firstDow = weekdayOfFirst(viewYear.value, viewMonth.value);
  const cells: { iso?: string }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({});
  for (let d = 1; d <= dim; d++) {
    const iso = `${viewYear.value}-${String(viewMonth.value).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ iso });
  }
  return cells;
});

// colors
function isInStayRange(iso: string) {
  if (!arrival.value || !departure.value) return false;
  return iso >= arrival.value && iso < departure.value;
}
function isArrival(iso: string) { return arrival.value === iso; }
function isDeparture(iso: string) { return departure.value === iso; }

function isUnavailableDay(iso: string) {
  const d = dayObj(iso);
  if (!d) return false;
  return !d.available || d.blackout;
}

// STRICT click rules:
function isSelectableCell(iso: string) {
  // pick arrival
  if (!arrival.value || (arrival.value && departure.value)) return canSelectArrival(iso);

  // pick departure
  if (arrival.value && !departure.value) {
    if (diffNights(arrival.value, iso) <= 0) return false;
    return validateRangeForClick(arrival.value, iso);
  }

  return false;
}

function onDayClick(iso: string) {
  // set arrival
  if (!arrival.value || (arrival.value && departure.value)) {
    if (!canSelectArrival(iso)) return;
    arrival.value = iso;
    departure.value = null;
    if (nightsToggle.value > 0) trySetDepartureByNights();
    return;
  }

  // set departure
  if (arrival.value && !departure.value) {
    if (!isSelectableCell(iso)) return;
    departure.value = iso;
  }
}

function displayPrice(iso: string) {
  const d = dayObj(iso);
  return d?.price == null ? "" : `€${Number(d.price).toFixed(0)}`;
}

const canBook = computed(() => {
  if (!arrival.value || !departure.value) return false;
  if (guests.value < 1 || guests.value > maxGuests.value) return false;
  return rangeError.value === null;
});

// No on-site guest form; details are filled on Beds24

function buildBeds24Url() {
  if (!arrival.value || !departure.value) throw new Error("Missing dates");

  const params = new URLSearchParams({
    propid: String(PROPERTY_ID),
    roomid: String(roomId.value),
    checkin: arrival.value,
    numnight: String(selectedNights.value),
    numadult: String(adults.value),
    numchild: String(children.value),
  });

  params.set(`br1-${roomId.value}`, "Book");
  return `https://www.beds24.com/booking2.php?${params.toString()}`;
}

function goToPayment() {
  if (!canBook.value) return;
  const url = buildBeds24Url();
  window.location.assign(url);
}

</script>

<template>
  <div class="widget" :class="{ compact: !!compact }">
    <div class="header">
      <div>
        <div class="title">Book your stay</div>
        <div class="times">Check-in 16:00–24:00 · Check-out by 10:00</div>
      </div>
      <button class="clear" type="button" @click="clearDates" :disabled="!arrival && !departure">Clear</button>
    </div>

    <label v-if="!isFixedRoom" class="field">
      Room
      <select v-model.number="roomId">
        <option v-for="r in ROOMS" :key="r.id" :value="r.id">
          {{ r.name }} · {{ r.type }} · up to {{ r.maxGuests }}
        </option>
      </select>
    </label>

    <div class="row">
      <label class="field">
        Adults
        <input type="number" v-model.number="adults" min="1" :max="maxGuests" />
      </label>
      <label class="field">
        Children
        <input type="number" v-model.number="children" min="0" :max="maxGuests - adults" />
      </label>
    </div>

    <div class="calendar">
      <div class="cal-header">
        <button type="button" @click="prevMonth">‹</button>
        <div class="cal-title">{{ monthTitle() }}</div>
        <button type="button" @click="nextMonth">›</button>
      </div>

      <div class="controls">
        <div class="selected">
          <div class="muted">Arrival</div>
          <div>{{ arrival || "—" }}</div>
        </div>
        <div class="selected">
          <div class="muted">Departure</div>
          <div>{{ departure || "—" }}</div>
        </div>
        <div class="selected">
          <div class="muted">Nights</div>
          <div>{{ selectedNights || "—" }}</div>
        </div>
      </div>


      <div v-if="rangeError" class="range-error">{{ rangeError }}</div>

      <div v-if="loading" class="muted">Loading…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="grid">
        <div class="dow">Sun</div><div class="dow">Mon</div><div class="dow">Tue</div><div class="dow">Wed</div><div class="dow">Thu</div><div class="dow">Fri</div><div class="dow">Sat</div>

        <button
          v-for="(cell, idx) in grid"
          :key="idx"
          class="day"
          :class="{
            empty: !cell.iso,

            unavailable: !!cell.iso && !!dayObj(cell.iso) && isUnavailableDay(cell.iso) && (!arrival || !!departure),
            disabled: !!cell.iso && arrival && !departure && !isSelectableCell(cell.iso),

            stay: !!cell.iso && isInStayRange(cell.iso),
            start: !!cell.iso && isArrival(cell.iso),
            end: !!cell.iso && isDeparture(cell.iso),
          }"
          type="button"
          :disabled="!cell.iso || !isSelectableCell(cell.iso)"
          @click="cell.iso && onDayClick(cell.iso)"
        >
          <template v-if="cell.iso">
            <div class="d">{{ Number(cell.iso.slice(-2)) }}</div>
            <div class="p">{{ displayPrice(cell.iso) }}</div>
          </template>
        </button>
      </div>

      <div class="legend">
        <span class="swatch green"></span> Selected stay
        <span class="swatch red"></span> Unavailable
        <span class="swatch white"></span> Available
      </div>
    </div>



    <button class="cta" type="button" :disabled="!canBook" @click="goToPayment">
      Continue on Beds24
    </button>

    <div class="fineprint">
      Green = selected stay. Red = unavailable. White = available. Only valid arrival/departure options are clickable.
    </div>
  </div>
</template>

<style scoped>
/* Glassy compact widget */
.widget {
  /* palette */
  --fg: rgba(15, 23, 42, 0.96);         /* slate-900 with alpha */
  --fg-soft: rgba(15, 23, 42, 0.78);
  --bg: rgba(255, 255, 255, 0.42);       /* more transparent */
  --panel: rgba(255, 255, 255, 0.36);
  --border: rgba(2, 6, 23, 0.12);        /* slate-950 alpha */
  --shadow: rgba(2, 6, 23, 0.16);
  --ok: 34, 197, 94;                     /* green-500 */
  --bad: 239, 68, 68;                    /* red-500 */

  max-width: 560px;
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: 0 8px 28px var(--shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--fg);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* Compact variant */
.widget.compact {
  max-width: 420px;
  gap: 8px;
  padding: 10px;
}
.widget.compact .title { font-size: 0.95rem; }
.widget.compact .times { font-size: 0.8rem; }
.widget.compact .cal-title { font-size: 0.9rem; }
.widget.compact .selected { padding: 6px; }
.widget.compact .grid { gap: 3px; }
.widget.compact .day { min-height: 40px; padding: 5px; }
.widget.compact .d { font-size: 0.9rem; }
.widget.compact .p { font-size: 0.75rem; }

.header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.title { font-weight: 700; font-size: 1rem; color: var(--fg); }
.times { color: var(--fg-soft); font-size: 0.85rem; }
.clear {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.5);
  padding: 6px 10px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  color: var(--fg);
}
.clear:disabled { opacity: 0.45; cursor: not-allowed; }

.field { display: grid; gap: 6px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.calendar {
  display: grid; gap: 8px; padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  backdrop-filter: blur(10px);
}
.cal-header { display: grid; grid-template-columns: 34px 1fr 34px; align-items: center; }
.cal-title { text-align: center; font-weight: 600; font-size: 0.95rem; color: var(--fg); }

.controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.selected {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255,255,255,0.52);
  color: var(--fg);
}
.muted { color: var(--fg-soft); font-size: 0.85rem; }

.nights-toggle { margin-top: 2px; }
.nights-toggle select {
  border-radius: 8px; border: 1px solid var(--border);
  background: rgba(255,255,255,0.5);
  padding: 6px 8px;
  color: var(--fg);
}
.range-error {
  color: #b00020;
  padding: 8px 10px;
  border: 1px solid #ffd0d0;
  background: rgba(255, 240, 240, 0.7);
  border-radius: 10px;
}

.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.dow { text-align: center; font-size: 0.8rem; color: var(--fg-soft); }

.day {
  min-height: 46px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px;
  text-align: left;
  background: rgba(255,255,255,0.7);
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  color: var(--fg);
}
.day.empty { border: none; background: transparent; }
.day:not(.empty):hover { border-color: rgba(2,6,23,0.22); box-shadow: 0 1px 4px rgba(2,6,23,0.12); }

/* Availability coloring with translucent tones */
.day.unavailable { background: rgba(var(--bad), 0.18); border-color: rgba(var(--bad), 0.55); }
.day.disabled { opacity: 0.35; cursor: not-allowed; }

.day.stay { background: rgba(var(--ok), 0.18); border-color: rgba(var(--ok), 0.52); }
.day.start, .day.end { background: rgba(var(--ok), 0.28); border-color: rgba(var(--ok), 0.65); }

.d { font-weight: 700; font-size: 0.95rem; color: var(--fg); }
.p { font-size: 0.8rem; color: var(--fg-soft); }

.legend { display: flex; gap: 12px; align-items: center; font-size: 0.85rem; opacity: 0.85; margin-top: 4px; }
.swatch { width: 12px; height: 12px; border-radius: 4px; border: 1px solid #ddd; display: inline-block; margin-right: 6px; }
.swatch.green { background: rgba(var(--ok), 0.28); border-color: rgba(var(--ok), 0.65); }
.swatch.red { background: rgba(var(--bad), 0.22); border-color: rgba(var(--bad), 0.6); }
.swatch.white { background: rgba(255,255,255,0.75); }

.cta {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(2,6,23,0.45);
  background: linear-gradient(180deg, rgba(2,6,23,0.86), rgba(2,6,23,0.96));
  color: white;
  backdrop-filter: blur(6px);
}
.cta:hover { filter: brightness(1.05); }
.cta:disabled { opacity: 0.45; cursor: not-allowed; }

.error { color: #b00020; }
.fineprint { font-size: 0.85rem; color: var(--fg-soft); }

/* Style the embedded guest form as a glass panel */
:deep(.guest-form) {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(10px);
  color: var(--fg);
}
:deep(.guest-form .row) { gap: 10px; }
:deep(.guest-form input), :deep(.guest-form textarea), :deep(.guest-form select) {
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.6);
  padding: 8px 10px;
  color: var(--fg);
}
:deep(.guest-form .error) {
  color: #b00020;
  padding: 8px 10px;
  border: 1px solid #ffd0d0;
  background: rgba(255, 240, 240, 0.7);
  border-radius: 10px;
}
</style>
