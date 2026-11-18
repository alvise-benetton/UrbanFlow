<script setup>
import { PencilIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed, inject, watch } from "vue";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { TrashIcon } from "@heroicons/vue/24/solid";
import router, { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const urlId = defineModel("id");
const listaEventi = inject("listaEventi", ref([]));
const zoneList = inject("listaZone", ref([]));
const loadEvents = inject("loadEvents", null);
const notyf = inject("notyf");
const isEditing = defineModel("isEditing");

const event = ref(null);
const localEvent = ref({});

function initEventFromUrl() {
  if (!urlId.value) return;
  if (urlId.value === "nuovo") {
    event.value = {
      title: "",
      zones: [],
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
    localEvent.value = { ...event.value };
    isEditing.value = true;
  } else {
    const found = (listaEventi.value || []).find((e) => e._id === urlId.value) || null;
    event.value = found;
    localEvent.value = found ? { ...found } : {};
  }
}

initEventFromUrl();

const deleteEventModal = ref(null);
const isCurrent = computed(() => {
  if (!localEvent.value?.startDate || !localEvent.value?.endDate) return false;
  const now = new Date();
  const startDate = new Date(localEvent.value.startDate);
  const endDate = new Date(localEvent.value.endDate);
  return startDate <= now && endDate >= now;
});

watch([listaEventi, urlId], () => {
  initEventFromUrl();
});

const abortChanges = () => {
  if (urlId.value === "nuovo") {
    event.value = null;
    isEditing.value = false;
    router.push("/Eventi");
    return;
  }
  localEvent.value = event.value ? { ...event.value } : {};
  isEditing.value = false;
};

const saveChanges = async () => {
  const title = (localEvent.value?.title || "").trim();
  if (!title) {
    notyf?.error("Inserisci un titolo per l'evento");
    return;
  }
  if (
    localEvent.value?.startDate &&
    localEvent.value?.endDate &&
    new Date(localEvent.value.startDate) > new Date(localEvent.value.endDate)
  ) {
    notyf?.error("La data di fine deve essere successiva a quella di inizio");
    return;
  }

  const normalizedZones = (localEvent.value?.zones || [])
    .filter(Boolean)
    .map((z) => z._id || z);

  if (urlId.value !== "nuovo" && JSON.stringify(event.value) === JSON.stringify(localEvent.value)) {
    isEditing.value = false;
    return;
  }

  if (urlId.value === "nuovo") {
    try {
      const res = await authFetch(`${API_URL}/api/events/`, {
        headers: {
          "x-access-token": localStorage.getItem("JWT"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          zones: normalizedZones,
          startDate: localEvent.value.startDate,
          endDate: localEvent.value.endDate,
        }),
        method: "POST",
      });
      if (!res.ok) {
        notyf?.error("Errore nella creazione dell'evento");
        return;
      }
      if (loadEvents) {
        await loadEvents();
      }
      notyf?.success("Evento creato con successo!");
      isEditing.value = false;
      router.push("/Eventi");
    } catch (err) {
      notyf?.error("Errore nella creazione dell'evento");
    }
  } else {
    try {
      const res = await authFetch(`${API_URL}/api/events/${event.value._id}`, {
        headers: {
          "x-access-token": localStorage.getItem("JWT"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          zones: normalizedZones,
          startDate: localEvent.value.startDate,
          endDate: localEvent.value.endDate,
        }),
        method: "PUT",
      });
      if (!res.ok) {
        notyf?.error("Errore nella modifica dell'evento");
        return;
      }
      if (loadEvents) {
        await loadEvents();
      } else {
        event.value = { ...localEvent.value };
      }
      notyf?.success("Evento modificato con successo!");
      isEditing.value = false;
    } catch (err) {
      notyf?.error("Errore nella modifica dell'evento");
    }
  }
};

async function deleteEvent() {
  try {
    const res = await authFetch(`${API_URL}/api/events/${event.value._id}`, {
      headers: {
        "x-access-token": localStorage.getItem("JWT"),
      },
      method: "DELETE",
    });
    if (!res.ok) {
      notyf?.error("Errore nella eliminazione dell'evento");
      return;
    }
    notyf?.success("Evento eliminato con successo!");
    listaEventi.value = listaEventi.value.filter((e) => e._id != event.value._id);
    event.value = null;
    router.push("/Eventi");
  } catch (err) {
    notyf?.error("Errore nella eliminazione dell'evento");
  }
}

function closeEvent() {
  isEditing.value = false;
  router.push("/Eventi");
}
</script>

<template>
  <div class="md:h-full md:min-h-0 md:flex md:flex-col">
    <div class="w-full max-h-[56dvh] md:max-h-none md:flex-1 overflow-y-auto overscroll-contain flex flex-col [&>*]:shrink-0 gap-3.5 relative pr-0.5">
      <!-- Intestazione sticky con titolo e azioni -->
      <div class="sticky top-0 bg-base-100/85 backdrop-blur-md z-10 pb-2.5 border-b border-base-300/60 flex items-center justify-between gap-2">
        <span
          v-if="!isEditing && urlId !== 'nuovo'"
          class="titleSpan font-bold text-xl leading-tight card-title truncate"
        >
          {{ localEvent.title }}
        </span>
        <input
          v-else
          type="text"
          v-model="localEvent.title"
          class="font-bold text-base md:text-lg pb-1 border-b-2 border-primary text-primary outline-none w-full bg-transparent min-w-0"
          placeholder="Aggiungi un titolo..."
        />

        <div
          class="flex flex-row items-center gap-1.5 shrink-0"
          v-if="!isEditing && urlId !== 'nuovo'"
        >
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-base-content/10 hover:bg-base-content/15 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Modifica evento"
            title="Modifica evento"
            @click="isEditing = true; localEvent = { ...event }"
          >
            <PencilIcon class="size-4" />
          </button>
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-base-content/10 hover:bg-base-content/15 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Chiudi scheda evento"
            @click="closeEvent()"
          >
            <XMarkIcon class="size-4" />
          </button>
        </div>
        <div class="flex flex-row items-center gap-1.5 shrink-0" v-else>
          <button type="button" class="btn btn-sm h-auto min-h-9 py-2 px-3 btn-ghost" @click="abortChanges()">
            Annulla
          </button>
          <button
            type="button"
            class="btn btn-sm h-auto min-h-9 py-2 px-3 btn-primary text-white"
            :disabled="(urlId !== 'nuovo' && JSON.stringify(event) === JSON.stringify(localEvent)) || !localEvent.title?.trim()"
            @click="saveChanges()"
          >
            Salva
          </button>
        </div>
      </div>

      <div v-if="isCurrent" class="flex items-center">
        <span class="badge h-auto py-1 px-2.5 gap-1.5 badge-error text-white text-xs font-semibold">
          <span class="relative flex items-center justify-center">
            <span class="w-2 h-2 rounded-full bg-white/80 absolute animate-ping"></span>
            <span class="w-2 h-2 rounded-full bg-white"></span>
          </span>
          <span>Evento in corso</span>
        </span>
      </div>

      <!-- Zone evento -->
      <ZonesPicker
        v-if="localEvent.zones"
        v-model:isEditing="isEditing"
        v-model:event="localEvent"
      />

      <!-- Data evento -->
      <div class="border-t border-base-300 pt-3">
        <DatePicker
          v-if="localEvent && localEvent.startDate && localEvent.endDate"
          v-model:event="localEvent"
          v-model:isEditing="isEditing"
        />
      </div>

      <!-- Dati storici -->
      <div v-if="urlId !== 'nuovo'" class="border-t border-base-300 pt-3">
        <ChartSmallMirror
          v-model:event="localEvent"
          v-model:zoneList="zoneList"
          :class="{
            'opacity-50 grayscale-[50%] pointer-events-none': isEditing,
          }"
        />
      </div>

      <!-- Elimina evento in fondo lontano dalla chiusura -->
      <div
        v-if="!isEditing && urlId !== 'nuovo'"
        class="border-t border-base-300 pt-3"
      >
        <button
          type="button"
          class="btn btn-sm h-auto min-h-10 py-2.5 px-3.5 btn-ghost text-error hover:bg-error/10 w-full justify-center gap-1.5 touch-manipulation"
          aria-label="Elimina evento"
          @click="deleteEventModal?.showModal()"
        >
          <TrashIcon class="size-4" />
          <span>Elimina evento</span>
        </button>
      </div>
    </div>

    <dialog class="modal" ref="deleteEventModal">
      <div class="modal-box flex flex-col gap-2 items-center max-w-sm">
        <p class="font-bold">Elimina evento?</p>
        <div class="flex flex-col items-center text-sm text-center">
          <p>Sei sicuro di voler eliminare l'evento?</p>
          <p class="text-base-content/70">Non puoi annullare l'azione</p>
        </div>
        <form class="flex flex-row gap-2 w-full modal-action" method="dialog">
          <button class="btn btn-primary flex-grow text-white">Annulla</button>
          <button type="button" class="btn btn-error text-white flex-grow" @click="deleteEvent()">
            Elimina
          </button>
        </form>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.indicator {
  @apply w-3 h-3 rounded-full bg-red-500;
}
</style>
