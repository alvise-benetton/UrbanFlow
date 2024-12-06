<script setup>
import { computed } from "vue";
const eventsData = defineModel("events");
const currentEvents = computed(() => {
  const now = new Date();
  return eventsData.value.filter((ev) => {
    const startDate = new Date(ev.startDate);
    const endDate = new Date(ev.endDate);
    return startDate <= now && endDate >= now;
  });
});
const otherEvents = computed(() => {
  const now = new Date();
  return eventsData.value.filter((ev) => {
    const startDate = new Date(ev.startDate);
    const endDate = new Date(ev.endDate);
    return startDate > now || endDate < now;
  });
});
</script>
<template>
  <div class="flex flex-col gap-5 rounded-box p-5 bg-base-200 w-full">
    <div v-if="currentEvents.length > 0" class="flex flex-col gap-3">
      <small>Eventi in corso:</small>
      <a
        v-for="currentEvents in currentEvents"
        class="pt-3 pb-3 pl-5 pr-5 bg-base-100 rounded-lg"
      >
        {{ currentEvents.title }}
      </a>
    </div>
    <div v-if="otherEvents.length > 0" class="flex flex-col gap-3">
      <small>Prossimi eventi:</small>
      <a
        v-for="otherEvent in otherEvents"
        class="pt-3 pb-3 pl-5 pr-5 bg-base-100 rounded-lg"
      >
        {{ otherEvent.title }}
      </a>
    </div>
  </div>
</template>
