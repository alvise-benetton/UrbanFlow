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
  <nav
    class="inline-flex items-center bg-base-100/95 backdrop-blur rounded-box p-1.5 gap-1.5 uf-panel-shadow border border-base-300 touch-manipulation select-none"
    role="navigation"
    aria-label="Sezioni principali"
  >
    <button
      v-for="section in sectionsList"
      :key="section.name"
      type="button"
      class="h-10 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-colors active:scale-95"
      :class="
        section.name === model
          ? 'bg-neutral text-neutral-content shadow-sm'
          : 'text-base-content/75 hover:text-base-content hover:bg-base-200/70'
      "
      :aria-current="section.name === model ? 'page' : undefined"
      @click="setActive(section.name)"
    >
      <component :is="section.icon" class="size-4 shrink-0" />
      <span>{{ section.name }}</span>
      <span
        v-if="section.name === 'Zone' && activeAlertsCount > 0"
        role="button"
        tabindex="0"
        class="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-error text-white text-xs font-bold leading-none inline-flex items-center justify-center cursor-pointer hover:scale-110 transition-transform tabular-nums"
        title="Vai alle allerte attive"
        :aria-label="`Vai alle ${activeAlertsCount} allerte attive`"
        @click.stop="openAlertsTab"
        @keydown.enter.stop="openAlertsTab"
      >
        {{ activeAlertsCount }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
</style>
