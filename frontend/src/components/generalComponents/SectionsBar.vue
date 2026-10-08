<script setup>
import { computed, inject, ref } from "vue";
import router from "../utility/router";

const model = defineModel({ default: "Mappa" });
const sectionsList = ref(["Zone", "Mappa", "Eventi"]);

const listaZone = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));

const activeAlertsCount = computed(() => {
  if (!listaZone?.value || !listaMisurazioni?.value) return 0;
  return listaZone.value.filter((zone) => {
    const m = listaMisurazioni.value.find((item) => item.zone === zone._id);
    const density = m?.data?.[0]?.density ?? 0;
    return zone.threshold && density > zone.threshold;
  }).length;
});

const setActive = (section) => {
  model.value = section;
  router.push(`/${section}`);
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.classList.remove("hidden");
  }
};
</script>

<template>
  <div class="bg-base-100 border border-base-300 shadow-md rounded-box p-1.5 flex gap-1 items-center z-30 select-none">
    <button
      v-for="section in sectionsList"
      :key="section"
      type="button"
      class="btn btn-sm transition-all"
      :class="section === model ? 'btn-primary text-white font-semibold' : 'btn-ghost text-base-content hover:bg-base-200'"
      @click="setActive(section)"
    >
      <span>{{ section }}</span>
      <span
        v-if="section === 'Zone' && activeAlertsCount > 0"
        class="badge badge-error badge-xs text-white font-bold ml-1"
        title="Allerte attive"
      >
        {{ activeAlertsCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
</style>
