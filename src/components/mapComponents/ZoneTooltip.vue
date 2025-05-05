<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
const zone = defineModel("hoveredZone");
const events = defineModel("hoveredEvents");
const currentEvents = computed(() => {
  const now = new Date();
  return events.value.filter((event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return startDate <= now && now <= endDate;
  });
});

const tooltip = ref(null);

const mouseX = ref(0);
const mouseY = ref(0);
const updateMousePosition = (event) => {
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
  tooltip.value.style.top = mouseY.value + "px";
  tooltip.value.style.left = mouseX.value + 10 + "px";
};
onMounted(() => {
  window.addEventListener("mousemove", updateMousePosition);
});
onUnmounted(() => {
  window.removeEventListener("mousemove", updateMousePosition);
});
</script>
<template>
  <div
    id="tooltip"
    class="animation-ping fixed bg-base-200 p-4 bg-opacity-50 rounded-md flex flex-col gap-2 shadow-md w-md"
    ref="tooltip"
  >
    <small class="font-semibold">{{ zone.name }}</small>
    <hr v-if="currentEvents.length > 0" class="border-gray-800" />
    <small v-if="currentEvents.length > 0" class="text-xs"
      >Eventi in corso:</small
    >
    <div v-if="currentEvents.length > 0" class="flex flex-col gap-2">
      <button
        v-for="event in currentEvents"
        class="bg-base-100 rounded-md btn-sm shadow-sm text-sm font-semibold"
      >
        {{ event.title }}
      </button>
    </div>
  </div>
</template>
<style scoped>
#tooltip {
  backdrop-filter: blur(7.5px);
  animation: pop 0.2s ease-out;
}
@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 50;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
