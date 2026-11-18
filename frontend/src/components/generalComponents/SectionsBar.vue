<script setup>
import { computed, inject, ref } from "vue";
import { CalendarDaysIcon, MapIcon, MapPinIcon } from "@heroicons/vue/20/solid";
import router from "../utility/router";

const model = defineModel({ default: "Mappa" });
const sectionsList = [
  { name: "Zone", icon: MapPinIcon },
  { name: "Mappa", icon: MapIcon },
  { name: "Eventi", icon: CalendarDaysIcon },
];

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
    class="menu menu-horizontal bg-base-100/95 backdrop-blur rounded-box gap-1 sm:gap-1.5 p-1.5 uf-panel-shadow border border-base-300 touch-manipulation select-none"
    role="navigation"
    aria-label="Sezioni principali"
  >
    <li v-for="section in sectionsList" :key="section.name">
      <button
        type="button"
        :class="{ active: section.name === model }"
        class="cursor-pointer min-h-10 px-3 sm:px-4 transition-transform active:scale-95 flex items-center gap-1.5 font-medium"
        :aria-current="section.name === model ? 'page' : undefined"
        @click="setActive(section.name)"
      >
        <component :is="section.icon" class="size-4 shrink-0" />
        <span>{{ section.name }}</span>
        <span
          v-if="section.name === 'Zone' && activeAlertsCount > 0"
          role="button"
          tabindex="0"
          class="badge badge-error badge-xs text-white font-bold cursor-pointer hover:scale-110 transition-transform tabular-nums"
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
