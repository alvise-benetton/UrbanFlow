<script setup>
import { ref, watch } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
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
</script>
<template>
  <div>
    <label class="input flex items-center" id="searchBar">
      <input
        type="text"
        class="grow searchinput"
        :placeholder="'Cerca ' + txt"
        v-model="searchTerm"
      />
      <MagnifyingGlassIcon class="size-5 text-base-0" />
    </label>
    <div v-if="searchTerm && appSection === 'Mappa'" class="search-results-card flex flex-col bg-base-200 p-5 rounded-box mt-5">
      <p>Risultati per: "{{ searchTerm }}"</p>
      <div>
        <div v-if="zones && zones.length > 0">
          <h3 class="font-bold mb-2">Zone</h3>
          <ul>
            <button v-for="zone in zones.filter(z => z.name && z.name.toLowerCase().startsWith(searchTerm.toLowerCase()))" class="btn bg-base-100 mb-2 w-full" @click="$router.push(`/Zone/${zone._id}`)">
              {{ zone.name }}
            </button>
          </ul>
        </div>
        <div v-if="events && events.length > 0" class="mt-4">
          <h3 class="font-bold mb-2">Eventi</h3>
          <ul>
            <li v-for="event in events.filter(e => e.title && e.title.toLowerCase().startsWith(searchTerm.toLowerCase()))" class="btn bg-base-100 mb-2 w-full" @click="$router.push(`/Eventi/${event._id}`)">
              {{ event.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.searchinput {
  flex: 0 0 auto;
  min-width: 20vw;
}
.input {
  outline: none !important;
  border: none !important;
}
.search-results-card{
  min-width: 250pt;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow-y: scroll;
}
</style>
