<script setup>
import {
  ExclamationTriangleIcon,
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
      class="w-full md:w-80 lg:w-96 max-h-[58dvh] md:max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain flex flex-col [&>*]:shrink-0 bg-base-100 p-4 sm:p-5 rounded-box gap-4 shadow-md"
      v-if="localZone"
    >
    <div
      class="flex flex-row justify-end gap-2 bg-base-100"
      v-if="!isEditing"
    >
      <button
        type="button"
        class="btn btn-square btn-sm touch-manipulation"
        aria-label="Chiudi scheda zona"
        @click="closeCard"
      >
        <XMarkIcon class="size-4" />
      </button>
    </div>
    <div class="flex flex-row justify-end gap-2" v-else>
      <button type="button" class="btn btn-sm btn-error text-white" @click="abortChanges">
        Annulla
      </button>
      <button
        type="button"
        class="btn btn-sm btn-primary text-white"
        :disabled="Number(zone?.threshold) === Number(localZone?.threshold)"
        @click="saveChanges"
      >
        Salva
      </button>
    </div>

    <span class="font-bold card-title w-full">{{ localZone.name }}</span>

    <!-- Limite e modifica limite -->
    <div class="flex flex-row items-center gap-2">
      <button
        type="button"
        class="btn btn-sm bg-base-200 border-none rounded-md flex items-center gap-1 touch-manipulation"
        aria-label="Informazioni su limite e allerta"
        @click="thresholdDialog.showModal()"
      >
        <QuestionMarkCircleIcon class="size-4" />
        <span>Limite:</span>
      </button>
      <input
        v-model.number="localZone.threshold"
        ref="thresholdInput"
        type="number"
        min="1"
        class="input input-sm bg-transparent w-full text-base md:text-sm outline-none border rounded-md"
        :class="{
          'text-primary border-primary': isEditing,
          'border-base-300': !isEditing,
        }"
        :disabled="!isEditing"
        placeholder="Imposta un valore"
      />
      <button
        v-if="!isEditing"
        type="button"
        class="btn btn-sm btn-square btn-primary btn-outline touch-manipulation"
        aria-label="Modifica limite"
        @click="startEditing"
      >
        <PencilIcon class="size-4" />
      </button>
    </div>

    <!-- Dati densità -->
    <p class="text-sm">
      All'ultima rilevazione, il numero di pedoni rilevati in
      {{ localZone.name }} è stato di
      <span class="font-semibold">{{ currentDensity !== null ? currentDensity : "--" }}</span>.
    </p>

    <!-- Card allerta -->
    <div
      v-if="alert.active"
      class="bg-red-500 text-white rounded-box p-4 sm:p-5 flex flex-col gap-3"
      :class="{ unfocus: isEditing }"
    >
      <ExclamationTriangleIcon class="size-8" />
      <p class="text-sm">
        Il numero di pedoni rilevati in {{ localZone.name }} è stato superiore al limite impostato di
        {{ zone?.threshold }}.
      </p>
      <div class="flex flex-row items-baseline justify-between gap-2">
        <span class="stat-value text-2xl">
          {{ currentDensity }} <span class="text-sm font-normal">pedoni</span>
        </span>
        <span class="stat-value text-2xl">+{{ alert.increment_pcent }}%</span>
      </div>
      <button
        type="button"
        class="btn btn-sm sm:btn-md border-none bg-red-700 hover:bg-red-800 text-white touch-manipulation"
        @click="reportAlert"
      >
        Segnala
      </button>
    </div>

    <!-- Lista eventi in corso nella zona -->
    <div
      class="flex flex-col gap-2 p-3 bg-base-200 rounded-box items-center"
      :class="{ unfocus: isEditing }"
    >
      <button
        v-for="event in eventiZona"
        :key="event._id"
        type="button"
        class="btn btn-sm bg-base-100 justify-between w-full min-h-10 touch-manipulation"
        @click="router.push(`/Eventi/${event._id}`)"
      >
        <span class="truncate">{{ event.title }}</span>
        <div class="indicator relative shrink-0">
          <div class="indicator absolute top-0 left-0 animate-ping"></div>
        </div>
      </button>
      <small v-if="eventiZona.length === 0" class="text-base-content/60">
        Nessun evento in corso nella zona
      </small>
    </div>

    <!-- Grafico andamento densità -->
    <ChartSmallMirror
      v-model:zone="localZone"
      :class="{ unfocus: isEditing }"
    />
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
