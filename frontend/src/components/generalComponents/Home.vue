<script setup>
import { computed, inject, ref,provide, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

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

const loadAll = ()=>{
  if(isInit.value) // controllo di non aver già caricato
    return;
  loadEvents();
  loadZones();
  loadCameraData();
  loadUser();
  isInit.value = true;
}

// Provide delle variabili e funzioni di aggiornamento
provide("listaZone", zonesData);
provide("listaMisurazioni", measureData);
provide("listaEventi", eventsData);
provide("loadAll", loadAll);
provide("loadEvents", loadEvents);
provide("loadZones", loadZones);

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


</script>

<template>
  <section id="mapBox" class="relative">
    <Map
      v-model:events="eventsData"
      :selectedZoneId="appSection === 'Zone' ? currentId : null"
      :hasOpenPanel="appSection !== 'Mappa'"
    ></Map>
  </section>

  <!-- SectionsBar: top-center su desktop, bottom pill su mobile -->
  <section
    id="rootBox"
    class="fixed bottom-4 md:bottom-auto md:top-5 inset-x-0 flex justify-center w-full z-20 pointer-events-none"
  >
    <SectionsBar v-model="appSection" class="shadow-md pointer-events-auto"></SectionsBar>
  </section>

  <!-- UserButtons: top-left (avatar compatto su mobile, esteso su desktop) -->
  <section
    id="leftSideBox"
    v-if="appSection !== 'User'"
    class="fixed top-3 left-3 md:top-5 md:left-5 flex gap-5 z-30"
  >
    <UserButtons></UserButtons>
  </section>

  <!-- Search + Liste/Dialoghi: top-right su desktop, search bar in alto + bottom sheet su mobile -->
  <section
    id="rightSideBox"
    class="fixed top-3 right-3 left-16 md:left-auto md:top-5 md:right-5 flex flex-col items-stretch md:items-end gap-3 md:gap-5 z-20 pointer-events-none"
  >
    <MapSearchBar
      v-show="!currentId"
      v-model:appSection="appSection"
      v-model:searchTerm="searchTerm"
      v-model:zones="zonesData"
      v-model:events="eventsData"
      class="shadow-md pointer-events-auto"
    ></MapSearchBar>
    <!-- <MapFilterList
      v-if="appSection === 'Mappa'"
      class="boxFadeIn shadow-md pointer-events-auto"
    ></MapFilterList> -->
    <Transition name="panel-slide" mode="out-in">
      <div
        v-if="appSection === 'Eventi' || appSection === 'Zone'"
        :key="appSection"
        class="fixed bottom-20 inset-x-3 md:static pointer-events-auto"
      >
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
    </Transition>
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