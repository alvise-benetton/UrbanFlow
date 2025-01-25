<script setup>
import { PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed, onBeforeMount, reactive } from "vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { TrashIcon } from "@heroicons/vue/24/solid";

const event = defineModel("event");
const localEvent = ref(JSON.parse(JSON.stringify(event.value)));
const isEditing = defineModel("isEditing");
const isNewEvent = defineModel("isNewEvent");
const deleteEventModal = ref(null);
const isCurrent = computed(() => {
  const now = new Date();
  const startDate = new Date(localEvent.startDate);
  const endDate = new Date(localEvent.endDate);
  return startDate <= now && endDate >= now;
});
const datePicker = ref(null);
const abortChanges = () => {
  if (isNewEvent.value) {
    event.value = null;
  }
  localEvent.value = JSON.parse(JSON.stringify(event.value));
  isEditing.value = false;
};
const saveChanges = () => {
  if (
    isNewEvent.value &&
    JSON.stringify(event.value) == JSON.stringify(localEvent.value)
  ) {
    event.value = null;
  }
  isEditing.value = false;
};
const deleteEvent = () => {
  event.value = null;
};
onBeforeMount(() => {
  if (event.value.title == "") {
    isEditing.value = true;
    isNewEvent.value = true;
  }
});
</script>
<template>
  <div
    class="eventDialog flex flex-col bg-base-100 p-5 rounded-box gap-5 shadow-md"
  >
    <div class="flex flex-row gap-2 items-center absolute" v-if="isCurrent">
      <div class="indicator absolute opacity-75 animate-ping"></div>
      <div class="indicator scale-75"></div>
      <span class="text-red-500">LIVE</span>
    </div>
    <div
      class="flex flex-row justify-end gap-2"
      v-if="!isEditing && !isNewEvent"
    >
      <!-- Modifica evento -->
      <button class="btn btn-square btn-sm" @click="isEditing = true">
        <PencilIcon class="size-4"></PencilIcon>
      </button>
      <!-- Chiudi card evento -->
      <button class="btn btn-square btn-sm" @click="event = null">
        <XMarkIcon class="size-4"></XMarkIcon>
      </button>
      <!-- Elimina evento -->
      <button
        class="btn btn-square btn-sm btn-error text-white"
        @click="deleteEventModal.showModal()"
      >
        <TrashIcon class="size-4"></TrashIcon>
      </button>
    </div>
    <div class="flex flex-row justify-end gap-2" v-else>
      <!-- Annulla modifiche -->
      <button class="btn btn-sm btn-error text-white" @click="abortChanges()">
        Annulla
      </button>
      <!-- Salva modifiche -->
      <button
        class="btn btn-sm btn-primary"
        :disabled="JSON.stringify(event) == JSON.stringify(localEvent)"
        @click="saveChanges()"
      >
        Salva
      </button>
    </div>
    <!-- Titolo evento -->
    <h2 class="font-bold card-title">{{ localEvent.title }}</h2>
    <!-- Zone evento -->
    <ZonesPicker
      v-model:event="localEvent"
      v-model:isEditing="isEditing"
    ></ZonesPicker>
    <!-- Data evento -->
    <DatePicker
      ref="datePicker"
      v-model:event="localEvent"
      v-model:isEditing="isEditing"
    ></DatePicker>
    <!-- Dati storici -->
    <ChartSmallMirror
      v-if="!isNewEvent"
      v-model:eventID="localEvent._id"
      :class="{
        'opacity-50 grayscale-[50%] pointer-events-none': isEditing,
      }"
    ></ChartSmallMirror>
  </div>
  <dialog class="modal" ref="deleteEventModal">
    <div class="modal-box flex flex-col gap-2 items-center w-fit">
      <p class="font-bold">Elimina evento?</p>
      <div class="flex flex-col items-center">
        <p>Sei sicuro di voler eliminare l'evento?</p>
        <p>Non puoi annullare l'azione</p>
      </div>
      <form class="flex flex-row gap-2 w-full modal-action" method="dialog">
        <button class="btn btn-primary flex-grow">Annulla</button>
        <button class="btn btn-error text-white flex-grow" @click="deleteEvent">
          Elimina
        </button>
      </form>
    </div>
  </dialog>
</template>
<style>
.eventDialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
.indicator {
  @apply w-3 h-3 rounded-full bg-red-500;
}
</style>
