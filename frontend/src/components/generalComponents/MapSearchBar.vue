<script setup>
import { computed, inject, ref, watch } from "vue";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import router from "../utility/router";

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
  <div class="w-full md:w-80 lg:w-96">
    <label
      class="w-full h-11 md:h-12 flex items-center gap-2 bg-base-100 rounded-box border border-base-300 uf-panel-shadow focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow px-3.5"
      id="searchBar"
    >
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
      <MagnifyingGlassIcon v-else class="size-5 text-base-content/60 shrink-0" />
    </label>

    <div
      v-if="normalizedQuery && appSection === 'Mappa'"
      class="w-full max-h-[55dvh] md:max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-3 bg-base-200 p-4 rounded-box mt-3 uf-panel-shadow border border-base-300"
    >
      <p class="text-xs text-base-content/70">Risultati per: "{{ searchTerm.trim() }}"</p>

      <div v-if="matchedZones.length > 0" class="flex flex-col gap-2">
        <h3 class="font-bold text-sm">Zone</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="(zone, idx) in matchedZones"
            :key="zone._id"
            type="button"
            class="btn bg-base-100 border border-base-300/70 w-full flex justify-between text-left min-h-11"
            :class="{ 'ring-2 ring-primary': activeIndex === idx }"
            @click="selectResult(`/Zone/${zone._id}`)"
          >
            <span class="truncate">{{ zone.name }}</span>
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
        <h3 class="font-bold text-sm">Eventi</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="(event, idx) in matchedEvents"
            :key="event._id"
            type="button"
            class="btn bg-base-100 border border-base-300/70 w-full flex justify-between text-left min-h-11"
            :class="{ 'ring-2 ring-primary': activeIndex === matchedZones.length + idx }"
            @click="selectResult(`/Eventi/${event._id}`)"
          >
            <span class="truncate">{{ event.title }}</span>
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
