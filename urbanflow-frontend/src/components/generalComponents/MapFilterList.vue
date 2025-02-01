<script setup>
import { ref } from "vue";
import eventBus from '../utility/eventBus'; 
const filters = ref(["Eventi", "Zone"]);

const activeFilters = ref(["Zone","Eventi"]);

// Funzione per gestire il toggle dei filtri
function toggleFilter(filter) {
  if (activeFilters.value.includes(filter)) {
    activeFilters.value = activeFilters.value.filter(f => f !== filter);
  } else {
    activeFilters.value.push(filter);
  }
  eventBus.updateFilters(activeFilters.value); // Aggiorna i filtri nell'Event Bus
}

</script>
<template>
  <div class="flex flex-col p-5 rounded-box shadow-md bg-base-200">
    <div v-for="filter in filters" class="flex">
      <label class="label cursor-pointer">
        <input
          type="checkbox"
          class="checkbox checkbox-primary rounded-full"
          :checked="activeFilters.includes(filter)"
          @change="toggleFilter(filter)"
        />
        <span class="label-text ml-4">{{ filter }}</span>
      </label>
    </div>
  </div>
</template>
