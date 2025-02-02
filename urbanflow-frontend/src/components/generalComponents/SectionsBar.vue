<script setup>
import { ref } from "vue";
const model = defineModel({ default: "Mappa" });
const sectionsList = ref(["Zone", "Mappa", "Eventi"]);
const setActive = (section) => {
  model.value = section;
  window.location.hash = section;
  document.getElementById("searchBar").classList.remove("hidden");
};
</script>
<template>
  <ul class="menu menu-horizontal bg-base-200 rounded-box gap-2 pl-2.5 pr-2.5">
    <li v-for="section in sectionsList" :key="section">
      <a
        :class="{ active: section === model }"
        class="cursor-pointer"
        @click="setActive(section)"
      >
        {{ section }}
      </a>
    </li>
  </ul>
</template>
<style scoped>
a.active {
  transform: scale(1.1);
}
</style>
