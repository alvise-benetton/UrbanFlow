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
const zonesList = inject("listaZone");
const listaMisurazioni = inject("listaMisurazioni");
const selectedZone = ref(zonesList.value.find((z)=>z._id === id.value));
watch(selectedZone, (newValue) => {
  if (newValue === null) {
    document.getElementById("searchBar").classList.remove("hidden");
  } else {
    document.getElementById("searchBar").classList.add("hidden");
  }
});

const searchTerm = defineModel("searchTerm");


const filteredZones = computed(() => {
  if (searchTerm.value == "") {
    return zonesList.value;
  } else {
    return zonesList.value.filter((z) => {
      let words = searchTerm.value.toLowerCase().trim().split(" ");
      return words.every((word) => {
        return z.name .toLowerCase().includes(word);
      });
    });
  }
});

const alertList = ref(zonesList.value.filter((z)=>z.threshold < listaMisurazioni.value.find((m)=> m.zone === z._id).data[0].density));
watch(listaMisurazioni, (newVal) => {
  //setto la lista delle allerte
  alertList.value = zonesList.value.filter((z)=>z.threshold < newVal.find((l) => l.zone === z._id).data[0].density);
  console.log("allerte:",alertList.value);
});
watch([zonesList,id],()=>{
  selectedZone.value = zonesList.value.find((z)=>z._id === id.value);
})

function getMisurazione(id) {
  const ris = listaMisurazioni.value.filter((val) => val.zone == id);
  if (!ris || ris.length == 0) return null;

  return ris;
}

function goToZone(urlId){
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
            v-if="listaMisurazioni.length > 0 && getMisurazione(zone._id)"
            class="flex gap-2"
          >
            <div class="badge">
              {{ getMisurazione(zone._id)[0].data[0].density }}
            </div>
            <div
              class="badge badge-error text-white"
              v-if="
                getMisurazione(zone._id)[0].data[0].density > zone.threshold
              "
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
              +
              {{
                Math.floor(
                  (getMisurazione(zone._id)[0].data[0].density /
                    zone.threshold) *
                    100 -
                    100
                )
              }}%
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
