<script setup>
import { computed, ref, watch } from "vue";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import router from "../utility/router";

const appSection = defineModel("appSection");
const searchTerm = defineModel("searchTerm");

const zones = defineModel("zones");
const events = defineModel("events");

const txt = ref("un evento o una zona");
watch(appSection, (newValue) => {
  if (newValue == "Eventi") {
    txt.value = "un evento";
  } else if (newValue == "Zone") {
    txt.value = "una zona";
  } else {
    txt.value = "un evento o una zona";
  }
});

const normalizedQuery = computed(() => (searchTerm.value || "").toLowerCase().trim());

const matchedZones = computed(() => {
  if (!normalizedQuery.value || !Array.isArray(zones.value)) return [];
  return zones.value.filter(
    (z) => z.name && z.name.toLowerCase().includes(normalizedQuery.value)
  );
});

const matchedEvents = computed(() => {
  if (!normalizedQuery.value || !Array.isArray(events.value)) return [];
  return events.value.filter(
    (e) => e.title && e.title.toLowerCase().includes(normalizedQuery.value)
  );
});

function selectResult(path) {
  searchTerm.value = "";
  router.push(path);
}
</script>

<template>
  <div class="w-full md:w-80 lg:w-96">
    <label
      class="input w-full h-11 md:h-12 flex items-center gap-2 bg-base-100 px-3"
      id="searchBar"
    >
      <input
        type="text"
        class="grow min-w-0 text-base md:text-sm bg-transparent outline-none"
        :placeholder="'Cerca ' + txt"
        v-model="searchTerm"
        @keydown.esc="searchTerm = ''"
      />
      <button
        v-if="searchTerm"
        type="button"
        class="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
        aria-label="Svuota ricerca"
        @click="searchTerm = ''"
      >
        <XMarkIcon class="size-4" />
      </button>
      <MagnifyingGlassIcon v-else class="size-5 text-base-content/60 shrink-0" />
    </label>

    <div
      v-if="normalizedQuery && appSection === 'Mappa'"
      class="w-full max-h-[55dvh] md:max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-3 bg-base-200 p-4 rounded-box mt-3 shadow-lg border border-base-300"
    >
      <p class="text-xs text-base-content/70">Risultati per: "{{ searchTerm.trim() }}"</p>

      <div v-if="matchedZones.length > 0" class="flex flex-col gap-2">
        <h3 class="font-bold text-sm">Zone</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="zone in matchedZones"
            :key="zone._id"
            type="button"
            class="btn bg-base-100 w-full justify-start text-left min-h-11"
            @click="selectResult(`/Zone/${zone._id}`)"
          >
            {{ zone.name }}
          </button>
        </div>
      </div>

      <div v-if="matchedEvents.length > 0" class="flex flex-col gap-2">
        <h3 class="font-bold text-sm">Eventi</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="event in matchedEvents"
            :key="event._id"
            type="button"
            class="btn bg-base-100 w-full justify-start text-left min-h-11"
            @click="selectResult(`/Eventi/${event._id}`)"
          >
            {{ event.title }}
          </button>
        </div>
      </div>

      <p
        v-if="matchedZones.length === 0 && matchedEvents.length === 0"
        class="text-sm text-base-content/60 text-center py-3"
      >
        Nessuna zona o evento trovato
      </p>
    </div>
  </div>
</template>

<style scoped>
.input {
  outline: none !important;
  border: none !important;
}
</style>
