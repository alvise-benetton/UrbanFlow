<script setup>
import {
  ClockIcon,
  MapPinIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import { ref, computed } from "vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";

const isInEdit = ref(false);

const event = defineModel("event");
const isCurrent = computed(() => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  return startDate <= now && endDate >= now;
});
</script>
<template>
  <div
    class="boxFadeIn flex flex-col gap-5 rounded-box p-5 bg-base-200 min-w-[25vw] eventDialog"
  >
    <button
      class="btn btn-square bg-base-100 absolute right-5"
      @click="event = null"
    >
      <XMarkIcon class="size-5"></XMarkIcon>
    </button>
    <div class="flex flex-col gap-4">
      <span class="font-bold text-lg">{{ event.title }}</span>
      <div class="flex items-center gap-3">
        <MapPinIcon class="size-4"></MapPinIcon>
        <ZonesPicker v-model:event="event"></ZonesPicker>
      </div>
      <div class="flex items-center gap-3">
        <ClockIcon class="size-4"></ClockIcon>
        <DatePicker v-model:event="event"></DatePicker>
      </div>
      <ChartSmallMirror v-if="!isInEdit"></ChartSmallMirror>
    </div>
    <button class="btn btn-error w-full text-white">Elimina evento</button>
  </div>
</template>
<style>
.eventDialog {
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
</style>
