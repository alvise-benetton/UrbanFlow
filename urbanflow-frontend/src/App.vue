<script setup>
// Packages
import { ref } from "vue";
// Componenti
import Map from "./components/generalComponents/Map.vue";
import SectionsBar from "./components/generalComponents/SectionsBar.vue";
import MapSearchBar from "./components/generalComponents/MapSearchBar.vue";
import MapFilterList from "./components/generalComponents/MapFilterList.vue";
import UserButtons from "./components/generalComponents/UserButtons.vue";
import EventsList from "./components/generalComponents/EventsList.vue";
// Dati (da sostituire con fetch)
import events from "./demoData/events.json";

const eventsData = ref(events);
const activeArea = ref("Main");
const appAreas = ref(["User", "Main"]);
const appSection = ref("Mappa");

const searchTerm = ref("");
</script>

<template>
  <section
    v-if="activeArea === 'Main'"
    id="rootBox"
    class="fixed top-5 flex justify-evenly w-full"
  >
    <SectionsBar v-model="appSection" class="shadow-md"></SectionsBar>
  </section>
  <section v-if="activeArea === 'Main'" id="mapBox" class="relative">
    <Map v-model:events="eventsData"></Map>
  </section>
  <section
    v-if="activeArea === 'Main'"
    id="rightSideBox"
    class="fixed top-5 right-5 flex flex-col items-end gap-5"
  >
    <MapSearchBar
      v-model:appSection="appSection"
      v-model:searchTerm="searchTerm"
      class="shadow-md"
    ></MapSearchBar>
    <MapFilterList
      v-if="appSection == 'Mappa'"
      class="boxFadeIn shadow-md"
    ></MapFilterList>
    <EventsList
      v-else-if="appSection == 'Eventi'"
      v-model:events="eventsData"
      v-model:searchTerm="searchTerm"
    ></EventsList>
  </section>
  <section
    id="leftSideBox"
    v-if="appSection != 'User'"
    class="fixed top-5 left-5 flex gap-5"
  >
    <UserButtons></UserButtons>
  </section>
</template>

<style scoped></style>
