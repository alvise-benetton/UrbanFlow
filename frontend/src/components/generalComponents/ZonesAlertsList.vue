<script setup>
import { computed, inject, ref } from "vue";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/vue/20/solid";
import router from "../utility/router";

const id = defineModel("id");
const searchTerm = defineModel("searchTerm", { default: "" });

const zonesList = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));

const activeFilter = ref("tutte"); // "tutte", "allerte", "stabili"

function getMisurazione(zoneId) {
  if (!listaMisurazioni?.value) return null;
  const ris = listaMisurazioni.value.filter((val) => String(val.zone) === String(zoneId));
  return ris && ris.length > 0 ? ris : null;
}

function getDensity(zoneId) {
  const m = getMisurazione(zoneId);
  return m?.[0]?.data?.[0]?.density ?? 0;
}

function getSaturationPercent(zone) {
  const density = getDensity(zone._id);
  if (!zone.threshold || zone.threshold <= 0) return 0;
  return Math.round((density / zone.threshold) * 100);
}

function getOverThresholdPercent(zone) {
  const sat = getSaturationPercent(zone);
  return Math.max(0, sat - 100);
}

const enrichedZones = computed(() => {
  if (!zonesList?.value) return [];
  return zonesList.value.map((z) => {
    const density = getDensity(z._id);
    const threshold = z.threshold || 100;
    const saturation = getSaturationPercent(z);
    const isAlert = density > threshold;
    return {
      ...z,
      density,
      threshold,
      saturation,
      isAlert,
    };
  });
});

const alertCount = computed(() => {
  return enrichedZones.value.filter((z) => z.isAlert).length;
});

const filteredZones = computed(() => {
  let list = enrichedZones.value;

  // Filtro per tab
  if (activeFilter.value === "allerte") {
    list = list.filter((z) => z.isAlert);
  } else if (activeFilter.value === "stabili") {
    list = list.filter((z) => !z.isAlert);
  }

  // Filtro per ricerca
  if (searchTerm.value && searchTerm.value.trim() !== "") {
    const terms = searchTerm.value.toLowerCase().trim().split(" ");
    list = list.filter((z) => {
      return terms.every((t) => (z.name || "").toLowerCase().includes(t));
    });
  }

  // Ordina: prima le zone in allerta, poi per saturazione decrescente
  return [...list].sort((a, b) => {
    if (a.isAlert && !b.isAlert) return -1;
    if (!a.isAlert && b.isAlert) return 1;
    return b.saturation - a.saturation;
  });
});

function goToZone(zoneId) {
  id.value = zoneId;
  router.push(`/Zone/${zoneId}`);
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <!-- Selettore Filtri Rapidi -->
    <div class="join w-full bg-base-200 p-0.5 rounded-lg border border-base-300">
      <button
        class="join-item flex-1 btn btn-xs font-semibold"
        :class="activeFilter === 'tutte' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
        @click="activeFilter = 'tutte'"
      >
        Tutte ({{ enrichedZones.length }})
      </button>
      <button
        class="join-item flex-1 btn btn-xs font-semibold gap-1"
        :class="activeFilter === 'allerte' ? 'btn-error text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
        @click="activeFilter = 'allerte'"
      >
        <ExclamationTriangleIcon class="size-3" />
        <span>Allerte ({{ alertCount }})</span>
      </button>
      <button
        class="join-item flex-1 btn btn-xs font-semibold"
        :class="activeFilter === 'stabili' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
        @click="activeFilter = 'stabili'"
      >
        Stabili ({{ enrichedZones.length - alertCount }})
      </button>
    </div>

    <!-- Lista Schede Zone -->
    <div class="flex flex-col gap-2.5">
      <div
        v-for="zone in filteredZones"
        :key="zone._id"
        @click="goToZone(zone._id)"
        class="group p-3 rounded-xl border transition-all cursor-pointer bg-base-100 hover:bg-base-200/80 shadow-sm"
        :class="zone.isAlert ? 'border-error/40 bg-error/5 hover:border-error' : 'border-base-300 hover:border-primary/50'"
      >
        <!-- Riga Superiore: Nome e Badge di Stato -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
            {{ zone.name }}
          </span>

          <span
            v-if="zone.isAlert"
            class="badge badge-error badge-sm text-white font-bold gap-1 text-[11px] shrink-0"
          >
            <ExclamationTriangleIcon class="size-3" />
            +{{ getOverThresholdPercent(zone) }}%
          </span>
          <span
            v-else
            class="badge badge-sm font-semibold text-[11px] shrink-0"
            :class="zone.saturation > 70 ? 'badge-warning text-warning-content' : 'badge-ghost text-gray-500'"
          >
            {{ zone.saturation }}%
          </span>
        </div>

        <!-- Barra di Progresso / Saturazione Capacità -->
        <div class="w-full mb-2">
          <div class="h-2 w-full bg-base-300 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500 rounded-full"
              :style="{ width: `${Math.min(100, zone.saturation)}%` }"
              :class="{
                'bg-error': zone.saturation > 100,
                'bg-warning': zone.saturation > 70 && zone.saturation <= 100,
                'bg-success': zone.saturation <= 70,
              }"
            ></div>
          </div>
        </div>

        <!-- Riga Inferiore: Metriche e Valori -->
        <div class="flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>
            Rilevati: <strong class="text-base-content">{{ zone.density }}</strong> pedoni
          </span>
          <span>
            Limite: <strong class="text-base-content">{{ zone.threshold }}</strong>
          </span>
        </div>
      </div>

      <!-- Nessun risultato -->
      <div v-if="filteredZones.length === 0" class="text-center py-10 text-gray-400 text-xs flex flex-col items-center gap-2">
        <CheckCircleIcon class="size-8 opacity-40 text-success" />
        <span>Nessuna zona corrisponde ai filtri impostati</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
