<script setup>
import { computed, inject, ref } from "vue";
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";

const listaZone = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));

const isCollapsed = ref(false);

const activeAlertsCount = computed(() => {
  if (!listaZone?.value || !listaMisurazioni?.value) return 0;
  return listaZone.value.filter((zone) => {
    const m = listaMisurazioni.value.find((item) => item.zone === zone._id);
    const density = m?.data?.[0]?.density ?? 0;
    return zone.threshold && density > zone.threshold;
  }).length;
});

const legendLevels = [
  { label: "< 50% (Basso)", color: "rgb(47, 235, 14)", desc: "Normale" },
  { label: "50-70% (Medio)", color: "rgb(131, 243, 13)", desc: "Moderato" },
  { label: "70-100% (Alto)", color: "rgb(255, 239, 2)", desc: "Elevato" },
  { label: "> 100% (Critico)", color: "rgb(255, 121, 0)", desc: "Attenzione" },
  { label: "> 150% (Soglia)", color: "rgb(255, 0, 0)", desc: "Allerta" },
];
</script>

<template>
  <div class="map-legend bg-base-100 border border-base-300 shadow-md rounded-box p-3 text-xs w-64 select-none">
    <div class="flex justify-between items-center cursor-pointer" @click="isCollapsed = !isCollapsed">
      <div class="flex items-center gap-1.5 font-bold text-base-content">
        <span>Densità Pedonale</span>
        <span
          v-if="activeAlertsCount > 0"
          class="badge badge-error badge-xs text-white font-semibold gap-1"
          title="Zone che superano la soglia"
        >
          <ExclamationTriangleIcon class="size-3" />
          {{ activeAlertsCount }}
        </span>
        <span
          v-else
          class="badge badge-success badge-xs text-white font-semibold"
        >
          OK
        </span>
      </div>
      <button class="btn btn-ghost btn-xs btn-circle" :aria-label="isCollapsed ? 'Espandi legenda' : 'Collassa legenda'">
        <ChevronUpIcon v-if="isCollapsed" class="size-4" />
        <ChevronDownIcon v-else class="size-4" />
      </button>
    </div>

    <div v-show="!isCollapsed" class="mt-2.5 flex flex-col gap-2">
      <div class="flex flex-col gap-1.5">
        <div
          v-for="item in legendLevels"
          :key="item.label"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-3.5 h-3.5 rounded-sm border border-black/10 shrink-0"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="text-gray-600 font-mono text-[11px]">{{ item.label }}</span>
          </div>
          <span class="text-[11px] font-medium text-gray-500">{{ item.desc }}</span>
        </div>
      </div>

      <div class="pt-2 border-t border-base-200 flex items-center justify-between text-[11px] text-gray-500">
        <span>Stato monitoraggio:</span>
        <span v-if="activeAlertsCount > 0" class="font-semibold text-error">
          {{ activeAlertsCount }} {{ activeAlertsCount === 1 ? 'allerta attiva' : 'allerte attive' }}
        </span>
        <span v-else class="font-semibold text-success">
          Tutte nella soglia
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-legend {
  z-index: 400;
}
</style>
