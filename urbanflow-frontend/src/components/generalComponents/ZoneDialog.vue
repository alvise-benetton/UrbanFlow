<script setup>
import {
  ExclamationTriangleIcon,
  PencilIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";
import { computed, inject, ref, watch } from "vue";

const zone = inject("selectedZone");
const misurazioni = inject("listaMisurazioni");
const localZone = ref({ ...zone.value }); // Copia iniziale di zone
const alert = ref({ ative: false, increment_pcent: 0 });

const getDensity = () => {
  return misurazioni.value.find((m) => m.zone === zone.value._id)?.data[0]
    .density;
};

alert.value.active = getDensity() > zone.value.threshold;
alert.value.increment_pcent = Math.floor(
  ((getDensity() - zone.value.threshold) / zone.value.threshold) * 100
);

watch(
  zone,
  (newVal) => {
    localZone.value = { ...newVal }; // Aggiorna localZone quando zone cambia
  },
  { deep: true }
);

const isEditing = ref(false);
const isNewEvent = ref(false);

const abortChanges = () => {
  isEditing.value = false;
  localZone.value.threshold = zone.value.threshold;
};
const saveChanges = async () => {
  await fetch(`http://localhost:3000/api/zones/${zone.value._id}`, {
    headers: {
      "x-access-token": localStorage.getItem("JWT"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threshold: localZone.value.threshold }),
    method: "PUT",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("errore nel modificare la zona");
      }
      return res;
    })
    .then(() => {
      zone.value.threshold = localZone.value.threshold;
      alert.value.active = getDensity() > zone.value.threshold;
      alert.value.increment_pcent = Math.floor(
        ((getDensity() - zone.value.threshold) / zone.value.threshold) * 100
      );
    });
  isEditing.value = false;
};

const thresholdInput = ref(null);
const thresholdDialog = ref(null);
</script>
<template>
  <div
    class="dialog flex flex-col bg-base-100 p-5 rounded-box gap-5 shadow-md"
    v-if="localZone"
  >
    <div
      class="flex flex-row justify-end gap-2 bg-base-100"
      v-if="!isEditing && !isNewEvent"
    >
      <!-- Chiudi card zona -->
      <button class="btn btn-square btn-sm" @click="zone = null">
        <XMarkIcon class="size-4"></XMarkIcon>
      </button>
    </div>
    <div class="flex flex-row justify-end gap-2" v-else>
      <!-- Annulla modifiche -->
      <button class="btn btn-sm btn-error text-white" @click="abortChanges">
        Annulla
      </button>
      <!-- Salva modifiche -->
      <button
        class="btn btn-sm btn-primary"
        :disabled="JSON.stringify(zone) === JSON.stringify(localZone)"
        @click="saveChanges"
      >
        Salva
      </button>
    </div>
    <!-- Titolo evento -->
    <span class="font-bold card-title w-full">{{ localZone.name }} </span>
    <!-- Limite e modifica limite -->
    <div class="flex flex-row items-align gap-2">
      <div class="btn-sm bg-base-200 rounded-md flex items-center gap-1">
        <QuestionMarkCircleIcon
          class="size-4"
          @click="thresholdDialog.showModal()"
        ></QuestionMarkCircleIcon>
        <span>Limite:</span>
      </div>
      <input
        v-model="localZone.threshold"
        ref="thresholdInput"
        type="number"
        pattern="[1-9][0-9]*"
        class="btn-sm bg-transparent w-full outline-none border-[1px] rounded-md"
        :class="{
          'text-primary border-primary': isEditing,
        }"
        :disabled="!isEditing"
        placeholder="imposta un valore"
      />
      <button
        v-if="!isEditing"
        class="btn btn-sm btn-square btn-primary btn-outline"
        @click="
          () => {
            isEditing = true;
            $nextTick(() => {
              thresholdInput.focus();
            });
          }
        "
      >
        <PencilIcon class="size-4"></PencilIcon>
      </button>
    </div>
    <!-- Card dati SENZA allerta -->
    <p>
      All'ultima rilevazione, il numero di pedoni rilevati in
      {{ localZone.name }} è stato di
      <span class="font-semibold">{{ getDensity() }}</span
      >.
    </p>
    <!-- Card allerta -->
    <div
      v-if="alert && alert.active"
      class="bg-red-500 text-white rounded-box p-5 flex flex-col gap-4"
      :class="{
        unfocus: isEditing,
      }"
    >
      <ExclamationTriangleIcon class="size-10"></ExclamationTriangleIcon>
      <p>
        Alle {{ alert.hour }} del {{ alert.day }} il numero di pedoni rilevati
        in {{ localZone.name }} è stato superiore al limite impostato di
        {{ zone.threshold }}.
      </p>
      <div class="flex flex-row justify-between">
        <span class="stat-value"
          >{{ getDensity() }}<span class="text-sm">pedoni</span></span
        >
        <span class="stat-value">+{{ alert.increment_pcent }}%</span>
      </div>
      <button class="btn border-none bg-red-700 hover:bg-red-800 text-white">
        Segnala
      </button>
    </div>
    <!-- Lista eventi -->
    <div
      class="flex flex-col gap-2 p-3 bg-base-200 rounded-box items-center"
      :class="{
        unfocus: isEditing,
      }"
    >
      <a
        v-for="event in localZone.events"
        class="btn btn-sm bg-base-100 justify-between w-full"
      >
        <span> {{ event.title }}</span>
        <div v-if="event.isCurrent" class="indicator relative">
          <div class="indicator absolute top-0 left-0 animate-ping"></div>
        </div>
      </a>
      <small
        v-if="!localZone.events || localZone.events.length <= 0"
        class="text-gray-500"
      >
        Nessun evento è previsto nella zona
      </small>
    </div>
  </div>
  <dialog class="modal" ref="thresholdDialog">
    <div class="modal-box flex flex-col gap-2 w-fit">
      <form class="flex flex-row justify-end gap-2" method="dialog">
        <button class="btn btn-circle btn-sm">
          <XMarkIcon class="size-4"></XMarkIcon>
        </button>
      </form>
      <h2 class="card-title">Cos'è un'allerta? Cos'è un limite?</h2>
      <p>
        L'applicazione UrbanFlow permette di impostare un limite di pedoni per
        ogni zona, oltre il quale viene generata un'allerta.
      </p>
      <p>
        L'allerta può segnalare un'affluenza improvvisa, specialmente quando
        alla zona in esame non è associato nessun evento attualmente in corso.
      </p>
    </div>
  </dialog>
</template>
<style>
.dialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow-y: scroll;
}
.indicator {
  @apply w-2 h-2 bg-primary rounded-full;
}
.unfocus {
  @apply opacity-30 pointer-events-none;
}
</style>
