<script setup>
import {
  PencilIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";
import { computed, inject, nextTick, ref, watch } from "vue";
import router, { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";
import ChartSmallMirror from "./ChartSmallMirror.vue";

const zone = defineModel("selectedZone");
const misurazioni = inject("listaMisurazioni", ref([]));
const eventi = inject("listaEventi", ref([]));
const notyf = inject("notyf");
const loadZones = inject("loadZones", null);

const localZone = ref(zone.value ? { ...zone.value } : null);
const isEditing = ref(false);
const thresholdInput = ref(null);
const thresholdDialog = ref(null);

watch(
  zone,
  (newVal) => {
    if (newVal) {
      localZone.value = { ...newVal };
      isEditing.value = false;
    }
  },
  { deep: true }
);

const eventiAttuali = computed(() => {
  const now = new Date();
  return (eventi.value || []).filter((event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return startDate <= now && now <= endDate;
  });
});

const eventiZona = computed(() => {
  if (!localZone.value?._id || !eventiAttuali.value) return [];
  return eventiAttuali.value.filter(
    (ev) =>
      Array.isArray(ev.zones) &&
      ev.zones.some((z) => String(z?._id || z) === String(localZone.value._id))
  );
});

const currentDensity = computed(() => {
  if (!localZone.value?._id || !misurazioni?.value) return null;
  const m = misurazioni.value.find((item) => String(item.zone) === String(localZone.value._id));
  return m?.data?.[0]?.density ?? null;
});

const alert = computed(() => {
  if (currentDensity.value == null || !zone.value?.threshold) {
    return { active: false, increment_pcent: 0 };
  }
  return {
    active: currentDensity.value > zone.value.threshold,
    increment_pcent: Math.floor(
      ((currentDensity.value - zone.value.threshold) / zone.value.threshold) * 100
    ),
  };
});

const pressurePercent = computed(() => {
  if (currentDensity.value == null || !zone.value?.threshold) return 0;
  return Math.min(100, Math.max(4, Math.round((currentDensity.value / zone.value.threshold) * 100)));
});

const pressureBarClass = computed(() => {
  if (currentDensity.value == null || !zone.value?.threshold) return "bg-base-300";
  const ratio = currentDensity.value / zone.value.threshold;
  if (ratio > 1) return "bg-error";
  if (ratio > 0.7) return "bg-warning";
  return "bg-success";
});

function closeCard() {
  router.push("/Zone");
}

function startEditing() {
  isEditing.value = true;
  nextTick(() => {
    thresholdInput.value?.focus();
  });
}

function abortChanges() {
  isEditing.value = false;
  if (localZone.value && zone.value) {
    localZone.value.threshold = zone.value.threshold;
  }
}

async function saveChanges() {
  const numericThreshold = Number(localZone.value?.threshold);
  if (!Number.isFinite(numericThreshold) || numericThreshold <= 0) {
    notyf?.error("Inserisci un limite maggiore di 0");
    return;
  }

  try {
    const res = await authFetch(`${API_URL}/api/zones/${zone.value._id}`, {
      headers: {
        "x-access-token": localStorage.getItem("JWT"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threshold: numericThreshold }),
      method: "PUT",
    });

    if (!res.ok) {
      throw new Error("errore nel modificare la zona");
    }

    zone.value.threshold = numericThreshold;
    localZone.value.threshold = numericThreshold;
    if (loadZones) {
      await loadZones();
    }
    notyf?.success("Limite aggiornato con successo!");
    isEditing.value = false;
  } catch (err) {
    notyf?.error("Errore durante l'aggiornamento del limite");
  }
}

function reportAlert() {
  notyf?.success("Segnalazione inviata alla centrale operativa");
}
</script>

<template>
  <div>
    <div
      class="w-full md:w-80 lg:w-96 max-h-[58dvh] md:max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain flex flex-col [&>*]:shrink-0 bg-base-100 p-4 sm:p-5 rounded-box gap-3.5 uf-panel-shadow border border-base-300"
      v-if="localZone"
    >
      <!-- Header sticky con titolo e chiusura -->
      <div class="sticky top-0 bg-base-100 z-10 pb-2.5 border-b border-base-300 flex items-center justify-between gap-2">
        <span class="font-bold text-xl leading-tight card-title truncate">{{ localZone.name }}</span>
        <button
          type="button"
          class="btn btn-square btn-sm btn-ghost touch-manipulation shrink-0"
          aria-label="Chiudi scheda zona"
          @click="closeCard"
        >
          <XMarkIcon class="size-4" />
        </button>
      </div>

      <!-- Dato principale + stato + barra di pressione -->
      <div class="flex flex-col gap-2">
        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <div class="flex items-baseline gap-1.5 tabular-nums">
            <span class="text-3xl font-bold tracking-tight">
              {{ currentDensity !== null ? currentDensity : "--" }}
            </span>
            <span class="text-sm text-base-content/60">pedoni</span>
          </div>
          <span
            v-if="alert.active"
            class="badge h-auto py-1.5 px-3 gap-1.5 badge-error text-white font-semibold tabular-nums"
          >
            <span class="w-2 h-2 rounded-full bg-white/90 shrink-0"></span>
            <span>Oltre il limite · +{{ alert.increment_pcent }}%</span>
          </span>
          <span v-else class="badge h-auto py-1.5 px-3 gap-1.5 badge-ghost text-base-content/70">
            <span class="w-2 h-2 rounded-full bg-success shrink-0"></span>
            <span>Nella norma</span>
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <div class="h-2 w-full rounded-full bg-base-300 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="pressureBarClass"
              :style="{ width: pressurePercent + '%' }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs text-base-content/60 tabular-nums">
            <span>Limite: {{ zone?.threshold ?? "--" }} pedoni</span>
            <span v-if="currentDensity !== null && zone?.threshold">
              {{ Math.round((currentDensity / zone.threshold) * 100) }}% della soglia
            </span>
          </div>
        </div>
      </div>

      <!-- Azioni principali e modifica limite inline -->
      <div v-if="!isEditing" class="flex items-center gap-2">
        <button
          v-if="alert.active"
          type="button"
          class="btn h-10 min-h-10 px-3.5 rounded-lg btn-error text-white flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap touch-manipulation"
          aria-label="Segnala superamento limite"
          title="Segnala superamento limite"
          @click="reportAlert"
        >
          Segnala
        </button>
        <button
          type="button"
          class="btn h-10 min-h-10 px-3.5 rounded-lg btn-outline border-base-300 flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap touch-manipulation"
          aria-label="Modifica limite"
          @click="startEditing"
        >
          <PencilIcon class="size-3.5 shrink-0" />
          <span>Modifica limite</span>
        </button>
        <button
          type="button"
          class="btn btn-square h-10 min-h-10 w-10 shrink-0 rounded-lg btn-ghost border border-base-300 text-base-content/70 inline-flex items-center justify-center touch-manipulation"
          aria-label="Informazioni su limite e allerta"
          @click="thresholdDialog.showModal()"
        >
          <QuestionMarkCircleIcon class="size-4" />
        </button>
      </div>
      <div v-else class="flex flex-col gap-2 bg-base-200 p-3 rounded-lg border border-base-300">
        <label class="text-xs font-semibold text-base-content/70">
          Imposta nuovo limite (pedoni)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="localZone.threshold"
            ref="thresholdInput"
            type="number"
            min="1"
            class="input input-bordered h-10 min-h-10 w-full text-base md:text-sm tabular-nums bg-base-100"
            placeholder="Imposta un valore"
          />
          <button
            type="button"
            class="btn h-10 min-h-10 px-3.5 rounded-lg btn-primary text-white text-sm font-medium whitespace-nowrap shrink-0"
            :disabled="Number(zone?.threshold) === Number(localZone?.threshold)"
            @click="saveChanges"
          >
            Salva
          </button>
          <button
            type="button"
            class="btn h-10 min-h-10 px-3.5 rounded-lg btn-ghost border border-base-300 text-sm font-medium whitespace-nowrap shrink-0"
            @click="abortChanges"
          >
            Annulla
          </button>
        </div>
      </div>

      <!-- Eventi in corso nella zona -->
      <div
        class="border-t border-base-300 pt-3 flex flex-col gap-2"
        :class="{ unfocus: isEditing }"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-base-content/70">Eventi in corso</span>
          <span v-if="eventiZona.length === 0" class="text-base-content/50">Nessuno</span>
        </div>
        <button
          v-for="event in eventiZona"
          :key="event._id"
          type="button"
          class="btn btn-sm bg-base-200 border-base-300 justify-between w-full min-h-10 touch-manipulation"
          @click="router.push(`/Eventi/${event._id}`)"
        >
          <span class="truncate">{{ event.title }}</span>
          <span class="badge badge-error badge-xs text-white font-semibold">In corso</span>
        </button>
      </div>

      <!-- Grafico andamento densità -->
      <div class="border-t border-base-300 pt-3">
        <ChartSmallMirror
          v-model:zone="localZone"
          :class="{ unfocus: isEditing }"
        />
      </div>
    </div>

  <dialog class="modal" ref="thresholdDialog">
    <div class="modal-box flex flex-col gap-3 max-w-md">
      <form class="flex flex-row justify-end gap-2" method="dialog">
        <button class="btn btn-circle btn-sm" aria-label="Chiudi finestra informativa">
          <XMarkIcon class="size-4" />
        </button>
      </form>
      <h2 class="card-title text-base">Cos'è un'allerta? Cos'è un limite?</h2>
      <p class="text-sm">
        L'applicazione UrbanFlow permette di impostare un limite di pedoni per
        ogni zona, oltre il quale viene generata un'allerta.
      </p>
      <p class="text-sm">
        L'allerta può segnalare un'affluenza improvvisa, specialmente quando
        alla zona in esame non è associato nessun evento attualmente in corso.
      </p>
    </div>
  </dialog>
  </div>
</template>

<style scoped>
.indicator {
  @apply w-2 h-2 bg-primary rounded-full;
}
.unfocus {
  @apply opacity-30 pointer-events-none;
}
</style>
