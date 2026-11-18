<script setup>
import { computed, inject, ref } from "vue";
import router from "../utility/router";

const model = defineModel({ default: "Mappa" });
const sectionsList = ref(["Zone", "Mappa", "Eventi"]);

const listaZone = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));
const zoneTabFocus = inject("zoneTabFocus", ref("zones"));

const activeAlertsCount = computed(() => {
  if (!listaZone?.value || !listaMisurazioni?.value) return 0;
  return listaZone.value.filter((zone) => {
    const m = listaMisurazioni.value.find((item) => String(item.zone) === String(zone._id));
    const density = m?.data?.[0]?.density ?? 0;
    return zone.threshold && density > zone.threshold;
  }).length;
});

const setActive = (section) => {
  model.value = section;
  router.push(`/${section}`);
};

const openAlertsTab = () => {
  zoneTabFocus.value = "alerts";
  model.value = "Zone";
  router.push("/Zone");
};
</script>

<template>
  <ul
    class="menu menu-horizontal bg-base-200 rounded-box gap-1.5 sm:gap-2 px-2.5 shadow-md touch-manipulation select-none"
    role="navigation"
    aria-label="Sezioni principali"
  >
    <li v-for="section in sectionsList" :key="section">
      <button
        type="button"
        :class="{ active: section === model }"
        class="cursor-pointer min-h-10 px-3.5 sm:px-4 transition-transform active:scale-95 flex items-center gap-1.5"
        :aria-current="section === model ? 'page' : undefined"
        @click="setActive(section)"
      >
        <span>{{ section }}</span>
        <span
          v-if="section === 'Zone' && activeAlertsCount > 0"
          role="button"
          tabindex="0"
          class="badge badge-error badge-xs text-white font-bold cursor-pointer hover:scale-110 transition-transform"
          title="Vai alle allerte attive"
          :aria-label="`Vai alle ${activeAlertsCount} allerte attive`"
          @click.stop="openAlertsTab"
          @keydown.enter.stop="openAlertsTab"
        >
          {{ activeAlertsCount }}
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
button.active {
  transform: scale(1.06);
}
@media (prefers-reduced-motion: reduce) {
  button.active {
    transform: none;
  }
}
</style>
