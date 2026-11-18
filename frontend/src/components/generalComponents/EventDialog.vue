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
  <div>
    <div class="w-full md:w-80 lg:w-96 max-h-[58dvh] md:max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain flex flex-col [&>*]:shrink-0 bg-base-100 p-4 sm:p-5 rounded-box gap-4 shadow-md relative">
      <div class="flex flex-row gap-2 items-center" v-if="isCurrent">
        <div class="relative flex items-center justify-center">
          <div class="indicator absolute opacity-75 animate-ping"></div>
          <div class="indicator scale-75"></div>
        </div>
        <span class="text-red-500 text-xs font-bold tracking-wide">LIVE</span>
      </div>

      <div
        class="flex flex-row justify-end gap-2 bg-base-100"
        v-if="!isEditing && urlId !== 'nuovo'"
      >
        <button
          type="button"
          class="btn btn-square btn-sm touch-manipulation"
          aria-label="Modifica evento"
          @click="isEditing = true; localEvent = { ...event }"
        >
          <PencilIcon class="size-4" />
        </button>
        <button
          type="button"
          class="btn btn-square btn-sm touch-manipulation"
          aria-label="Chiudi scheda evento"
          @click="closeEvent()"
        >
          <XMarkIcon class="size-4" />
        </button>
        <button
          type="button"
          class="btn btn-square btn-sm btn-error text-white touch-manipulation"
          aria-label="Elimina evento"
          @click="deleteEventModal?.showModal()"
        >
          <TrashIcon class="size-4" />
        </button>
      </div>
      <div class="flex flex-row justify-end gap-2" v-else>
        <button type="button" class="btn btn-sm btn-error text-white" @click="abortChanges()">
          Annulla
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary text-white"
          :disabled="(urlId !== 'nuovo' && JSON.stringify(event) === JSON.stringify(localEvent)) || !localEvent.title?.trim()"
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
        >
          {{ localEvent.title }}
        </span>

        <input
          v-else
          type="text"
          v-model="localEvent.title"
          class="font-bold card-title text-base md:text-lg pb-2 border-b-2 border-primary text-primary outline-none w-full bg-transparent"
          placeholder="Aggiungi un titolo..."
        />
      </div>

      <!-- Zone evento -->
      <ZonesPicker
        v-if="localEvent.zones"
        v-model:isEditing="isEditing"
        v-model:event="localEvent"
      />

      <!-- Data evento -->
      <DatePicker
        v-if="localEvent && localEvent.startDate && localEvent.endDate"
        v-model:event="localEvent"
        v-model:isEditing="isEditing"
      />

      <!-- Dati storici -->
      <ChartSmallMirror
        v-if="urlId !== 'nuovo'"
        v-model:event="localEvent"
        v-model:zoneList="zoneList"
        :class="{
          'opacity-50 grayscale-[50%] pointer-events-none': isEditing,
        }"
      />
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
