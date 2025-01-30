<script setup>
import {
  ExclamationTriangleIcon,
  PencilIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";
import { reactive, ref, watch } from "vue";

const zone = reactive({
  _id: "60d0fe4f5311236168a109cc",
  name: "Piazza Duomo",
  coordinates: [
    [45.46427, 9.18951],
    [45.46427, 9.19051],
    [45.46527, 9.19051],
    [45.46527, 9.18951],
  ],
  latestData: {
    density: 270,
    date: "2024-08-17T14:07:30",
  },
  threshold: 200,
});
const localZone = reactive(JSON.parse(JSON.stringify(zone)));
const isEditing = ref(false);
const isNewEvent = ref(false);
const alert = reactive({
  active: zone.latestData.density > zone.threshold,
  hasEvents: false,
  day: new Date(zone.latestData.date).toLocaleDateString(),
  hour: new Date(zone.latestData.date).toLocaleTimeString(),
  density: zone.latestData.density,
  increment_pcent: Math.round(
    ((zone.latestData.density - zone.threshold) / zone.threshold) * 100
  ),
});
watch(zone, () => {
  alert.active = zone.latestData.density > zone.threshold;
  alert.increment_pcent = Math.round(
    ((zone.latestData.density - zone.threshold) / zone.threshold) * 100
  );
});
const abortChanges = () => {
  isEditing.value = false;
  localZone.threshold = zone.threshold;
};
const saveChanges = () => {
  isEditing.value = false;
  zone.threshold = localZone.threshold;
};
const thresholdDialog = ref(null);
</script>
<template>
  <div class="dialog flex flex-col bg-base-100 p-5 rounded-box gap-5 shadow-md">
    <div
      class="flex flex-row justify-end gap-2 bg-base-100"
      v-if="!isEditing && !isNewEvent"
    >
      <!-- Chiudi card zona -->
      <button class="btn btn-square btn-sm" @click="event = null">
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
        :disabled="JSON.stringify(zone) == JSON.stringify(localZone)"
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
        type="number"
        class="btn-sm bg-transparent w-full outline-none border-[1px] rounded-md"
        :value="localZone.threshold"
        :class="{
          'text-primary border-primary': isEditing,
        }"
        :disabled="!isEditing"
        placeholder="imposta un valore"
        @input="
          ($event) => {
            let v = $event.target.value.toString();
            v = v
              .split('')
              .filter((c) => c.match(/[0-9]/))
              .join('');
            console.log(v);
            $event.target.value = v == '' ? null : parseInt(v);
            localZone.threshold = v == '' ? null : parseInt(v);
          }
        "
      />
      <button
        v-if="!isEditing"
        class="btn btn-sm btn-square btn-primary btn-outline"
        @click="
          () => {
            isEditing = true;
          }
        "
      >
        <PencilIcon class="size-4"></PencilIcon>
      </button>
    </div>
    <!-- Card allerta -->
    <div
      v-if="alert.active"
      class="bg-red-500 text-white rounded-box p-5 flex flex-col gap-4"
    >
      <ExclamationTriangleIcon class="size-10"></ExclamationTriangleIcon>
      <p>
        Alle {{ alert.hour }} del {{ alert.day }} il numero di pedoni rilevati
        in {{ zone.name }} è stato superiore al limite impostato.
      </p>
      <div class="flex flex-row justify-between">
        <span class="stat-value"
          >{{ alert.density }}<span class="text-sm">pedoni</span></span
        >
        <span class="stat-value">+{{ alert.increment_pcent }}%</span>
      </div>
      <button class="btn border-none bg-red-700 hover:bg-red-800 text-white">
        Segnala
      </button>
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
  overflow: scroll;
}
</style>
