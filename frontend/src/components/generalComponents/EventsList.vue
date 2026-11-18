<script setup>
import { PlusIcon } from "@heroicons/vue/20/solid";
import { computed, inject, ref } from "vue";
import EventDialog from "./EventDialog.vue";
import router from "../utility/router";

const urlId = defineModel("id");
const eventsData = inject("listaEventi", ref([]));
const searchTerm = defineModel("searchTerm");

const filteredEventsData = computed(() => {
  if (!eventsData?.value) return [];
  if (!searchTerm?.value) {
    return eventsData.value;
  }
  const words = searchTerm.value.toLowerCase().trim().split(/\s+/);
  return eventsData.value.filter((ev) =>
    words.every((word) => (ev.title || "").toLowerCase().includes(word))
  );
});

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

const isEditing = ref(false);

const createEvent = () => {
  isEditing.value = true;
  router.push("/Eventi/nuovo");
};

function setEvent(ev) {
  isEditing.value = false;
  router.push(`/Eventi/${ev._id}`);
}
</script>

<template>
  <div class="w-full md:w-80 lg:w-96 flex flex-col">
    <Transition name="card-fade" mode="out-in">
      <div
        v-if="urlId === null && urlId !== 'nuovo'"
        key="events-list"
        class="flex flex-col gap-4 rounded-box p-4 sm:p-5 bg-base-200 shadow-md max-h-[55dvh] md:max-h-[calc(100vh-7rem)] overflow-y-auto"
      >
        <div
          class="flex items-center justify-between sticky top-0 bg-base-200 border-b border-base-300 pb-3 z-10"
        >
          <span class="font-bold text-base">Eventi</span>
          <button
            type="button"
            class="btn btn-square btn-sm btn-primary text-white touch-manipulation"
            title="Crea nuovo evento"
            aria-label="Crea nuovo evento"
            @click="createEvent"
          >
            <PlusIcon class="size-4" />
          </button>
        </div>

        <div v-if="currentEvents.length > 0" class="flex flex-col gap-2.5">
          <small class="text-base-content/70">In corso:</small>
          <button
            v-for="currentEvent in currentEvents"
            :key="currentEvent._id"
            type="button"
            @click="setEvent(currentEvent)"
            class="btn bg-base-100 justify-start text-left min-h-11 touch-manipulation"
          >
            <span class="truncate w-full">{{ currentEvent.title }}</span>
          </button>
        </div>

        <div v-if="otherEvents.length > 0" class="flex flex-col gap-2.5">
          <small class="text-base-content/70">Altri:</small>
          <button
            v-for="otherEvent in otherEvents"
            :key="otherEvent._id"
            type="button"
            @click="setEvent(otherEvent)"
            class="btn bg-base-100 justify-start text-left min-h-11 touch-manipulation"
          >
            <span class="truncate w-full">{{ otherEvent.title }}</span>
          </button>
        </div>

        <div v-if="filteredEventsData.length === 0">
          <p class="text-sm text-base-content/60 w-full text-center py-4">
            Nessun evento trovato
          </p>
        </div>
      </div>

      <EventDialog
        v-else
        :key="urlId"
        v-model:isEditing="isEditing"
        v-model:id="urlId"
      />
    </Transition>
  </div>
</template>

<style scoped>
.card-fade-enter-active {
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.16s ease-out;
}
.card-fade-leave-active {
  transition: transform 0.11s ease-in, opacity 0.11s ease-in;
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .card-fade-enter-active,
  .card-fade-leave-active {
    transition: none;
  }
}
</style>
