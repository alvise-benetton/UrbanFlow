<script setup>
import { computed, inject, ref } from "vue";
import { useRouter } from "vue-router";
import {
  CalendarDaysIcon,
  PlusIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";

const id = defineModel("id");
const searchTerm = defineModel("searchTerm", { default: "" });

const eventsData = inject("listaEventi", ref([]));
const router = useRouter();

const activeTab = ref("in_corso"); // "in_corso", "programmati", "conclusi"

const now = new Date();

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const categorizedEvents = computed(() => {
  const current = [];
  const upcoming = [];
  const past = [];
  const nowDate = new Date();

  (eventsData.value || []).forEach((ev) => {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    if (s <= nowDate && e >= nowDate) {
      current.push(ev);
    } else if (s > nowDate) {
      upcoming.push(ev);
    } else {
      past.push(ev);
    }
  });

  // Ordina futuri per data più vicina
  upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  // Ordina passati dal più recente
  past.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  return { current, upcoming, past };
});

const displayedEvents = computed(() => {
  let list = [];
  if (activeTab.value === "in_corso") {
    list = categorizedEvents.value.current;
  } else if (activeTab.value === "programmati") {
    list = categorizedEvents.value.upcoming;
  } else {
    list = categorizedEvents.value.past;
  }

  if (searchTerm.value && searchTerm.value.trim() !== "") {
    const terms = searchTerm.value.toLowerCase().trim().split(" ");
    list = list.filter((ev) => {
      return terms.every((t) => (ev.title || "").toLowerCase().includes(t));
    });
  }

  return list;
});

function createNewEvent() {
  id.value = "nuovo";
  router.push("/Eventi/nuovo");
}

function selectEvent(evId) {
  id.value = evId;
  router.push(`/Eventi/${evId}`);
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <!-- Barra Azioni: Nuovo Evento & Tabs -->
    <div class="flex items-center justify-between gap-2">
      <!-- Tabs Categorie -->
      <div class="join bg-base-200 p-0.5 rounded-lg border border-base-300 flex-1">
        <button
          class="join-item flex-1 btn btn-xs font-semibold gap-1"
          :class="activeTab === 'in_corso' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="activeTab = 'in_corso'"
        >
          <span>Live</span>
          <span
            v-if="categorizedEvents.current.length > 0"
            class="badge badge-info badge-xs text-white"
          >
            {{ categorizedEvents.current.length }}
          </span>
        </button>
        <button
          class="join-item flex-1 btn btn-xs font-semibold"
          :class="activeTab === 'programmati' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="activeTab = 'programmati'"
        >
          In arrivo ({{ categorizedEvents.upcoming.length }})
        </button>
        <button
          class="join-item flex-1 btn btn-xs font-semibold"
          :class="activeTab === 'conclusi' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="activeTab = 'conclusi'"
        >
          Archivio ({{ categorizedEvents.past.length }})
        </button>
      </div>

      <!-- Pulsante Nuovo Evento -->
      <button
        @click="createNewEvent"
        class="btn btn-primary btn-xs text-white gap-1 shrink-0 font-bold shadow-sm"
        title="Pianifica nuovo evento"
      >
        <PlusIcon class="size-3.5" />
        <span class="hidden sm:inline">Nuovo</span>
      </button>
    </div>

    <!-- Lista Eventi -->
    <div class="flex flex-col gap-2.5">
      <div
        v-for="event in displayedEvents"
        :key="event._id"
        @click="selectEvent(event._id)"
        class="p-3.5 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200/70 hover:border-primary/50 transition-all cursor-pointer shadow-sm flex flex-col gap-2 group"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="font-bold text-sm text-base-content group-hover:text-primary transition-colors leading-snug">
            {{ event.title }}
          </span>

          <span
            v-if="activeTab === 'in_corso'"
            class="badge badge-info badge-sm text-white font-bold text-[10px] shrink-0 gap-1 animate-pulse"
          >
            ● LIVE
          </span>
          <span
            v-else-if="activeTab === 'programmati'"
            class="badge badge-ghost badge-sm text-gray-500 font-mono text-[10px] shrink-0"
          >
            Programmato
          </span>
          <span
            v-else
            class="badge badge-ghost badge-sm text-gray-400 text-[10px] shrink-0"
          >
            Concluso
          </span>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-500 font-mono pt-1 border-t border-base-200">
          <div class="flex items-center gap-1 text-[11px]">
            <CalendarDaysIcon class="size-3.5 text-gray-400" />
            <span>{{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}</span>
          </div>

          <div class="flex items-center gap-1 text-[11px] text-gray-500">
            <MapPinIcon class="size-3 text-primary" />
            <span>{{ (event.zones || []).length }} {{ (event.zones || []).length === 1 ? 'zona' : 'zone' }}</span>
          </div>
        </div>
      </div>

      <!-- Nessun evento trovato -->
      <div v-if="displayedEvents.length === 0" class="text-center py-12 text-gray-400 text-xs flex flex-col items-center gap-2">
        <CheckCircleIcon class="size-8 opacity-40 text-gray-400" />
        <span>Nessun evento in questa categoria</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
