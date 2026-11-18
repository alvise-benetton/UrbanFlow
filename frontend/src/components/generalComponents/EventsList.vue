<script setup>
import { PlusIcon } from "@heroicons/vue/20/solid";
import { computed, inject, ref } from "vue";
import EventDialog from "./EventDialog.vue";
import router from "../utility/router";

const urlId = defineModel("id");
const eventsData = inject("listaEventi", ref([]));
const isLoading = inject("isLoading", ref(false));
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

const upcomingEvents = computed(() => {
  const now = new Date();
  return filteredEventsData.value.filter((ev) => new Date(ev.startDate) > now);
});

const pastEvents = computed(() => {
  const now = new Date();
  return filteredEventsData.value.filter((ev) => new Date(ev.endDate) < now);
});

const eventGroups = computed(() => [
  { key: "current", label: "In corso:", items: currentEvents.value },
  { key: "upcoming", label: "In programma:", items: upcomingEvents.value },
  { key: "past", label: "Conclusi:", items: pastEvents.value },
].filter((g) => g.items.length > 0));

function formatDateRange(ev) {
  if (!ev?.startDate || !ev?.endDate) return "";
  const fmt = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const s = new Date(ev.startDate);
  const e = new Date(ev.endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

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
  <div class="w-full flex flex-col md:h-full md:min-h-0">
    <Transition name="card-fade" mode="out-in">
      <div
        v-if="urlId === null && urlId !== 'nuovo'"
        key="events-list"
        class="flex flex-col [&>*]:shrink-0 gap-3 max-h-[50dvh] md:max-h-none md:flex-1 overflow-y-auto overscroll-contain pr-0.5"
      >
        <div
          class="flex items-center justify-between sticky top-0 bg-base-100/85 backdrop-blur-md border-b border-base-300/60 pb-2.5 z-10"
        >
          <span class="font-bold text-base md:text-xl tracking-tight">Eventi</span>
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

        <div v-if="isLoading && eventsData.length === 0" class="flex flex-col gap-2.5">
          <div v-for="n in 4" :key="n" class="skeleton h-11 w-full rounded-btn"></div>
        </div>

        <template v-else>
          <div v-for="group in eventGroups" :key="group.key" class="flex flex-col gap-2">
            <small class="text-base-content/70 font-medium">{{ group.label }}</small>
            <button
              v-for="ev in group.items"
              :key="ev._id"
              type="button"
              @click="setEvent(ev)"
              class="btn h-auto min-h-[50px] py-2.5 px-3.5 bg-base-100 hover:bg-base-100/90 border border-base-300/60 rounded-2xl shadow-sm justify-start text-left touch-manipulation"
            >
              <div class="flex flex-col items-start min-w-0 w-full gap-0.5">
                <span class="truncate w-full font-medium text-sm">{{ ev.title }}</span>
                <span class="text-xs text-base-content/60 font-normal tabular-nums">
                  {{ formatDateRange(ev) }}
                </span>
              </div>
            </button>
          </div>

          <div v-if="filteredEventsData.length === 0">
            <p class="text-sm text-base-content/60 w-full text-center py-4">
              Nessun evento trovato
            </p>
          </div>
        </template>
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
