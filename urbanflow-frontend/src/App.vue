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

const activeSection = ref("Mappa");
</script>

<template>
  <section
    v-if="activeArea === 'Main'"
    id="rootBox"
    class="fixed top-5 flex justify-evenly w-full"
  >
    <SectionsBar v-model="activeSection" class="shadow-md"></SectionsBar>
  </section>
  <section v-if="activeArea === 'Main'" id="mapBox" class="relative">
    <Map v-model:events="eventsData"></Map>
  </section>
  <section
    v-if="activeArea === 'Main'"
    id="rightSideBox"
    class="fixed top-5 right-5 flex flex-col items-end gap-5"
  >
    <MapSearchBar v-model="activeSection" class="shadow-md"></MapSearchBar>
    <MapFilterList
      v-if="activeSection == 'Mappa'"
      class="boxFadeIn shadow-md"
    ></MapFilterList>
    <EventsList
      v-else-if="activeSection == 'Eventi'"
      class="boxFadeIn shadow-md"
      v-model:events="eventsData"
    ></EventsList>
  </section>
  <section
    id="leftSideBox"
    v-if="activeSection != 'User'"
    class="fixed top-5 left-5 flex gap-5"
  >
    <UserButtons></UserButtons>
  </section>
</template>

<style scoped></style>
