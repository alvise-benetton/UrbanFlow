<script setup>
import { PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed, onBeforeMount, reactive, onMounted, inject, watch, provide } from "vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { TrashIcon } from "@heroicons/vue/24/solid";

const event = inject("singleEvent");
const listaEventi = inject("listaEventi");
const zoneList = inject("listaZone");
const localEvent = ref({...event.value});
provide("localEvent", localEvent);
const isEditing = defineModel("isEditing");
const isNewEvent = defineModel("isNewEvent");
const deleteEventModal = ref(null);
const isCurrent = computed(() => {
  const now = new Date();
  const startDate = new Date(localEvent.startDate);
  const endDate = new Date(localEvent.endDate);
  return startDate <= now && endDate >= now;
});

watch(event, (newVal) => {
  localEvent.value = { ...newVal }; // Aggiorna localZone quando zone cambia
}, { deep: true });


const abortChanges = () => {
  if (isNewEvent.value) {
    event.value = null;
  }
  localEvent.value = {...event.value};
  isEditing.value = false;
};
const saveChanges = async () => {
  if (JSON.stringify(event.value) === JSON.stringify(localEvent.value) ) {
    event.value = null;
  }else if(isNewEvent.value){
    await fetch(`http://localhost:3000/api/events/`,{
    headers:{
      "x-access-token":localStorage.getItem("JWT"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: localEvent.value.title,
      zones: localEvent.value.zones.map(z=>z._id),
      startDate: localEvent.value.startDate,
      endDate: localEvent.value.endDate
    }),
    method:"POST"}).then((res)=>{
    if(!res.ok){
      throw new Error("errore nella creazione evento");
    }
    return res;
  }).then(()=>{
    event.value = {...event.value};
    isEditing.value = false;

  })
    
  }else{ // modifica

    await fetch(`http://localhost:3000/api/events/${event.value._id}`,{
    headers:{
      "x-access-token":localStorage.getItem("JWT"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: localEvent.value.title,
      zones: localEvent.value.zones.map(z=>z._id),
      startDate: localEvent.value.startDate,
      endDate: localEvent.value.endDate
    }),
    method:"PUT"}).then((res)=>{
    if(!res.ok){
      throw new Error("errore nella modifica evento");
    }
    return res;
  }).then(()=>{
    event.value = {...localEvent.value};
    isEditing.value = false;
  })

};
const deleteEvent = async() => {

  await fetch(`http://localhost:3000/api/events/${event.value._id}`,{
    headers:{
      "x-access-token":localStorage.getItem("JWT"),
    },
    method:"DELETE"}).then((res)=>{
    if(!res.ok){
      throw new Error("errore nell'eliminazione evento");
    }
    return res;
  }).then(()=>{
    listaEventi.value = listaEventi.value.filter(e=>e._id != event.value._id); 
    event.value = null;
  })
};

onBeforeMount(() => {
  if (event.value.title == "") {
    isEditing.value = true;
    isNewEvent.value = true;
  }
  });
}

</script>
<template>
  <div>
    <div class="eventDialog flex flex-col bg-base-100 p-5 rounded-box gap-5 shadow-md">
      <div class="flex flex-row gap-2 items-center absolute" v-if="isCurrent">
        <div class="indicator absolute opacity-75 animate-ping"></div>
        <div class="indicator scale-75"></div>
        <span class="text-red-500">LIVE</span>
      </div>
      <div
        class="flex flex-row justify-end gap-2 bg-base-100"
        v-if="!isEditing && !isNewEvent"
      >
        <!-- Modifica evento -->
        <button class="btn btn-square btn-sm" @click="isEditing = true; isNewEvent = false, localEvent = {...event};console.log(localEvent)">
          <PencilIcon class="size-4"></PencilIcon>
        </button>
        <!-- Chiudi card evento -->
        <button class="btn btn-square btn-sm" @click="event = null">
          <XMarkIcon class="size-4"></XMarkIcon>
        </button>
        <!-- Elimina evento -->
        <button
          class="btn btn-square btn-sm btn-error text-white"
          @click="deleteEventModal.showModal()"
        >
          <TrashIcon class="size-4"></TrashIcon>
        </button>
      </div>
      <div class="flex flex-row justify-end gap-2" v-else>
        <!-- Annulla modifiche -->
        <button class="btn btn-sm btn-error text-white" @click="abortChanges()">
          Annulla
        </button>
        <!-- Salva modifiche -->
        <button
          class="btn btn-sm btn-primary"
          :disabled="
            JSON.stringify(event) == JSON.stringify(localEvent) ||
            localEvent.title == ''
          "
          @click="saveChanges()"
        >
          Salva
        </button>
      </div>
      <!-- Titolo evento -->
      <div>
        <span
          v-if="!isEditing && !isNewEvent"
          class="titleSpan font-bold card-title w-full"
          >{{ localEvent.title }}
        </span>

        <input
          v-else
          type="text"
          v-model="localEvent.title"
          class="font-bold card-title pb-2 border-b-2 border-primary text-primary text-wrap outline-none w-full"
          placeholder="Aggiungi un titolo..."
        />
      </div>
      <!-- Zone evento -->
      <ZonesPicker v-if="localEvent.zones"
        v-model:isEditing="isEditing"
      ></ZonesPicker>
      <!-- Data evento -->
      <DatePicker
        v-if="localEvent"
        v-model:event="localEvent"
        v-model:isEditing="isEditing"
      ></DatePicker>
      <!-- Dati storici -->
      <ChartSmallMirror
        v-if="!isNewEvent"
        v-model:event="localEvent"
        v-model:zones="zoneList"
        :class="{
          'opacity-50 grayscale-[50%] pointer-events-none': isEditing,
        }"
      ></ChartSmallMirror>
    </div>
    <dialog class="modal" ref="deleteEventModal">
      <div class="modal-box flex flex-col gap-2 items-center w-fit">
        <p class="font-bold">Elimina evento?</p>
        <div class="flex flex-col items-center">
          <p>Sei sicuro di voler eliminare l'evento?</p>
          <p>Non puoi annullare l'azione</p>
        </div>
        <form class="flex flex-row gap-2 w-full modal-action" method="dialog">
          <button class="btn btn-primary flex-grow">Annulla</button>
          <button class="btn btn-error text-white flex-grow" @click="deleteEvent()">
            Elimina
          </button>
        </form>
      </div>
    </dialog>
  </div>
</template>
<style>
.eventDialog {
  min-width: 250pt;
  width: 25vw;
  max-width: 30vw;
  max-height: calc(100vh - 1.25rem * 2);
  overflow: scroll;
}
.indicator {
  @apply w-3 h-3 rounded-full bg-red-500;
}
</style>
