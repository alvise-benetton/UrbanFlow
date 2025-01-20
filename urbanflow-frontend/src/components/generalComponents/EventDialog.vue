<script setup>
import { PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed, onBeforeMount } from "vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { TrashIcon } from "@heroicons/vue/24/solid";

const event = defineModel("event");
const isEditing = defineModel("isEditing");
const isNewEvent = defineModel("isNewEvent");
const isCurrent = computed(() => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  return startDate <= now && endDate >= now;
});
const abortChanges = () => {
  isEditing.value = false;
  if (isNewEvent) {
    event.value = null;
  }
};
const saveChanges = () => {
  isEditing.value = false;
};
onBeforeMount(() => {
  if (event.value.title == "") {
    isEditing.value = true;
    isNewEvent.value = true;
  }
});
</script>
<template>
  <div class="eventDialog flex flex-col bg-base-100 p-5 rounded-box gap-5">
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
      <button class="btn btn-square btn-sm btn-error text-white">
        <TrashIcon class="size-4"></TrashIcon>
      </button>
    </div>
    <div class="flex flex-row justify-end gap-2" v-else>
      <!-- Annulla modifiche -->
      <button class="btn btn-sm btn-error text-white" @click="abortChanges()">
        Annulla
      </button>
      <!-- Salva modifiche -->
      <button class="btn btn-sm btn-primary" @click="saveChanges()">
        Salva
      </button>
    </div>
    <!-- Titolo evento -->
    <h2 class="font-bold card-title">{{ event.title }}</h2>
    <!-- Zone evento -->
    <ZonesPicker
      v-model:event="event"
      v-model:isEditing="isEditing"
    ></ZonesPicker>
    <!-- Data evento -->
    <DatePicker
      v-model:event="event"
      v-model:isEditing="isEditing"
    ></DatePicker>
    <!-- Dati storici -->
    <ChartSmallMirror
      v-if="!isNewEvent"
      v-model:eventID="event._id"
      :class="{
        'opacity-50 grayscale-[50%] pointer-events-none': isEditing,
      }"
    ></ChartSmallMirror>
  </div>
</template>
<style>
.eventDialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
</style>
