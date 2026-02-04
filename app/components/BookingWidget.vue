<script setup lang="ts">
import { computed, ref, watch } from "vue";
const props = defineProps<{ fixedRoomId?: number; compact?: boolean; closable?: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

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

// Room navigation for mobile/compact
const roomIndex = computed(() => Math.max(0, ROOMS.findIndex(r => r.id === roomId.value)));
function setRoomByIndex(idx: number) {
  if (!ROOMS.length) return;
  const i = (idx + ROOMS.length) % ROOMS.length;
  roomId.value = ROOMS[i].id;
}
function prevRoom() { setRoomByIndex(roomIndex.value - 1); }
function nextRoom() { setRoomByIndex(roomIndex.value + 1); }

// Steppers for guests
function incAdults() { if (guests.value < maxGuests.value) adults.value += 1; }
function decAdults() { if (adults.value > 1) adults.value -= 1; }
function incChildren() { if (guests.value < maxGuests.value) children.value += 1; }
function decChildren() { if (children.value > 0) children.value -= 1; }

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
const triedAutoJump = ref(false);
const totalPrice = computed(() => {
  if (!arrival.value || !departure.value) return { amount: 0, nights: 0, hasPrice: false };
  let sum = 0;
  let nights = 0;
  let hasAnyPrice = false;
  const cur = isoToLocalDate(arrival.value);
  const end = isoToLocalDate(departure.value);
  while (cur < end) {
    const iso = localDateToISO(cur);
    const d = dayObj(iso);
    if (d && d.price != null) { sum += Number(d.price); hasAnyPrice = true; }
    nights += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return { amount: sum, nights, hasPrice: hasAnyPrice };
});

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

    // If first load has no availability in current month, jump to first available month ahead
    if (!triedAutoJump.value) {
      const hasAvail = Array.isArray(res.days) && res.days.some(d => d.available);
      if (!hasAvail) {
        // look ahead up to 12 months
        const start = new Date(viewYear.value, viewMonth.value - 1, 1);
        for (let i = 1; i <= 12; i++) {
          const y = start.getFullYear() + Math.floor((start.getMonth() + i) / 12);
          const m = ((start.getMonth() + i) % 12) + 1;
          const mk = `${y}-${String(m).padStart(2, "0")}`;
          try {
            const ahead = await $fetch<{ days: Day[] }>("/api/beds24/room-dates", {
              query: { roomId: roomId.value, month: mk },
            });
            if (ahead.days && ahead.days.some(d => d.available)) {
              viewYear.value = y;
              viewMonth.value = m;
              days.value = ahead.days;
              break;
            }
          } catch {
            // ignore and continue
          }
        }
      }
      triedAutoJump.value = true;
    }
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
      <div class="flex items-center gap-2">
        <button class="clear" type="button" @click="clearDates" :disabled="!arrival && !departure">Clear</button>
        <button v-if="closable" class="close" type="button" @click="emit('close')" aria-label="Close">×</button>
      </div>
    </div>

    

    <div class="content-grid">
      <div class="left">
        <!-- Room switcher (all breakpoints) -->
        <div v-if="!isFixedRoom" class="room-switcher">
          <button type="button" class="switch" @click="prevRoom" aria-label="Previous room">‹</button>
          <div class="room-title">{{ selectedRoom.name }} · up to {{ selectedRoom.maxGuests }}</div>
          <button type="button" class="switch" @click="nextRoom" aria-label="Next room">›</button>
        </div>

        <!-- Guest steppers -->
        <div class="row">
          <div class="stepper">
            <div class="label">Adults</div>
            <div class="controls">
              <button type="button" class="step-btn" @click="decAdults">−</button>
              <div class="value">{{ adults }}</div>
              <button type="button" class="step-btn" @click="incAdults" :disabled="guests >= maxGuests">+</button>
            </div>
          </div>
          <div class="stepper">
            <div class="label">Children</div>
            <div class="controls">
              <button type="button" class="step-btn" @click="decChildren">−</button>
              <div class="value">{{ children }}</div>
              <button type="button" class="step-btn" @click="incChildren" :disabled="guests >= maxGuests">+</button>
            </div>
          </div>
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
            <div class="p">{{ '' }}</div>
          </template>
        </button>
      </div>

          <div class="legend">
            <span class="swatch green"></span> Selected stay
            <span class="swatch red"></span> Unavailable
            <span class="swatch white"></span> Available
          </div>
        </div>
      </div>

      <div class="summary">
        <div class="sum-card">
          <div class="sum-row"><span>Arrival</span><span>{{ arrival || '—' }}</span></div>
          <div class="sum-row"><span>Departure</span><span>{{ departure || '—' }}</span></div>
          <div class="sum-row"><span>Nights</span><span>{{ selectedNights || '—' }}</span></div>
          <div class="sum-row"><span>Guests</span><span>{{ guests }}</span></div>
          <div class="sum-total"><span>Total price</span><span>{{ totalPrice.hasPrice && selectedNights ? `€${totalPrice.amount.toFixed(0)}` : 'At checkout' }}</span></div>
        </div>

        <button class="cta" type="button" :disabled="!canBook" @click="goToPayment">Continue on Beds24</button>

        <div class="fineprint">Green = selected stay. Red = unavailable. White = available. Only valid arrival/departure options are clickable.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glassy compact widget */
.widget {
  /* palette tuned to site (sea blue + olive) */
  --fg: rgba(15, 23, 42, 0.92);          /* slate-900 with alpha */
  --fg-soft: rgba(15, 23, 42, 0.72);
  --bg: rgba(255, 255, 255, 0.38);
  --panel: rgba(255, 255, 255, 0.34);
  --border: rgba(2, 6, 23, 0.12);
  --shadow: rgba(2, 6, 23, 0.14);
  --ok: 101, 163, 13;                    /* lime-600 (olive-ish) */
  --bad: 239, 68, 68;                    /* red-500 */
  --accent: 30, 136, 229;                /* sea blue #1e88e5 */

  max-width: 860px;
  display: grid;
  gap: 16px;                              /* more breathing room */
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 10px 30px var(--shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--fg);
  font-family: "Lexend", sans-serif;
  font-optical-sizing: auto;
}

/* Compact variant */
.widget.compact {
  max-width: 860px;
  gap: 12px;
  padding: 12px;
  max-height: 85dvh;
  overflow: auto;
}
.widget.compact .title { font-size: 0.9rem; font-weight: 600; }
.widget.compact .times { font-size: 0.78rem; }
.widget.compact .cal-title { font-size: 0.9rem; }
.widget.compact .selected { padding: 8px; }
.widget.compact .grid { gap: 3px; }
.widget.compact .day { min-height: 40px; padding: 5px; }
.widget.compact .d { font-size: 0.9rem; }
.widget.compact .p { font-size: 0.75rem; }

.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 2px; }
.title { font-weight: 600; font-size: 0.95rem; color: rgb(var(--accent)); letter-spacing: 0.06em; }
.times { color: var(--fg-soft); font-size: 0.82rem; letter-spacing: 0.04em; }
.clear {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.5);
  padding: 6px 10px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  color: var(--fg);
  }
.clear:disabled { opacity: 0.45; cursor: not-allowed; }

.close { border: 1px solid var(--border); background: rgba(255,255,255,0.5); padding: 6px 10px; border-radius: 10px; }

.field { display: grid; gap: 6px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.calendar {
  display: grid; gap: 8px; padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  backdrop-filter: blur(10px);
}
.cal-header { display: grid; grid-template-columns: 34px 1fr 34px; align-items: center; }
.cal-title { text-align: center; font-weight: 600; font-size: 0.9rem; color: var(--fg); letter-spacing: 0.04em; }

.controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.selected {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255,255,255,0.52);
  color: var(--fg);
}
.muted { color: var(--fg-soft); font-size: 0.82rem; letter-spacing: 0.03em; }

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

.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.dow { text-align: center; font-size: 0.78rem; color: var(--fg-soft); letter-spacing: 0.03em; }

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
.day.start, .day.end { background: rgba(var(--ok), 0.28); border-color: rgba(var(--ok), 0.65); box-shadow: 0 0 0 1px rgba(var(--ok), 0.25) inset; }

.d { font-weight: 600; font-size: 0.92rem; color: var(--fg); letter-spacing: 0.02em; }
.p { font-size: 0.78rem; color: var(--fg-soft); }

.legend { display: flex; gap: 12px; align-items: center; font-size: 0.82rem; opacity: 0.9; margin-top: 4px; }
.swatch { width: 12px; height: 12px; border-radius: 4px; border: 1px solid #ddd; display: inline-block; margin-right: 6px; }
.swatch.green { background: rgba(var(--ok), 0.28); border-color: rgba(var(--ok), 0.65); }
.swatch.red { background: rgba(var(--bad), 0.22); border-color: rgba(var(--bad), 0.6); }
.swatch.white { background: rgba(255,255,255,0.75); }

.cta {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(var(--ok), 0.55);
  background: linear-gradient(180deg, rgba(var(--ok), 0.92), rgba(var(--ok), 0.98));
  color: white;
  backdrop-filter: blur(6px);
  font-weight: 600;
}
.cta:hover { filter: brightness(1.03); }
.cta:disabled { opacity: 0.45; cursor: not-allowed; }

.error { color: #b00020; }
.fineprint { font-size: 0.8rem; color: var(--fg-soft); letter-spacing: 0.03em; }

/* Two-column content */
.content-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 768px) {
  .content-grid { grid-template-columns: 5fr 4fr; align-items: start; }
}
.summary { display: grid; gap: 12px; }
.sum-card { display: grid; gap: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.6); border-radius: 12px; padding: 10px; backdrop-filter: blur(10px); }
.sum-row { display: flex; justify-content: space-between; font-size: 0.9rem; letter-spacing: 0.02em; }
.sum-total { display: flex; justify-content: space-between; font-weight: 700; padding-top: 6px; border-top: 1px dashed var(--border); }

/* Mobile room switcher */
.room-switcher { display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 8px; margin-bottom: 6px; }
.room-switcher .switch { height: 36px; width: 36px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.6); }
.room-switcher .room-title { font-weight: 600; font-size: 0.9rem; color: var(--fg); text-align: center; letter-spacing: 0.03em; }

/* Steppers */
.stepper { display: grid; grid-template-columns: 1fr; gap: 6px; }
.stepper .label { font-size: 0.88rem; color: var(--fg-soft); letter-spacing: 0.03em; }
.stepper .controls { display: grid; grid-template-columns: 36px 1fr 36px; align-items: center; gap: 6px; }
.stepper .step-btn { height: 36px; width: 36px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.6); }
.stepper .value { text-align: center; font-weight: 600; letter-spacing: 0.02em; }

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
