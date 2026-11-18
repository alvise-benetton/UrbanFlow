<script setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { inject, reactive, ref, watch, computed } from "vue";
import ZoneDialog from "./ZoneDialog.vue";
import router from "../utility/router";

const inFocus = reactive({
  zones: true,
  alerts: false,
});

const id = defineModel("id");
const zonesList = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));
const isLoading = inject("isLoading", ref(false));
const zoneTabFocus = inject("zoneTabFocus", ref("zones"));
const selectedZone = ref(zonesList?.value ? zonesList.value.find((z) => z._id === id.value) : null);

const searchTerm = defineModel("searchTerm");
const sortBy = ref("name");

const filteredZones = computed(() => {
  if (!zonesList?.value) return [];
  let list = zonesList.value;
  if (searchTerm.value) {
    const words = searchTerm.value.toLowerCase().trim().split(/\s+/);
    list = list.filter((z) =>
      words.every((word) => (z.name || "").toLowerCase().includes(word))
    );
  }
  const copy = [...list];
  if (sortBy.value === "density") {
    return copy.sort((a, b) => (getDensity(b._id) ?? -1) - (getDensity(a._id) ?? -1));
  }
  if (sortBy.value === "ratio") {
    return copy.sort((a, b) => {
      const ra = a.threshold ? (getDensity(a._id) ?? 0) / a.threshold : 0;
      const rb = b.threshold ? (getDensity(b._id) ?? 0) / b.threshold : 0;
      return rb - ra;
    });
  }
  return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
});

const alertList = computed(() => {
  if (!zonesList?.value || !listaMisurazioni?.value) return [];
  return zonesList.value.filter((z) => {
    const density = getDensity(z._id);
    return density != null && z.threshold && density > z.threshold;
  });
});

watch([zonesList, id], () => {
  selectedZone.value = zonesList?.value ? zonesList.value.find((z) => z._id === id.value) : null;
});

function getMisurazione(zoneId) {
  if (!listaMisurazioni?.value) return null;
  const ris = listaMisurazioni.value.filter((val) => val.zone == zoneId);
  if (!ris || ris.length === 0) return null;
  return ris;
}

function getDensity(zoneId) {
  const m = getMisurazione(zoneId);
  return m?.[0]?.data?.[0]?.density ?? null;
}

function getOverThresholdPercent(zone) {
  const density = getDensity(zone._id);
  if (density == null || !zone.threshold) return 0;
  return Math.floor((density / zone.threshold) * 100 - 100);
}

function getPressurePercent(zone) {
  const d = getDensity(zone._id);
  if (d == null || !zone.threshold) return 0;
  return Math.min(100, Math.max(4, Math.round((d / zone.threshold) * 100)));
}

function getPressureClass(zone) {
  const d = getDensity(zone._id);
  if (d == null || !zone.threshold) return "bg-base-300";
  const ratio = d / zone.threshold;
  if (ratio > 1) return "bg-error";
  if (ratio > 0.7) return "bg-warning";
  return "bg-success";
}

function goToZone(urlId) {
  router.push(`/Zone/${urlId}`);
}

const changeFocusedList = (z, a) => {
  inFocus.zones = z;
  inFocus.alerts = a;
};

watch(
  zoneTabFocus,
  (focus) => {
    if (focus === "alerts") {
      changeFocusedList(false, true);
      zoneTabFocus.value = "zones";
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="w-full flex flex-col md:h-full md:min-h-0">
    <Transition name="card-fade" mode="out-in">
      <div
        v-if="!id"
        key="zones-list"
        class="flex flex-col [&>*]:shrink-0 gap-3 max-h-[50dvh] md:max-h-none md:flex-1 overflow-y-auto overscroll-contain pr-0.5"
      >
        <h2 class="hidden md:block text-xl font-bold tracking-tight">Zone</h2>
        <!-- Selettore Zone-Allerte -->
        <div
          class="grid grid-cols-2 gap-1 bg-base-200/80 rounded-xl p-1 border border-base-300/60 w-full"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="inFocus.zones"
            class="h-9 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors touch-manipulation"
            :class="
              inFocus.zones
                ? 'bg-neutral text-neutral-content shadow-sm'
                : 'text-base-content/70 hover:text-base-content'
            "
            @click="changeFocusedList(true, false)"
          >
            Zone
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="inFocus.alerts"
            class="h-9 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors touch-manipulation"
            :class="
              inFocus.alerts
                ? 'bg-neutral text-neutral-content shadow-sm'
                : 'text-base-content/70 hover:text-base-content'
            "
            @click="changeFocusedList(false, true)"
          >
            <span>Allerte</span>
            <span
              v-if="alertList.length > 0"
              class="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-error text-white text-xs font-bold leading-none inline-flex items-center justify-center tabular-nums"
            >
              {{ alertList.length }}
            </span>
          </button>
        </div>

        <!-- Ordinamento rapido zone -->
        <div
          v-if="inFocus.zones && !isLoading && zonesList.length > 0"
          class="flex items-center justify-between gap-2 text-xs"
        >
          <span class="text-base-content/60 shrink-0">Ordina:</span>
          <div class="inline-grid grid-cols-3 gap-1 bg-base-200/80 rounded-lg p-1 border border-base-300/60">
            <button
              type="button"
              class="h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center justify-center transition-colors"
              :class="sortBy === 'name' ? 'bg-primary text-white' : 'text-base-content/70 hover:text-base-content'"
              @click="sortBy = 'name'"
            >
              A-Z
            </button>
            <button
              type="button"
              class="h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center justify-center transition-colors whitespace-nowrap"
              :class="sortBy === 'density' ? 'bg-primary text-white' : 'text-base-content/70 hover:text-base-content'"
              @click="sortBy = 'density'"
            >
              Densità ↓
            </button>
            <button
              type="button"
              class="h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center justify-center transition-colors whitespace-nowrap"
              :class="sortBy === 'ratio' ? 'bg-primary text-white' : 'text-base-content/70 hover:text-base-content'"
              @click="sortBy = 'ratio'"
            >
              Criticità %
            </button>
          </div>
        </div>

        <!-- Skeleton caricamento -->
        <div v-if="isLoading && zonesList.length === 0" class="flex flex-col gap-2.5">
          <div v-for="n in 4" :key="n" class="skeleton h-11 w-full rounded-btn"></div>
        </div>

        <!-- Lista zone -->
        <div v-else-if="inFocus.zones && filteredZones.length > 0" class="flex flex-col gap-2">
          <button
            v-for="zone in filteredZones"
            :key="zone._id"
            type="button"
            class="btn h-auto min-h-[50px] py-2.5 px-3.5 bg-base-100 hover:bg-base-100/90 border border-base-300/60 rounded-2xl shadow-sm w-full flex items-center justify-between gap-2.5 touch-manipulation"
            @click="goToZone(zone._id)"
          >
            <div class="flex flex-col flex-1 min-w-0 gap-1.5 text-left">
              <div class="flex items-center justify-between gap-2">
                <span class="truncate font-medium text-sm">{{ zone.name }}</span>
                <span
                  v-if="getDensity(zone._id) !== null"
                  class="text-xs tabular-nums text-base-content/70 shrink-0"
                >
                  {{ getDensity(zone._id) }}/{{ zone.threshold || "—" }}
                </span>
              </div>
              <div
                v-if="getDensity(zone._id) !== null"
                class="h-1 w-full rounded-full bg-base-300 overflow-hidden"
              >
                <div
                  class="h-full rounded-full"
                  :class="getPressureClass(zone)"
                  :style="{ width: getPressurePercent(zone) + '%' }"
                ></div>
              </div>
            </div>
            <span
              v-if="getDensity(zone._id) !== null && getDensity(zone._id) > zone.threshold"
              class="badge h-auto py-1 px-2 badge-error text-white shrink-0"
            >
              <ExclamationTriangleIcon class="size-3.5" />
            </span>
          </button>
        </div>
        <p
          v-else-if="inFocus.zones"
          class="text-sm text-base-content/60 text-center py-4"
        >
          Nessuna zona trovata
        </p>

        <!-- Lista allerte -->
        <div v-if="inFocus.alerts" class="flex flex-col gap-2">
          <small class="text-base-content/70">In tempo reale:</small>

          <template v-if="alertList.length > 0">
            <button
              v-for="zone in alertList"
              :key="zone._id"
              type="button"
              class="btn h-auto min-h-[50px] py-2.5 px-3.5 rounded-2xl shadow-sm btn-error text-white w-full flex justify-between touch-manipulation"
              @click="goToZone(zone._id)"
            >
              <span class="truncate text-left">{{ zone.name }}</span>

              <div class="flex gap-2 shrink-0 items-center tabular-nums">
                <div class="badge h-auto py-1 px-2.5 bg-black/20 border-none text-white font-semibold">
                  +{{ getOverThresholdPercent(zone) }}%
                </div>
                <ExclamationTriangleIcon class="size-4 shrink-0" />
              </div>
            </button>
          </template>
          <p v-else class="text-sm text-base-content/60 text-center py-4">
            Nessuna allerta attiva al momento
          </p>
        </div>
      </div>

      <ZoneDialog v-else :key="id" v-model:selectedZone="selectedZone" />
    </Transition>
  </div>
</template>

<style scoped>
.card-fade-enter-active {
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.16s ease-out;
}
.card-fade-leave-active {
  transition: transform 0.11s ease-in, opacity 0.11s ease-in;
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .card-fade-enter-active,
  .card-fade-leave-active {
    transition: none;
  }
}
</style>
