<script setup>
import { computed, inject, nextTick, ref, provide, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";

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
const isRailCollapsed = ref(false);
const isSearchDrawerOpen = ref(false);

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

const alertZonesQuickList = computed(() => {
  if (!zonesData.value || !measureData.value) return [];
  return zonesData.value
    .map((zone) => {
      const m = measureData.value.find((item) => String(item.zone) === String(zone._id));
      const density = m?.data?.[0]?.density ?? null;
      const pct =
        density != null && zone.threshold ? Math.floor(((density - zone.threshold) / zone.threshold) * 100) : 0;
      return { ...zone, density, pct };
    })
    .filter((z) => z.density != null && z.threshold && z.density > z.threshold)
    .sort((a, b) => b.pct - a.pct);
});

const activeAlertsCount = computed(() => alertZonesQuickList.value.length);

const showDesktopCard = computed(
  () => appSection.value === "Zone" || appSection.value === "Eventi" || (appSection.value === "Mappa" && isSearchDrawerOpen.value)
);

const desktopLeftInset = computed(() => {
  const railW = isRailCollapsed.value ? 0 : 212;
  const cardW = showDesktopCard.value ? 390 : 0;
  return railW + cardW;
});

function openAlertsFromSummary() {
  zoneTabFocus.value = "alerts";
  isSearchDrawerOpen.value = false;
  router.push("/Zone");
}

function openSearchDrawer() {
  if (appSection.value !== "Mappa") {
    router.push("/Mappa");
  }
  isSearchDrawerOpen.value = true;
  nextTick(() => {
    document.querySelector('#appleSearchCard input')?.focus();
  });
}

function closeSearchDrawer() {
  isSearchDrawerOpen.value = false;
  searchTerm.value = "";
}

watch([appSection, currentId], () => {
  isSheetCollapsed.value = false;
  if (appSection.value !== "Mappa") {
    isSearchDrawerOpen.value = false;
  }
});

</script>

<template>
  <section id="mapBox" class="relative">
    <Map
      v-model:events="eventsData"
      :selectedZoneId="appSection === 'Zone' ? currentId : null"
      :highlightedZoneIds="selectedEventZoneIds"
      :hasOpenPanel="appSection !== 'Mappa' && !isSheetCollapsed"
      :leftInset="desktopLeftInset"
    ></Map>
  </section>

  <!-- Account pill top-right -->
  <section
    id="leftSideBox"
    v-if="appSection !== 'User'"
    class="fixed top-3 right-3 md:top-5 md:right-5 flex gap-3 z-30"
  >
    <UserButtons></UserButtons>
  </section>

  <!-- Pulsante riapertura rail quando collassata su desktop -->
  <button
    v-if="isRailCollapsed"
    type="button"
    class="hidden md:flex fixed top-5 left-4 z-30 h-9 w-9 items-center justify-center rounded-[12px] bg-base-100/80 backdrop-blur-2xl border border-base-300/60 uf-apple-control-shadow text-base-content/80 hover:text-base-content transition-colors"
    aria-label="Mostra barra laterale"
    title="Mostra barra laterale"
    @click="isRailCollapsed = false"
  >
    <Bars3Icon class="size-4" />
  </button>

  <!-- Barra laterale sinistra stile Apple Maps Web (212px fissa full-height su desktop) -->
  <aside
    v-show="!isRailCollapsed"
    id="appleRail"
    class="hidden md:flex fixed top-0 left-0 bottom-0 w-[212px] z-20 flex-col bg-base-100/80 backdrop-blur-2xl border-r border-base-300/60 select-none"
  >
    <!-- Header brand + collassa -->
    <div class="h-[68px] px-4 flex items-center justify-between gap-2 shrink-0">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-bold text-lg tracking-tight text-base-content">UrbanFlow</span>
        <span class="px-1.5 py-0.5 rounded-md bg-base-300/70 text-[10px] font-semibold text-base-content/65 uppercase">
          Trento
        </span>
      </div>
      <button
        type="button"
        class="w-7 h-7 rounded-lg inline-flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-content/5 transition-colors"
        aria-label="Nascondi barra laterale"
        title="Nascondi barra laterale"
        @click="isRailCollapsed = true"
      >
        <ChevronLeftIcon class="size-4" />
      </button>
    </div>

    <!-- Navigazione principale -->
    <div class="px-2.5 flex flex-col gap-1 shrink-0">
      <button
        type="button"
        class="w-full h-[46px] px-2.5 rounded-[12px] flex items-center gap-3 text-sm transition-colors text-left"
        :class="
          isSearchDrawerOpen && appSection === 'Mappa'
            ? 'bg-base-content/[0.06] font-semibold text-base-content'
            : 'hover:bg-base-content/[0.04] text-base-content/80 font-medium'
        "
        @click="openSearchDrawer"
      >
        <span
          class="w-[30px] h-[30px] rounded-[9px] inline-flex items-center justify-center shrink-0 transition-colors"
          :class="
            isSearchDrawerOpen && appSection === 'Mappa'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-base-200 text-base-content/70'
          "
        >
          <MagnifyingGlassIcon class="size-4" />
        </span>
        <span>Cerca</span>
      </button>

      <SectionsBar v-model="appSection" />
    </div>

    <!-- Allerte attive rapide (stile "Recenti >" di Apple Maps) -->
    <div class="flex-1 overflow-y-auto px-2.5 mt-5 pb-3 flex flex-col gap-1 min-h-0">
      <div class="px-2.5 pb-1 flex items-center justify-between">
        <button
          type="button"
          class="text-xs font-semibold text-base-content/55 hover:text-base-content inline-flex items-center gap-0.5 transition-colors"
          @click="openAlertsFromSummary"
        >
          <span>Allerte attive</span>
          <span aria-hidden="true">›</span>
        </button>
        <span v-if="activeAlertsCount > 0" class="text-[11px] font-semibold text-error tabular-nums">
          {{ activeAlertsCount }}
        </span>
      </div>

      <button
        v-for="az in alertZonesQuickList.slice(0, 6)"
        :key="az._id"
        type="button"
        class="w-full h-[44px] px-2.5 rounded-[12px] flex items-center gap-2.5 text-sm transition-colors text-left"
        :class="
          String(currentId) === String(az._id)
            ? 'bg-base-content/[0.07] font-semibold text-base-content'
            : 'hover:bg-base-content/[0.04] text-base-content/85'
        "
        @click="router.push(`/Zone/${az._id}`)"
      >
        <span class="w-7 h-7 rounded-full bg-error text-white inline-flex items-center justify-center shrink-0">
          <ExclamationTriangleIcon class="size-3.5" />
        </span>
        <span class="truncate flex-1 text-[13px]">{{ az.name }}</span>
        <span class="text-[11px] font-semibold text-error tabular-nums shrink-0">+{{ az.pct }}%</span>
      </button>

      <p v-if="!isLoading && alertZonesQuickList.length === 0" class="px-2.5 py-2 text-xs text-base-content/50">
        Nessuna allerta attiva
      </p>
    </div>

    <!-- Footer riepilogo -->
    <div class="px-4 py-3 border-t border-base-300/60 text-xs text-base-content/60 shrink-0 tabular-nums">
      <div class="font-medium text-base-content/80">{{ zonesData.length }} zone monitorate</div>
      <div>{{ eventsData.length }} eventi registrati</div>
    </div>
  </aside>

  <!-- Card secondaria sliding (.mw-card di maps.apple.com) su desktop; ricerca top + bottom sheet su mobile -->
  <section
    id="rightSideBox"
    class="fixed z-20 pointer-events-none"
    :class="[
      isRailCollapsed ? 'md:left-0' : 'md:left-[212px]',
      'md:top-0 md:bottom-0 md:right-auto top-3 left-3 right-16 flex flex-col',
    ]"
  >
    <!-- Mobile search pill in alto -->
    <div v-show="!currentId" class="md:hidden pointer-events-auto">
      <MapSearchBar
        v-model:appSection="appSection"
        v-model:searchTerm="searchTerm"
        v-model:zones="zonesData"
        v-model:events="eventsData"
      ></MapSearchBar>
    </div>

    <!-- Desktop Search Drawer (quando si clicca "Cerca" su /Mappa) -->
    <Transition name="card-slide">
      <div
        v-if="appSection === 'Mappa' && isSearchDrawerOpen"
        id="appleSearchCard"
        class="hidden md:flex flex-col w-[390px] h-full bg-base-100/70 backdrop-blur-2xl uf-apple-card-shadow border-r border-base-300/60 pointer-events-auto p-5 gap-4 overflow-y-auto"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold tracking-tight">Cerca</h2>
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-base-content/10 hover:bg-base-content/15 inline-flex items-center justify-center text-base-content/70 transition-colors"
            aria-label="Chiudi ricerca"
            @click="closeSearchDrawer"
          >
            <XMarkIcon class="size-4" />
          </button>
        </div>
        <MapSearchBar
          v-model:appSection="appSection"
          v-model:searchTerm="searchTerm"
          v-model:zones="zonesData"
          v-model:events="eventsData"
          :showInlineSuggestions="true"
        ></MapSearchBar>
      </div>
    </Transition>

    <!-- Contenitore pannelli Zone/Eventi (drawer laterale full-height su desktop, bottom sheet su mobile) -->
    <div
      class="fixed bottom-3 inset-x-3 md:static pointer-events-auto flex flex-col-reverse md:flex-col gap-2 md:gap-0 bg-base-100/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-base-300/80 md:border-none rounded-[18px] md:rounded-none uf-panel-shadow md:shadow-none p-2 md:p-0 md:h-full"
    >
      <div id="rootBox" class="w-full md:hidden">
        <SectionsBar v-model="appSection" />
      </div>

      <Transition name="card-slide" mode="out-in">
        <div
          v-if="appSection === 'Eventi' || appSection === 'Zone'"
          :key="appSection"
          class="flex flex-col items-stretch border-b md:border-b-0 border-base-300/80 pb-2 md:pb-0 md:w-[390px] md:h-full md:bg-base-100/70 md:backdrop-blur-2xl md:uf-apple-card-shadow md:border-r md:border-base-300/60 md:p-5"
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
          <div :class="isSheetCollapsed ? 'hidden md:flex md:flex-col md:h-full md:min-h-0' : 'md:flex md:flex-col md:h-full md:min-h-0'">
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
.card-slide-enter-active,
.panel-slide-enter-active {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out;
}
.card-slide-leave-active,
.panel-slide-leave-active {
  transition: transform 0.14s ease-in, opacity 0.14s ease-in;
}
.card-slide-enter-from,
.card-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .card-slide-enter-active,
  .card-slide-leave-active,
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
}
</style>