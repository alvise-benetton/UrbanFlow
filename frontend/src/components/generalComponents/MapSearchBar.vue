<script setup>
import { computed, inject, ref, watch } from "vue";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { CalendarDaysIcon, ExclamationTriangleIcon, MapPinIcon } from "@heroicons/vue/20/solid";
import router from "../utility/router";

defineProps({
  showInlineSuggestions: { type: Boolean, default: false },
});

const appSection = defineModel("appSection");
const searchTerm = defineModel("searchTerm");

const zones = defineModel("zones");
const events = defineModel("events");
const misurazioni = inject("listaMisurazioni", ref([]));

const activeIndex = ref(-1);

const txt = ref("un evento o una zona");
watch(appSection, (newValue) => {
  if (newValue == "Eventi") {
    txt.value = "un evento";
  } else if (newValue == "Zone") {
    txt.value = "una zona";
  } else {
    txt.value = "un evento o una zona";
  }
});

const normalizedQuery = computed(() => (searchTerm.value || "").toLowerCase().trim());

const matchedZones = computed(() => {
  if (!normalizedQuery.value || !Array.isArray(zones.value)) return [];
  return zones.value.filter(
    (z) => z.name && z.name.toLowerCase().includes(normalizedQuery.value)
  );
});

const matchedEvents = computed(() => {
  if (!normalizedQuery.value || !Array.isArray(events.value)) return [];
  return events.value.filter(
    (e) => e.title && e.title.toLowerCase().includes(normalizedQuery.value)
  );
});

const combinedResults = computed(() => [
  ...matchedZones.value.map((z) => ({ path: `/Zone/${z._id}` })),
  ...matchedEvents.value.map((e) => ({ path: `/Eventi/${e._id}` })),
]);

watch(normalizedQuery, () => {
  activeIndex.value = -1;
});

function moveActive(delta) {
  const len = combinedResults.value.length;
  if (len === 0) return;
  if (activeIndex.value === -1) {
    activeIndex.value = delta > 0 ? 0 : len - 1;
  } else {
    activeIndex.value = (activeIndex.value + delta + len) % len;
  }
}

function selectActive() {
  if (activeIndex.value >= 0 && combinedResults.value[activeIndex.value]) {
    selectResult(combinedResults.value[activeIndex.value].path);
  }
}

function getZoneDensity(zoneId) {
  const m = (misurazioni?.value || []).find((item) => String(item.zone) === String(zoneId));
  return m?.data?.[0]?.density ?? null;
}

function isZoneAlert(zone) {
  const d = getZoneDensity(zone._id);
  return d != null && zone.threshold && d > zone.threshold;
}

function isEventLive(ev) {
  if (!ev?.startDate || !ev?.endDate) return false;
  const now = new Date();
  return new Date(ev.startDate) <= now && now <= new Date(ev.endDate);
}

function formatEventDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function selectResult(path) {
  searchTerm.value = "";
  activeIndex.value = -1;
  router.push(path);
}
</script>

<template>
  <div class="w-full">
    <label
      class="w-full h-11 md:h-[46px] flex items-center gap-2.5 bg-base-100/95 md:bg-base-100 focus-within:bg-base-100 backdrop-blur-2xl md:backdrop-blur-none rounded-2xl border border-base-300/70 md:border-base-300/60 uf-apple-control-shadow md:shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all px-3.5"
      id="searchBar"
    >
      <MagnifyingGlassIcon class="size-4 text-base-content/55 shrink-0" />
      <input
        type="text"
        class="grow min-w-0 text-base md:text-sm bg-transparent outline-none"
        :placeholder="'Cerca ' + txt"
        v-model="searchTerm"
        @keydown.esc="searchTerm = ''"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter.prevent="selectActive()"
      />
      <button
        v-if="searchTerm"
        type="button"
        class="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
        aria-label="Svuota ricerca"
        @click="searchTerm = ''"
      >
        <XMarkIcon class="size-4" />
      </button>
    </label>

    <!-- Suggerimenti stile "Trova nei dintorni" quando il drawer Cerca su desktop è aperto -->
    <div
      v-if="showInlineSuggestions && !normalizedQuery"
      class="flex flex-col gap-2 mt-4"
    >
      <p class="text-xs font-semibold text-base-content/60 px-0.5">Esplora rapidamente</p>
      <button
        type="button"
        class="w-full min-h-[50px] px-3.5 rounded-2xl bg-base-100 hover:bg-base-200/70 transition-colors flex items-center gap-3 shadow-sm text-left"
        @click="router.push('/Zone')"
      >
        <span class="w-8 h-8 rounded-full bg-primary text-white inline-flex items-center justify-center shrink-0">
          <MapPinIcon class="size-4" />
        </span>
        <span class="font-medium text-sm flex-1">Tutte le zone</span>
        <span class="text-xs text-base-content/55 tabular-nums">{{ (zones || []).length }}</span>
      </button>
      <button
        type="button"
        class="w-full min-h-[50px] px-3.5 rounded-2xl bg-base-100 hover:bg-base-200/70 transition-colors flex items-center gap-3 shadow-sm text-left"
        @click="router.push('/Eventi')"
      >
        <span class="w-8 h-8 rounded-full bg-accent text-accent-content inline-flex items-center justify-center shrink-0">
          <CalendarDaysIcon class="size-4" />
        </span>
        <span class="font-medium text-sm flex-1">Tutti gli eventi</span>
        <span class="text-xs text-base-content/55 tabular-nums">{{ (events || []).length }}</span>
      </button>
    </div>

    <div
      v-if="normalizedQuery && appSection === 'Mappa'"
      class="w-full max-h-[50dvh] md:max-h-none overflow-y-auto overscroll-contain flex flex-col gap-3 bg-base-100/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none p-3.5 md:p-0 md:pt-4 rounded-2xl md:rounded-none mt-2 md:mt-0 uf-apple-control-shadow md:shadow-none border md:border-0 border-base-300/70"
    >
      <p class="text-xs text-base-content/70">Risultati per: "{{ searchTerm.trim() }}"</p>

      <div v-if="matchedZones.length > 0" class="flex flex-col gap-2">
        <h3 class="font-semibold text-xs text-base-content/60 px-0.5">Zone</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="(zone, idx) in matchedZones"
            :key="zone._id"
            type="button"
            class="min-h-[50px] px-3.5 py-2.5 rounded-2xl bg-base-100 hover:bg-base-200/70 transition-colors shadow-sm w-full flex items-center justify-between text-left"
            :class="{ 'ring-2 ring-primary': activeIndex === idx }"
            @click="selectResult(`/Zone/${zone._id}`)"
          >
            <span class="truncate font-medium text-sm">{{ zone.name }}</span>
            <span v-if="getZoneDensity(zone._id) !== null" class="flex items-center gap-1.5 shrink-0">
              <span class="badge badge-sm tabular-nums">{{ getZoneDensity(zone._id) }}</span>
              <span v-if="isZoneAlert(zone)" class="badge badge-error badge-sm text-white">
                <ExclamationTriangleIcon class="size-3.5" />
              </span>
            </span>
          </button>
        </div>
      </div>

      <div v-if="matchedEvents.length > 0" class="flex flex-col gap-2">
        <h3 class="font-semibold text-xs text-base-content/60 px-0.5">Eventi</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="(event, idx) in matchedEvents"
            :key="event._id"
            type="button"
            class="min-h-[50px] px-3.5 py-2.5 rounded-2xl bg-base-100 hover:bg-base-200/70 transition-colors shadow-sm w-full flex items-center justify-between text-left"
            :class="{ 'ring-2 ring-primary': activeIndex === matchedZones.length + idx }"
            @click="selectResult(`/Eventi/${event._id}`)"
          >
            <span class="truncate font-medium text-sm">{{ event.title }}</span>
            <span v-if="isEventLive(event)" class="badge badge-error badge-xs text-white font-semibold shrink-0">
              In corso
            </span>
            <span v-else class="text-xs text-base-content/60 tabular-nums shrink-0">
              {{ formatEventDate(event.startDate) }}
            </span>
          </button>
        </div>
      </div>

      <p
        v-if="matchedZones.length === 0 && matchedEvents.length === 0"
        class="text-sm text-base-content/60 text-center py-3"
      >
        Nessuna zona o evento trovato
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
