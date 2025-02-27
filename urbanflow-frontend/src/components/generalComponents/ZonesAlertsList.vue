<script setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { computed, inject, provide, reactive, ref, watch, watchEffect } from "vue";
import ZoneDialog from "./ZoneDialog.vue";
//import eventBus from "@/components/utility/eventBus";

//const zonesList = defineProps(['zone'])

const inFocus = reactive({
  zones: true,
  alerts: false,
});

const zonesList = inject("listaZone");
const listaMisurazioni = inject("listaMisurazioni");
const selectedZone = ref(null);
provide("selectedZone",selectedZone);
const alertList = ref([]);
watch(listaMisurazioni, ()=>{ //setto la lista delle allerte
  alertList.value = zonesList.value.filter((z)=>z.threshold < listaMisurazioni.value.find((l)=>l.zone === z._id).data[0].density );
})

function getMisurazione(id){

  const ris = listaMisurazioni.value.filter((val)=>val.zone == id)
  if(!ris || ris.length == 0)
    return null

  return ris;

}


const visible = ref(false);

const changeFocusedList = (z, a) => {
  inFocus.zones = z;
  inFocus.alerts = a;
};

</script>
<template>
  <div class="dialog flex flex-col">
    <div class="flex flex-col gap-5 rounded-box p-5 bg-base-200 shadow-md" style="max-height: 30vh; overflow-y: scroll; overflow-x: hidden;" v-if="!selectedZone">
      <!-- Selettore Zone-Allerte -->
      <ul class="menu menu-horizontal bg-base-100 rounded-xl flex gap-1 w-fit m-auto" >
        <li @click="changeFocusedList(true, false)">
          <a class="text-gray-400" :class="{ active: inFocus.zones }">Zone</a>
        </li>
        <li @click="changeFocusedList(false, true)">
          <a class="text-gray-400" :class="{ active: inFocus.alerts }">Allerte</a>
        </li>
      </ul>
      <!-- Lista zone -->
      <div v-if="inFocus.zones && zonesList.length > 0" class="flex flex-col gap-3 ">
        <button
          class="btn bg-base-100 w-full flex justify-between"
          v-for="zone in zonesList"
          @click="selectedZone = zone">
          <span>{{ zone.name }}</span>
          <div v-if="listaMisurazioni.length > 0 && getMisurazione(zone._id)" class="flex gap-2">
            <div class="badge">{{ getMisurazione(zone._id)[0].data[0].density }}</div>
            <div class="badge badge-error text-white" v-if="getMisurazione(zone._id)[0].data[0].density  > zone.threshold">
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
          @click="selectedZone = zone" >
          
          <span class="text-white">{{ zone.name }}</span>

          <div class="flex gap-2">
            <div class="badge"> + {{ Math.floor(getMisurazione(zone._id)[0].data[0].density / zone.threshold * 100 - 100)}}%</div>
            <div class="badge badge-error text-white">
              <ExclamationTriangleIcon class="size-4"></ExclamationTriangleIcon>
            </div>
          </div>
        </button>

      </div>
    </div>
    <div v-else >
      <ZoneDialog ></ZoneDialog>
    </div>
  </div>
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
