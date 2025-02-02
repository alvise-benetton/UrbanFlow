<script setup>
import {
  CalendarDateRangeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PlusIcon,
} from "@heroicons/vue/20/solid";
import { computed, reactive, ref, watch } from "vue";
import ZoneDialog from "./ZoneDialog.vue";
const inFocus = reactive({
  zones: true,
  alerts: false,
});
const changeFocusedList = (z, a) => {
  inFocus.zones = z;
  inFocus.alerts = a;
};
</script>
<template>
  <div class="dialog flex flex-col gap-5 rounded-box p-5 bg-base-200 shadow-md">
    <!-- Selettore Zone-Allerte -->
    <ul
      class="menu menu-horizontal bg-base-100 rounded-xl flex gap-1 w-fit m-auto"
    >
      <li @click="changeFocusedList(true, false)">
        <a class="text-gray-400" :class="{ active: inFocus.zones }">Zone</a>
      </li>
      <li @click="changeFocusedList(false, true)">
        <a class="text-gray-400" :class="{ active: inFocus.alerts }">Allerte</a>
      </li>
    </ul>
    <!-- Lista zone -->
    <div v-if="inFocus.zones" class="flex flex-col">
      <button class="btn bg-base-100 w-full flex justify-between">
        <span>Piazza del duomo</span>
        <div class="flex gap-2">
          <div class="badge">66</div>
          <div class="badge badge-error text-white">
            <ExclamationTriangleIcon class="size-4"></ExclamationTriangleIcon>
          </div>
        </div>
      </button>
    </div>
    <!-- Lista allerte -->
    <div v-if="inFocus.alerts" class="flex flex-col gap-2">
      <small>In tempo reale:</small>
      <button
        class="btn w-full flex justify-between bg-red-600 hover:bg-red-800"
      >
        <span class="text-white">Piazza del duomo</span>
        <div class="flex gap-2">
          <div class="badge">+34%</div>
          <div class="badge badge-error text-white">
            <ExclamationTriangleIcon class="size-4"></ExclamationTriangleIcon>
          </div>
        </div>
      </button>
      <small>Nelle ultime 24h:</small>
      <button
        class="btn w-full flex justify-between bg-red-400 hover:bg-red-700"
      >
        <span class="text-white">Stazione FS</span>
        <div class="flex gap-2">
          <div class="badge">+34%</div>
        </div>
      </button>
    </div>
  </div>
  <ZoneDialog></ZoneDialog>
</template>
<style scoped>
.dialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
</style>
