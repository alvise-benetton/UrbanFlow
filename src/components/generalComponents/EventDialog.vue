<script setup>
import { PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed, onBeforeMount, reactive, onMounted, inject, watch, provide } from "vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { TrashIcon } from "@heroicons/vue/24/solid";
import router from "../utility/router";

/* const event = inject("singleEvent"); */
const urlId = defineModel("id");
const listaEventi = inject("listaEventi");
const zoneList = inject("listaZone");
const event = ref(listaEventi.value.find((e)=>e._id === urlId.value));
const localEvent = ref({...event.value});
const isEditing = defineModel("isEditing");
const deleteEventModal = ref(null);
const isCurrent = computed(() => {
  const now = new Date();
  const startDate = new Date(localEvent.startDate);
  const endDate = new Date(localEvent.endDate);
  return startDate <= now && endDate >= now;
});

const API_URL = import.meta.env.VITE_API_URL;
const notyf = inject("notyf");

watch([listaEventi, urlId], () => {
  event.value = listaEventi.value.find((e) => e._id === urlId.value);
});

watch(event, (newVal) => { 
  localEvent.value = { ...newVal }; // Aggiorna localZone quando zone cambia
}, { deep: true });

const abortChanges = () => {
  if (urlId === 'nuovo'){
    event.value = null;
  }
  localEvent.value = {...event.value};
  isEditing.value = false;
  router.back();
};
const saveChanges = async () => {
  if (JSON.stringify(event.value) === JSON.stringify(localEvent.value) ) {
    event.value = null;
  }else if(urlId === 'nuovo'){ // nuovo evento
      await fetch(`${API_URL}api/events/`,{
      headers:{
        "x-access-token":localStorage.getItem("JWT"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: localEvent.value.title,
        zones: localEvent.value.zones.filter(z=>z!==null).map(z=>z._id),
        startDate: localEvent.value.startDate,
        endDate: localEvent.value.endDate
      }),
      method:"POST"}).then((res)=>{
      if(!res.ok){
        notyf.error("Errore nella creazione dell'evento " + res.err);
        throw new Error("errore nella creazione evento");
      }
      return res;
    }).then(()=>{
      notyf.success("Evento creato con successo!");
      event.value = {...event.value};
      isEditing.value = false;
      router.push("/Eventi/"+res.body._id);
    })
    
  }else{ // modifica

    await fetch(`${API_URL}/api/events/${event.value._id}`,{
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
      notyf.error("Errore nella modifica dell'evento " + res.err);
      throw new Error("errore nella modifica evento");
    }
    return res;
  }).then(()=>{
    notyf.success("Evento modificato con successo!");
    event.value = {...localEvent.value};
    isEditing.value = false;
  })

};
const deleteEvent = async() => {

  await fetch(`${API_URL}/api/events/${event.value._id}`,{
    headers:{
      "x-access-token":localStorage.getItem("JWT"),
    },
    method:"DELETE"}).then((res)=>{
    if(!res.ok){
      notyf.error("Errore nella eliminazione dell'evento " + res.err);
      throw new Error("errore nell'eliminazione evento");
    }
    return res;
  }).then(()=>{
    notyf.success("Evento eliminato con successo!");
    listaEventi.value = listaEventi.value.filter(e=>e._id != event.value._id); 
    event.value = null;
  })
};

  onBeforeMount(() => {
    if (urlId === 'nuovo') {
      localEvent.value = {
        title: "",
        zones: [],
        startDate: new Date(),
        endDate: new Date(),
      }
    }
  });

}


function closeEvent(){
  event.value = null;
  router.back();
 
  
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
        v-if="!isEditing && urlId!== 'nuovo'"
      >
        <!-- Modifica evento -->
        <button class="btn btn-square btn-sm" @click="isEditing = true; localEvent = {...event}">
          <PencilIcon class="size-4"></PencilIcon>
        </button>
        <!-- Chiudi card evento -->
        <button class="btn btn-square btn-sm" @click="closeEvent()">
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
          :disabled=" JSON.stringify(event) === JSON.stringify(localEvent) || localEvent.title == '' "
          @click="saveChanges()"
        >
          Salva
        </button>
      </div>
      <!-- Titolo evento -->
      <div>
        <span
          v-if="!isEditing && urlId !== 'nuovo'"
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
        v-model:event="localEvent"
      ></ZonesPicker>
      <!-- Data evento -->
      <DatePicker
        v-if="localEvent"
        v-model:event="localEvent"
        v-model:isEditing="isEditing"
      ></DatePicker>
      <!-- Dati storici -->
      <ChartSmallMirror
        v-if="urlId !== 'nuovo'"
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
