<script setup>
// import {
//   ArrowUpOnSquareIcon,
//   CalendarDateRangeIcon,
//   PlusIcon
// } from "@heroicons/vue/24/solid";
import { ref } from "vue";
const events = ref(null);
const liveEvents = ref([
  {
    title: "Fashion week",
  },
  {
    title: "Mercatini di Natale",
  },
]);
const notLiveEvents = ref([
  {
    title: "Autumnus",
  },
  { title: "Il festival dell'economia" },
]);
</script>
<template>
  <div class="flex flex-col gap-5 rounded-box p-5 bg-base-200 w-full">
    <!-- <div class="flex items-end gap-3">
      <button class="btn btn-square btn-sm btn-neutral">
        <PlusIcon class="size-5"></PlusIcon>
      </button>
      <button class="btn btn-square btn-sm btn-neutral">
        <CalendarDateRangeIcon class="size-5"></CalendarDateRangeIcon>
      </button>
      <button class="btn btn-square btn-sm btn-neutral">
        <ArrowUpOnSquareIcon class="size-5"></ArrowUpOnSquareIcon>
      </button>
    </div> -->
    <div v-if="liveEvents.length > 0" class="flex flex-col gap-3">
      <small>Eventi in corso:</small>
      <a
        v-for="ev in liveEvents"
        class="pt-3 pb-3 pl-5 pr-5 bg-base-100 rounded-lg hover:shadow-md transition-all"
      >
        {{ ev.title }}
      </a>
    </div>
    <div v-if="notLiveEvents.length > 0" class="flex flex-col gap-3">
      <small>Eventi terminati:</small>
      <a
        v-for="ev in notLiveEvents"
        class="pt-3 pb-3 pl-5 pr-5 bg-base-100 rounded-lg"
      >
        {{ ev.title }}
      </a>
    </div>
  </div>
</template>
