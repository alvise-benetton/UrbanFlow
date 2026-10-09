<script setup>
import { computed, inject, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";
import ChartSmallMirror from "./ChartSmallMirror.vue";

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const route = useRoute();

const listaZone = inject("listaZone", ref([]));
const misurazioni = inject("listaMisurazioni", ref([]));
const eventi = inject("listaEventi", ref([]));
const notyf = inject("notyf");

const zoneId = computed(() => {
  return props.id || route.params.id || route.path.slice(1).split("/")[1] || null;
});

const currentZone = computed(() => {
  if (!listaZone?.value || !zoneId.value) return null;
  return listaZone.value.find((z) => String(z._id) === String(zoneId.value)) || null;
});

const localThreshold = ref(100);
const isEditing = ref(false);
const isSaving = ref(false);

watch(
  currentZone,
  (newZone) => {
    if (newZone) {
      localThreshold.value = newZone.threshold || 100;
      isEditing.value = false;
    }
  },
  { immediate: true }
);

const currentDensity = computed(() => {
  if (!currentZone.value || !misurazioni.value) return 0;
  const m = misurazioni.value.find((item) => String(item.zone) === String(currentZone.value._id));
  return m?.data?.[0]?.density ?? 0;
});

const saturationPercent = computed(() => {
  const t = localThreshold.value;
  if (!t || t <= 0) return 0;
  return Math.round((currentDensity.value / t) * 100);
});

const isAlert = computed(() => {
  return currentDensity.value > localThreshold.value;
});

const overThresholdPercent = computed(() => {
  return Math.max(0, saturationPercent.value - 100);
});

// Eventi attivi in questa specifica zona
const activeZoneEvents = computed(() => {
  if (!eventi.value || !currentZone.value) return [];
  const now = new Date();
  return eventi.value.filter((ev) => {
    const isMatchingZone = Array.isArray(ev.zones) && ev.zones.some((z) => z && String(z._id || z) === String(currentZone.value._id));
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    return isMatchingZone && s <= now && e >= now;
  });
});

async function saveThreshold() {
  if (!currentZone.value) return;
  try {
    isSaving.value = true;
    const response = await authFetch(`${API_URL}/api/zones/${currentZone.value._id}`, {
      method: "PUT",
      headers: {
        "x-access-token": localStorage.getItem("JWT"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threshold: Number(localThreshold.value) }),
    });

    if (!response.ok) {
      throw new Error("Errore durante l'aggiornamento della soglia");
    }

    currentZone.value.threshold = Number(localThreshold.value);
    isEditing.value = false;
    if (notyf) notyf.success("Soglia di sicurezza aggiornata con successo");
  } catch (err) {
    if (notyf) notyf.error(err.message);
  } finally {
    isSaving.value = false;
  }
}

function cancelEdit() {
  if (currentZone.value) {
    localThreshold.value = currentZone.value.threshold || 100;
  }
  isEditing.value = false;
}

function acknowledgeAlert() {
  if (notyf && currentZone.value) {
    notyf.success(`Allerta per ${currentZone.value.name} registrata e notificata alla sala operativa.`);
  }
}
</script>

<template>
  <div v-if="currentZone" class="flex flex-col gap-4 w-full">
    <!-- Header Zona -->
    <div class="flex items-center justify-between pb-3 border-b border-base-300">
      <div>
        <h2 class="text-lg font-bold text-base-content leading-tight">{{ currentZone.name }}</h2>
        <span class="text-xs text-gray-500 font-mono">ID Settore: {{ currentZone._id }}</span>
      </div>

      <span
        v-if="isAlert"
        class="badge badge-error text-white font-bold gap-1 text-xs py-3 px-2.5 animate-pulse"
      >
        <ExclamationTriangleIcon class="size-4" />
        ALLERTA
      </span>
      <span
        v-else
        class="badge badge-success text-white font-semibold text-xs py-3 px-2.5"
      >
        REGOLARE
      </span>
    </div>

    <!-- Griglia KPI (3 Colonne) -->
    <div class="grid grid-cols-3 gap-2">
      <!-- KPI 1: Densità Rilevata -->
      <div class="bg-base-200/70 border border-base-300 rounded-xl p-3 flex flex-col items-center text-center">
        <span class="text-[10px] uppercase font-bold text-gray-400">Rilevati</span>
        <span class="text-xl font-bold font-mono text-base-content mt-0.5">
          {{ currentDensity }}
        </span>
        <span class="text-[10px] text-gray-500">pedoni/m²</span>
      </div>

      <!-- KPI 2: Soglia Attuale -->
      <div class="bg-base-200/70 border border-base-300 rounded-xl p-3 flex flex-col items-center text-center">
        <span class="text-[10px] uppercase font-bold text-gray-400">Soglia Max</span>
        <span class="text-xl font-bold font-mono text-base-content mt-0.5">
          {{ currentZone.threshold }}
        </span>
        <span class="text-[10px] text-gray-500">limite</span>
      </div>

      <!-- KPI 3: Saturazione Capacità -->
      <div class="bg-base-200/70 border border-base-300 rounded-xl p-3 flex flex-col items-center text-center">
        <span class="text-[10px] uppercase font-bold text-gray-400">Saturazione</span>
        <span
          class="text-xl font-bold font-mono mt-0.5"
          :class="isAlert ? 'text-error' : saturationPercent > 70 ? 'text-warning' : 'text-success'"
        >
          {{ saturationPercent }}%
        </span>
        <span class="text-[10px] text-gray-500">capacità</span>
      </div>
    </div>

    <!-- Banner Critico Allerta (se attivo) -->
    <div
      v-if="isAlert"
      class="bg-error/15 border border-error/40 text-error-content rounded-xl p-4 flex flex-col gap-2.5"
    >
      <div class="flex items-center gap-2">
        <ExclamationTriangleIcon class="size-5 text-error shrink-0" />
        <span class="font-bold text-xs text-error">
          Soglia superata del +{{ overThresholdPercent }}%
        </span>
      </div>
      <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
        L'affluenza istantanea supera la capacità massima consentita per {{ currentZone.name }}.
      </p>
      <button
        class="btn btn-sm btn-error text-white font-bold w-full shadow-sm"
        @click="acknowledgeAlert"
      >
        Protocolla Presa in Carico
      </button>
    </div>

    <!-- Editor Rapido Soglia di Sicurezza -->
    <div class="bg-base-200/60 border border-base-300 rounded-xl p-3.5 flex flex-col gap-2.5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-base-content">Regola Soglia di Sicurezza</span>
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="btn btn-ghost btn-xs text-primary gap-1"
        >
          <PencilIcon class="size-3" />
          <span>Modifica</span>
        </button>
      </div>

      <div v-if="isEditing" class="flex flex-col gap-2.5 pt-1">
        <div class="flex items-center gap-3">
          <input
            type="range"
            min="20"
            max="300"
            step="5"
            v-model="localThreshold"
            class="range range-xs range-primary flex-1"
          />
          <span class="font-mono font-bold text-sm text-primary w-12 text-right">
            {{ localThreshold }}
          </span>
        </div>

        <div class="flex justify-between items-center text-[11px] text-gray-500 font-mono">
          <span>Nuova saturazione stimata:</span>
          <span :class="currentDensity > localThreshold ? 'text-error font-bold' : 'text-success font-bold'">
            {{ Math.round((currentDensity / localThreshold) * 100) }}%
          </span>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            class="btn btn-xs btn-ghost"
            @click="cancelEdit"
            :disabled="isSaving"
          >
            Annulla
          </button>
          <button
            class="btn btn-xs btn-primary text-white gap-1"
            @click="saveThreshold"
            :disabled="isSaving || Number(localThreshold) === Number(currentZone.threshold)"
          >
            <CheckIcon class="size-3" />
            <span>{{ isSaving ? 'Salvataggio...' : 'Conferma' }}</span>
          </button>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500">
        Limite attuale: <strong class="text-base-content font-mono">{{ currentZone.threshold }}</strong> pedoni.
      </div>
    </div>

    <!-- Grafico Storico Temporale (Ultime 24h) -->
    <div class="flex flex-col gap-1.5">
      <ChartSmallMirror v-model:zone="currentZone" />
    </div>

    <!-- Eventi Associati alla Zona -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1.5 text-xs font-bold text-base-content">
        <CalendarDaysIcon class="size-4 text-primary" />
        <span>Eventi in Corso nel Settore</span>
      </div>

      <div v-if="activeZoneEvents.length > 0" class="flex flex-col gap-1.5">
        <div
          v-for="ev in activeZoneEvents"
          :key="ev._id"
          @click="router.push(`/Eventi/${ev._id}`)"
          class="p-2.5 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 cursor-pointer flex items-center justify-between text-xs"
        >
          <span class="font-semibold text-base-content">{{ ev.title }}</span>
          <span class="badge badge-info badge-xs text-white">Live</span>
        </div>
      </div>
      <div v-else class="text-[11px] text-gray-400 italic bg-base-200/40 p-2.5 rounded-lg text-center">
        Nessun evento culturale o pubblico programmato al momento in questo settore.
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center justify-center p-12 text-gray-400 text-xs">
    <span>Caricamento dati della zona in corso...</span>
  </div>
</template>

<style scoped>
</style>
