<script setup>
import { computed, inject, ref, provide, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";

// Componenti
import Map from "./Map.vue";
import SectionsBar from "./SectionsBar.vue";
import MapSearchBar from "./MapSearchBar.vue";
import MapFilterList from "./MapFilterList.vue";
import UserButtons from "./UserButtons.vue";
import EventsList from "./EventsList.vue";
import ZonesAlertsList from "./ZonesAlertsList.vue";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const user = inject("user");
const loadUser = inject("loadUser");

const appAreas = ref(["User", "Main"]);
const searchTerm = ref("");

const zonesData = ref([]);
const measureData = ref([]);
const eventsData = ref([]);
const isInit = ref(false);
const isLoading = ref(true);
const zoneTabFocus = ref("zones");
const isSheetCollapsed = ref(false);

const loadZones = async () => {
  try {
    const response = await authFetch(`${API_URL}/api/zones`, {
      method: 'GET',
      headers: { 'x-access-token': localStorage.getItem('JWT') },
    });

    const data = await response.json();
    zonesData.value = data; // Usa .value correttamente

  } catch (error) {
    console.error('authFetch error:', error);
  }
};

const loadCameraData = async () => {
  try {
    const response = await authFetch(`${API_URL}/api/cameraData`, {
      method: 'GET',
      headers: { 'x-access-token': localStorage.getItem('JWT') },
    });

    const data = await response.json();
    measureData.value = data;
  } catch (error) {
    console.error('authFetch error:', error);
  }
};

const loadEvents = async() => {
  try {
      const response = await authFetch(`${API_URL}/api/events`, {
      method: 'GET',
      headers: { 'x-access-token': localStorage.getItem('JWT') },
    });

    const data = await response.json();
    eventsData.value = data;
  } catch (error) {
    console.error('authFetch error:', error);
  }
};

const loadAll = async () => {
  if (isInit.value) // controllo di non aver già caricato
    return;
  isInit.value = true;
  isLoading.value = true;
  try {
    await Promise.allSettled([loadEvents(), loadZones(), loadCameraData(), loadUser()]);
  } finally {
    isLoading.value = false;
  }
};

// Provide delle variabili e funzioni di aggiornamento
provide("listaZone", zonesData);
provide("listaMisurazioni", measureData);
provide("listaEventi", eventsData);
provide("loadAll", loadAll);
provide("loadEvents", loadEvents);
provide("loadZones", loadZones);
provide("isLoading", isLoading);
provide("zoneTabFocus", zoneTabFocus);

onMounted(()=>{
  loadAll();
  const intervalId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    loadCameraData();
  }, 5000);
  onUnmounted(() => clearInterval(intervalId));
})




// Ottieni il router e la route corrente
const router = useRouter();
const route = useRoute();

// Calcola la sezione attiva in base al path
const appSection = computed({
  get() {

    const query = route.query; // questo è fatto per il redirect con pagine statiche di github pages
  
    if (query.page) {
      if(query.id){

        router.push(`/${query.page}/${query.id}`);
        window.history.pushState( // serve per router.back()
          { ...window.history.state, isRedirect: false },
          '',
          `/${query.page}`
        )
      }else{
        router.push(`/${query.page}`);
      }

    }

    let path = route.path;
    const base = import.meta.env.BASE_URL;

    path = path.slice(1);
    const pathParts = path.split("/");
    return pathParts[0] || "Mappa"; 
  },
  set(section) {

    const [newSection, id] = section.split("/");
  
    if (id) {
      router.push(`/${newSection}/${id}`.replace(/\/\//g, '/')); 
    } else {
      if (route.path.endsWith("/")) {
        router.push(`/${newSection}/`.replace(/\/\//g, '/'));
      } else {
        router.push(`/${newSection}`.replace(/\/\//g, '/'));
      }
    }
  }
});
const currentId = computed(() => {
  const pathParts = route.path.slice(1).split("/");
  return pathParts[1] || null;
});

const selectedEventZoneIds = computed(() => {
  if (appSection.value !== "Eventi" || !currentId.value || currentId.value === "nuovo") {
    return [];
  }
  const ev = (eventsData.value || []).find((item) => String(item._id) === String(currentId.value));
  if (!ev || !Array.isArray(ev.zones)) return [];
  return ev.zones.filter(Boolean).map((z) => String(z._id || z));
});

const activeAlertsCount = computed(() => {
  if (!zonesData.value || !measureData.value) return 0;
  return zonesData.value.filter((zone) => {
    const m = measureData.value.find((item) => String(item.zone) === String(zone._id));
    const density = m?.data?.[0]?.density ?? 0;
    return zone.threshold && density > zone.threshold;
  }).length;
});

function openAlertsFromSummary() {
  zoneTabFocus.value = "alerts";
  router.push("/Zone");
}

watch([appSection, currentId], () => {
  isSheetCollapsed.value = false;
});

</script>

<template>
  <section id="mapBox" class="relative">
    <Map
      v-model:events="eventsData"
      :selectedZoneId="appSection === 'Zone' ? currentId : null"
      :highlightedZoneIds="selectedEventZoneIds"
      :hasOpenPanel="appSection !== 'Mappa' && !isSheetCollapsed"
    ></Map>
  </section>

  <!-- Account pill top-right (stile Apple Maps Web) -->
  <section
    id="leftSideBox"
    v-if="appSection !== 'User'"
    class="fixed top-3 right-3 md:top-4 md:right-4 flex gap-5 z-30"
  >
    <UserButtons></UserButtons>
  </section>

  <!-- Dock laterale sinistro su desktop (maps.apple.com) + ricerca in alto e sheet in basso su mobile -->
  <section
    id="rightSideBox"
    class="fixed top-3 left-3 right-16 md:right-auto md:top-4 md:left-4 md:w-[380px] z-20 pointer-events-none flex flex-col md:bg-base-100/90 md:backdrop-blur-xl md:border md:border-base-300/80 md:rounded-[18px] md:uf-panel-shadow md:p-3 md:gap-2.5"
  >
    <MapSearchBar
      v-show="!currentId"
      v-model:appSection="appSection"
      v-model:searchTerm="searchTerm"
      v-model:zones="zonesData"
      v-model:events="eventsData"
      class="pointer-events-auto"
    ></MapSearchBar>

    <div
      class="fixed bottom-3 inset-x-3 md:static pointer-events-auto flex flex-col-reverse md:flex-col gap-2 bg-base-100/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-base-300/80 md:border-none rounded-[18px] md:rounded-none uf-panel-shadow md:shadow-none p-2 md:p-0"
    >
      <div id="rootBox" class="w-full">
        <SectionsBar v-model="appSection" />
      </div>

      <!-- Riepilogo stato rapido nella sidebar desktop su /Mappa -->
      <div
        v-if="appSection === 'Mappa' && !searchTerm.trim() && !isLoading && zonesData.length > 0"
        class="hidden md:flex items-center justify-between gap-2 pt-2 border-t border-base-300/80 text-xs tabular-nums"
      >
        <span class="text-base-content/75">
          <strong class="text-base-content">{{ zonesData.length }}</strong> zone monitorate ·
          <span :class="activeAlertsCount > 0 ? 'text-error font-semibold' : 'text-base-content/60'">
            {{ activeAlertsCount }} {{ activeAlertsCount === 1 ? "allerta" : "allerte" }}
          </span>
        </span>
        <button
          v-if="activeAlertsCount > 0"
          type="button"
          class="text-primary font-semibold hover:underline shrink-0"
          @click="openAlertsFromSummary"
        >
          Mostra allerte
        </button>
      </div>

      <Transition name="panel-slide" mode="out-in">
        <div
          v-if="appSection === 'Eventi' || appSection === 'Zone'"
          :key="appSection"
          class="flex flex-col items-stretch border-b md:border-b-0 md:border-t border-base-300/80 pb-2 md:pb-0 md:pt-2.5"
        >
          <div class="md:hidden flex justify-center mb-1.5">
            <button
              type="button"
              class="h-6 px-3 rounded-full bg-base-200 border border-base-300 text-xs font-medium inline-flex items-center gap-1 touch-manipulation"
              @click="isSheetCollapsed = !isSheetCollapsed"
            >
              <ChevronUpIcon v-if="isSheetCollapsed" class="size-3.5" />
              <ChevronDownIcon v-else class="size-3.5" />
              <span>{{ isSheetCollapsed ? "Espandi pannello" : "Riduci a mappa" }}</span>
            </button>
          </div>
          <div :class="{ 'hidden md:block': isSheetCollapsed }">
            <EventsList
              v-if="appSection === 'Eventi'"
              v-model:events="eventsData"
              v-model:searchTerm="searchTerm"
              v-model:id="currentId"
            ></EventsList>
            <ZonesAlertsList
              v-else-if="appSection === 'Zone'"
              v-model:searchTerm="searchTerm"
              v-model:id="currentId"
            ></ZonesAlertsList>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.panel-slide-enter-active {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease-out;
}
.panel-slide-leave-active {
  transition: transform 0.12s ease-in, opacity 0.12s ease-in;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
}
</style>