<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/20/solid";
import ZonesAlertsList from "./ZonesAlertsList.vue";
import ZoneDialog from "./ZoneDialog.vue";
import EventsList from "./EventsList.vue";
import EventDialog from "./EventDialog.vue";

const props = defineProps({
  section: {
    type: String,
    required: true,
  },
});

const searchTerm = defineModel("searchTerm", { default: "" });
const currentId = defineModel("id");

const router = useRouter();

const title = computed(() => {
  if (props.section === "Zone") {
    return currentId.value ? "Dettaglio Zona" : "Zone e Rilevazioni";
  }
  if (props.section === "Eventi") {
    if (currentId.value === "nuovo") return "Nuovo Evento";
    return currentId.value ? "Dettaglio Evento" : "Eventi Programmati";
  }
  return "Pannello Operativo";
});

const isDetail = computed(() => !!currentId.value);

function goBack() {
  if (currentId.value) {
    currentId.value = null;
    router.push(`/${props.section}`);
  } else {
    router.push("/Mappa");
  }
}

function closePanel() {
  currentId.value = null;
  router.push("/Mappa");
}
</script>

<template>
  <aside class="w-full sm:w-[420px] max-w-full h-full bg-base-100 border-l border-base-300 shadow-2xl flex flex-col z-30 shrink-0">
    <!-- Header del Pannello Dockato -->
    <div class="h-12 px-4 border-b border-base-300 bg-base-200/60 flex items-center justify-between shrink-0 select-none">
      <div class="flex items-center gap-2">
        <button
          v-if="isDetail"
          @click="goBack"
          class="btn btn-ghost btn-xs btn-circle text-base-content hover:bg-base-300"
          title="Torna alla lista"
        >
          <ChevronLeftIcon class="size-5" />
        </button>
        <div class="flex items-center gap-1.5 font-bold text-sm text-base-content">
          <ShieldExclamationIcon v-if="section === 'Zone'" class="size-4 text-primary" />
          <CalendarDaysIcon v-else-if="section === 'Eventi'" class="size-4 text-primary" />
          <span>{{ title }}</span>
        </div>
      </div>

      <button
        @click="closePanel"
        class="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-base-content hover:bg-base-300"
        title="Chiudi pannello (vista mappa a tutto schermo)"
      >
        <XMarkIcon class="size-4" />
      </button>
    </div>

    <!-- Contenuto scrollabile del Pannello con transizione interna fluida -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <!-- Sezione Zone -->
      <template v-if="section === 'Zone'">
        <Transition name="fade-slide" mode="out-in">
          <ZoneDialog v-if="currentId" :id="currentId" key="zone-detail" />
          <ZonesAlertsList v-else v-model:searchTerm="searchTerm" v-model:id="currentId" key="zone-list" />
        </Transition>
      </template>

      <!-- Sezione Eventi -->
      <template v-else-if="section === 'Eventi'">
        <Transition name="fade-slide" mode="out-in">
          <EventDialog v-if="currentId" :id="currentId" key="event-detail" />
          <EventsList v-else v-model:searchTerm="searchTerm" v-model:id="currentId" key="event-list" />
        </Transition>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
