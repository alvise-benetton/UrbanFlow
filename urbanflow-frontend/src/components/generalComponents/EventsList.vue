<script setup>
import {
  CalendarDateRangeIcon,
  MapPinIcon,
  PlusIcon,
} from "@heroicons/vue/20/solid";
import { computed, ref, watch } from "vue";
import EventDialog from "./EventDialog.vue";
const eventsData = defineModel("events");
const filteredEventsData = computed(() => {
  if (searchTerm.value == "") {
    return eventsData.value;
  } else {
    return eventsData.value.filter((ev) => {
      let words = searchTerm.value.toLowerCase().trim().split(" ");
      return words.every((word) => {
        return ev.title.toLowerCase().includes(word);
      });
    });
  }
});
const searchTerm = defineModel("searchTerm");
const currentEvents = computed(() => {
  const now = new Date();
  return filteredEventsData.value.filter((ev) => {
    const startDate = new Date(ev.startDate);
    const endDate = new Date(ev.endDate);
    return startDate <= now && endDate >= now;
  });
});
const otherEvents = computed(() => {
  const now = new Date();
  return filteredEventsData.value.filter((ev) => {
    const startDate = new Date(ev.startDate);
    const endDate = new Date(ev.endDate);
    return startDate > now || endDate < now;
  });
});
const singleEvent = ref(null);
const isEditing = ref(false);
const isNewEvent = ref(false);
watch(singleEvent, (newValue, _) => {
  isEditing.value = false;
  isNewEvent.value = false;
  if (newValue === null) {
    document.getElementById("searchBar").classList.remove("hidden");
  } else {
    document.getElementById("searchBar").classList.add("hidden");
  }
});
const createEvent = () => {
  singleEvent.value = {
    title: "",
    zones: [],
    startDate: new Date(),
    endDate: new Date(),
  };
};
</script>
<template>
  <div
    v-if="singleEvent === null"
    class="eventListDialog flex flex-col gap-5 rounded-box p-5 bg-base-200 shadow-md"
  >
    <div
      class="flex justify-between sticky top-0 bg-base-200 border-b border-base-300 pb-5"
    >
      <!-- Filtri -->
      <div class="flex gap-2">
        <button class="btn btn-square btn-sm bg-base-100">
          <CalendarDateRangeIcon class="size-4"></CalendarDateRangeIcon>
        </button>
        <button class="btn btn-square btn-sm bg-base-100">
          <MapPinIcon class="size-4"></MapPinIcon>
        </button>
      </div>
      <!-- Crea evento -->
      <div>
        <button class="btn btn-square btn-sm btn-primary" @click="createEvent">
          <PlusIcon class="size-4"></PlusIcon>
        </button>
      </div>
    </div>

    <div v-if="currentEvents.length > 0" class="flex flex-col gap-3">
      <small>In corso:</small>
      <button
        v-for="currentEvent in otherEvents"
        @click="singleEvent = otherEvent"
        class="btn bg-base-100"
      >
        <span class="text-left w-full">{{ currentEvent.title }}</span>
      </button>
    </div>
    <div v-if="otherEvents.length > 0" class="flex flex-col gap-3">
      <small>Altri:</small>
      <button
        v-for="otherEvent in otherEvents"
        @click="singleEvent = otherEvent"
        class="btn bg-base-100"
      >
        <span class="text-left w-full">{{ otherEvent.title }}</span>
      </button>
    </div>
    <div v-if="filteredEventsData.length == 0">
      <p class="text-gray-400 w-full text-center">Nessun evento trovato</p>
    </div>
  </div>
  <EventDialog v-else v-model:event="singleEvent"></EventDialog>
</template>
<style scoped>
.eventListDialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
</style>
