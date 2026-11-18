<script setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { inject, provide, reactive, ref, watch,computed } from "vue";
import ZoneDialog from "./ZoneDialog.vue";
import router from "../utility/router";



const inFocus = reactive({
  zones: true,
  alerts: false,
});

const id = defineModel("id");
const zonesList = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));
const selectedZone = ref(zonesList?.value ? zonesList.value.find((z) => z._id === id.value) : null);

watch(selectedZone, (newValue) => {
  const searchBar = document.getElementById("searchBar");
  if (!searchBar) return;
  if (newValue === null) {
    searchBar.classList.remove("hidden");
  } else {
    searchBar.classList.add("hidden");
  }
});

const searchTerm = defineModel("searchTerm");

const filteredZones = computed(() => {
  if (!zonesList?.value) return [];
  if (!searchTerm.value) {
    return zonesList.value;
  } else {
    let words = searchTerm.value.toLowerCase().trim().split(" ");
    return zonesList.value.filter((z) => {
      return words.every((word) => {
        return (z.name || "").toLowerCase().includes(word);
      });
    });
  }
});

const alertList = computed(() => {
  if (!zonesList?.value || !listaMisurazioni?.value) return [];
  return zonesList.value.filter((z) => {
    const density = getDensity(z._id);
    return density != null && density > z.threshold;
  });
});

watch([zonesList, id], () => {
  selectedZone.value = zonesList?.value ? zonesList.value.find((z) => z._id === id.value) : null;
});

function getMisurazione(zoneId) {
  if (!listaMisurazioni?.value) return null;
  const ris = listaMisurazioni.value.filter((val) => val.zone == zoneId);
  if (!ris || ris.length === 0) return null;
  return ris;
}

function getDensity(zoneId) {
  const m = getMisurazione(zoneId);
  return m?.[0]?.data?.[0]?.density ?? null;
}

function getOverThresholdPercent(zone) {
  const density = getDensity(zone._id);
  if (density == null || !zone.threshold) return 0;
  return Math.floor((density / zone.threshold) * 100 - 100);
}

function goToZone(urlId) {
  router.push(`/Zone/${urlId}`);
}

const visible = ref(false);

const changeFocusedList = (z, a) => {
  inFocus.zones = z;
  inFocus.alerts = a;
};
</script>
<template>
  <div class="dialog flex flex-col">
    <div
      class="flex flex-col gap-5 rounded-box p-5 bg-base-200 shadow-md overflow-y-scroll"
      v-if="!id"
    >
      <!-- Selettore Zone-Allerte -->
      <ul
        class="menu menu-horizontal bg-base-100 rounded-xl flex gap-1 w-fit m-auto"
      >
        <li @click="changeFocusedList(true, false)">
          <a class="text-gray-400" :class="{ active: inFocus.zones }">Zone</a>
        </li>
        <li @click="changeFocusedList(false, true)">
          <a class="text-gray-400" :class="{ active: inFocus.alerts }"
            >Allerte</a
          >
        </li>
      </ul>
      <!-- Lista zone -->
      <div
        v-if="inFocus.zones && zonesList.length > 0"
        class="flex flex-col gap-3"
      >
      
        <button
          class="btn bg-base-100 w-full flex justify-between"
          v-for="zone in filteredZones"
          @click="goToZone(zone._id)"
        >
          <span>{{ zone.name }}</span>
          <div
            v-if="getDensity(zone._id) !== null"
            class="flex gap-2"
          >
            <div class="badge">
              {{ getDensity(zone._id) }}
            </div>
            <div
              class="badge badge-error text-white"
              v-if="getDensity(zone._id) > zone.threshold"
            >
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
          v-for="zone in alertList"
          @click="goToZone(zone._id)"
        >
          <span class="text-white">{{ zone.name }}</span>

          <div class="flex gap-2">
            <div class="badge">
              +{{ getOverThresholdPercent(zone) }}%
            </div>
            <div class="badge badge-error text-white">
              <ExclamationTriangleIcon class="size-4"></ExclamationTriangleIcon>
            </div>
          </div>
        </button>
      </div>
    </div>
    <div v-else>
      <ZoneDialog v-model:selectedZone="selectedZone"></ZoneDialog>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 7rem);
  overflow: scroll;
}
</style>
