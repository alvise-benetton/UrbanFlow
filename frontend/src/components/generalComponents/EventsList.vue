<script setup>
import {
  CalendarDateRangeIcon,
  MapPinIcon,
  PlusIcon,
} from "@heroicons/vue/20/solid";
import { computed, inject, provide, ref, watch } from "vue";
import EventDialog from "./EventDialog.vue";
import router from "../utility/router";

const urlId = defineModel("id");

const eventsData = inject("listaEventi", ref([]));
const singleEvent = ref(urlId.value && eventsData?.value ? eventsData.value.find((e) => e._id === urlId.value) : null);

watch(urlId, (newId) => {
  if(!newId || !eventsData?.value){
    singleEvent.value = null;
  }else{
    singleEvent.value = eventsData.value.find((e) => e._id === newId) || null;
  }
});

const searchTerm = defineModel("searchTerm");

const filteredEventsData = computed(() => {
  if (!eventsData?.value) return [];
  if (!searchTerm?.value) {
    return eventsData.value;
  } else {
    let words = searchTerm.value.toLowerCase().trim().split(" ");
    return eventsData.value.filter((ev) => {
      return words.every((word) => {
        return (ev.title || "").toLowerCase().includes(word);
      });
    });
  }
});

const currentEvents = computed(() => {
  const now = new Date();
  return filteredEventsData.value.filter((ev) => {
    const startDate = new Date(ev.startDate);
    const endDate = new Date(ev.endDate)
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



const isEditing = ref(false);
watch(singleEvent, (newValue, _) => {
  isEditing.value = false;
  if (newValue === null) {
    document.getElementById("searchBar").classList.remove("hidden");
  } else {
    document.getElementById("searchBar").classList.add("hidden");
  }
});
const createEvent = () => {
  isEditing.value = true;
  router.push("/Eventi/nuovo");
};

function setEvent(ev){
  router.push(`/Eventi/${ev._id}`);
}

</script>
<template>
  <div
    v-if="urlId === null && urlId !== 'nuovo' "
    class="eventListDialog flex flex-col gap-5 rounded-box p-5 bg-base-200 shadow-md"
  >
    <div
      class="flex justify-between sticky top-0 bg-base-200 border-b border-base-300 pb-5"
    >
      <!-- Crea evento -->
      <div class="ml-auto">
        <button class="btn btn-square btn-sm btn-primary" @click="createEvent">
          <PlusIcon class="size-4"></PlusIcon>
        </button>
      </div>
    </div>

    <div v-if="currentEvents.length > 0" class="flex flex-col gap-3">
      <small>In corso:</small>
      <button
        v-for="currentEvent in currentEvents"
        @click="setEvent(currentEvent)"
        class="btn bg-base-100"
      >
        <span class="text-left w-full">{{ currentEvent.title }}</span>
      </button>
    </div>
    <div v-if="otherEvents.length > 0" class="flex flex-col gap-3">
      <small>Altri:</small>
      <button
        v-for="otherEvent in otherEvents"
        @click="setEvent(otherEvent)"
        class="btn bg-base-100"
      >
        <span class="text-left w-full">{{ otherEvent.title }}</span>
      </button>
    </div>
    <div v-if="filteredEventsData.length == 0">
      <p class="text-gray-400 w-full text-center">Nessun evento trovato</p>
    </div>
  </div>
  <EventDialog v-else v-model:isEditing="isEditing" v-model:id="urlId"></EventDialog>
</template>
<style scoped>
.eventListDialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow-y: scroll;
}
</style>
