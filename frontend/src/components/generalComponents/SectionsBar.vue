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
  <!-- Mobile segmented bar (< md) / Desktop Apple Maps sidebar navigation list (md:) -->
  <nav
    class="grid grid-cols-3 md:flex md:flex-col w-full bg-base-200/90 md:bg-transparent p-1 md:p-0 rounded-xl md:rounded-none gap-1 border md:border-0 border-base-300/50 touch-manipulation select-none"
    role="navigation"
    aria-label="Sezioni principali"
  >
    <button
      v-for="section in sectionsList"
      :key="section.name"
      type="button"
      class="h-9 md:h-[46px] px-2 md:px-2.5 rounded-lg md:rounded-[12px] inline-flex items-center justify-center md:justify-start gap-1.5 md:gap-3 text-sm transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap"
      :class="
        section.name === model
          ? 'bg-base-100 md:bg-base-content/[0.06] text-base-content shadow-sm md:shadow-none font-semibold'
          : 'text-base-content/70 hover:text-base-content md:hover:bg-base-content/[0.04] font-medium'
      "
      :aria-current="section.name === model ? 'page' : undefined"
      @click="setActive(section.name)"
    >
      <span
        class="inline-flex items-center justify-center shrink-0 md:w-[30px] md:h-[30px] md:rounded-[9px] transition-colors"
        :class="
          section.name === model
            ? 'md:bg-primary md:text-white md:shadow-sm'
            : 'md:bg-base-200 md:text-base-content/70'
        "
      >
        <component :is="section.icon" class="size-4 shrink-0" />
      </span>
      <span class="md:flex-1 md:text-left">{{ section.name }}</span>
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
