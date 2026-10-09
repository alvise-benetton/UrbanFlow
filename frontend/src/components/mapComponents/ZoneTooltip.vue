<script setup>
import { ref, onMounted, onUnmounted, computed, inject } from "vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

const zone = defineModel("hoveredZone");
const events = defineModel("hoveredEvents");
const misurazioni = inject("listaMisurazioni", ref([]));

const currentEvents = computed(() => {
  if (!events.value || !Array.isArray(events.value)) return [];
  const now = new Date();
  return events.value.filter((event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return startDate <= now && now <= endDate;
  });
});

const density = computed(() => {
  if (!zone.value || !misurazioni.value) return null;
  const m = misurazioni.value.find((item) => item.zone === zone.value._id);
  return m?.data?.[0]?.density ?? null;
});

const isAlert = computed(() => {
  return (
    density.value != null &&
    zone.value?.threshold != null &&
    density.value > zone.value.threshold
  );
});

const tooltip = ref(null);
let rafId = null;

const updateMousePosition = (event) => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    if (tooltip.value) {
      tooltip.value.style.top = event.clientY + 12 + "px";
      tooltip.value.style.left = event.clientX + 14 + "px";
    }
    rafId = null;
  });
};

onMounted(() => {
  window.addEventListener("mousemove", updateMousePosition, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("mousemove", updateMousePosition);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    v-if="zone"
    id="tooltip"
    class="fixed pointer-events-none bg-base-100 p-3.5 rounded-lg flex flex-col gap-2 shadow-xl border border-base-300 z-50 min-w-56"
    ref="tooltip"
  >
    <div class="flex justify-between items-center gap-3">
      <span class="font-bold text-sm text-base-content">{{ zone.name }}</span>
      <div
        v-if="isAlert"
        class="badge badge-error badge-sm text-white gap-1 font-semibold animate-pulse"
      >
        <ExclamationTriangleIcon class="size-3" />
        Allerta
      </div>
    </div>

    <!-- Metriche densità -->
    <div class="flex items-center justify-between text-xs bg-base-200/80 p-2 rounded-lg gap-3">
      <span class="text-gray-500">Densità stimata:</span>
      <span
        class="font-mono font-bold"
        :class="isAlert ? 'text-error' : 'text-success'"
      >
        {{ density !== null ? density : '--' }} / {{ zone.threshold || '--' }} pers/m²
      </span>
    </div>

    <!-- Eventi in corso -->
    <div v-if="currentEvents.length > 0" class="flex flex-col gap-1 pt-1 border-t border-base-200">
      <small class="text-xs text-gray-500 font-medium">Eventi in corso:</small>
      <div class="flex flex-col gap-1">
        <span
          v-for="event in currentEvents"
          :key="event._id"
          class="badge badge-primary badge-outline badge-sm text-xs truncate max-w-52"
        >
          {{ event.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
#tooltip {
  animation: pop 0.15s ease-out;
}
@keyframes pop {
  0% {
    transform: scale(0.92);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
