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
  user.value = loadUser();
  isInit.value = true;
}

// Provide delle variabili e funzioni di aggiornamento
provide("listaZone", zonesData);
provide("listaMisurazioni", measureData);
provide("listaEventi", eventsData);
provide("loadAll", loadAll);

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
  <section
    id="rootBox"
    class="fixed top-5 flex justify-evenly w-full"
  >
  <SectionsBar v-model="appSection" class="shadow-md"></SectionsBar>
  </section>
  <section id="mapBox" class="relative">
    <Map v-model:events="eventsData"></Map>
  </section>
  <section
    id="rightSideBox"
    class="fixed top-5 right-5 flex flex-col items-end gap-5"
  >
    <MapSearchBar
      v-model:appSection="appSection"
      v-model:searchTerm="searchTerm"
      v-model:zones="zonesData"
      v-model:events="eventsData"
      class="shadow-md"
    ></MapSearchBar>
<!--     <MapFilterList
      v-if="appSection === 'Mappa'"
      class="boxFadeIn shadow-md"
    ></MapFilterList> -->
    <EventsList
      v-if="appSection === 'Eventi'"
      v-model:events="eventsData"
      v-model:searchTerm="searchTerm"
      v-model:id ="currentId"
    ></EventsList>
    <ZonesAlertsList
      v-else-if="appSection === 'Zone'"
      v-model:searchTerm="searchTerm"
      v-model:id ="currentId"
    ></ZonesAlertsList>
  </section>
  <section
    id="leftSideBox"
    v-if="appSection !== 'User'"
    class="fixed top-5 left-5 flex gap-5"
  >
    <UserButtons></UserButtons>
  </section>
</template>

<style scoped></style>