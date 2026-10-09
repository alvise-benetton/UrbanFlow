<script setup>
import { computed, inject, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/20/solid";
import ZonesPicker from "./ZonesPicker.vue";
import DatePicker from "./DatePicker.vue";
import ChartSmallMirror from "./ChartSmallMirror.vue";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const route = useRoute();

const urlId = computed(() => {
  return props.id || route.params.id || route.path.slice(1).split("/")[1] || null;
});

const listaEventi = inject("listaEventi", ref([]));
const zoneList = inject("listaZone", ref([]));
const notyf = inject("notyf");

const isEditing = ref(false);
const isSaving = ref(false);
const deleteEventModal = ref(null);

const event = ref(null);

function initializeEvent() {
  if (urlId.value === "nuovo") {
    event.value = {
      title: "",
      zones: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    isEditing.value = true;
  } else if (listaEventi.value && urlId.value) {
    event.value = listaEventi.value.find((e) => String(e._id) === String(urlId.value)) || null;
    isEditing.value = false;
  }
}

watch([listaEventi, urlId], () => {
  initializeEvent();
}, { immediate: true });

const localEvent = ref({ ...event.value });

watch(
  event,
  (newVal) => {
    localEvent.value = newVal ? { ...newVal } : null;
  },
  { deep: true, immediate: true }
);

const isCurrent = computed(() => {
  if (!localEvent.value?.startDate || !localEvent.value?.endDate) return false;
  const now = new Date();
  const s = new Date(localEvent.value.startDate);
  const e = new Date(localEvent.value.endDate);
  return s <= now && e >= now;
});

function abortChanges() {
  if (urlId.value === "nuovo") {
    router.push("/Eventi");
  } else {
    localEvent.value = { ...event.value };
    isEditing.value = false;
  }
}

async function saveChanges() {
  if (!localEvent.value?.title || localEvent.value.title.trim() === "") {
    if (notyf) notyf.error("Inserisci un titolo per l'evento");
    return;
  }

  isSaving.value = true;
  const token = localStorage.getItem("JWT");

  const zonesIds = (localEvent.value.zones || [])
    .filter(Boolean)
    .map((z) => String(z._id || z));

  const payload = {
    title: localEvent.value.title,
    zones: zonesIds,
    startDate: localEvent.value.startDate,
    endDate: localEvent.value.endDate,
  };

  try {
    if (urlId.value === "nuovo") {
      const res = await authFetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Errore durante la creazione dell'evento");
      const created = await res.json();
      listaEventi.value.push(created);
      if (notyf) notyf.success("Evento creato con successo!");
      router.push(`/Eventi/${created._id}`);
    } else {
      const res = await authFetch(`${API_URL}/api/events/${event.value._id}`, {
        method: "PUT",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Errore durante la modifica dell'evento");
      const updated = await res.json();
      const index = listaEventi.value.findIndex((e) => String(e._id) === String(event.value._id));
      if (index !== -1) {
        listaEventi.value[index] = updated;
      }
      event.value = { ...localEvent.value };
      isEditing.value = false;
      if (notyf) notyf.success("Evento modificato con successo!");
    }
  } catch (err) {
    if (notyf) notyf.error(err.message);
  } finally {
    isSaving.value = false;
  }
}

async function deleteEvent() {
  if (!event.value?._id) return;
  try {
    const res = await authFetch(`${API_URL}/api/events/${event.value._id}`, {
      method: "DELETE",
      headers: { "x-access-token": localStorage.getItem("JWT") },
    });

    if (!res.ok) throw new Error("Errore durante l'eliminazione dell'evento");

    listaEventi.value = listaEventi.value.filter((e) => String(e._id) !== String(event.value._id));
    if (notyf) notyf.success("Evento eliminato con successo!");
    deleteEventModal.value?.close();
    router.push("/Eventi");
  } catch (err) {
    if (notyf) notyf.error(err.message);
  }
}
</script>

<template>
  <div v-if="localEvent" class="flex flex-col gap-4 w-full">
    <!-- Header e Azioni -->
    <div class="flex items-center justify-between pb-3 border-b border-base-300">
      <div class="flex items-center gap-2">
        <span
          v-if="isCurrent"
          class="badge badge-info text-white font-bold text-xs gap-1 animate-pulse"
        >
          ● IN CORSO
        </span>
        <span
          v-else-if="urlId === 'nuovo'"
          class="badge badge-primary text-white font-bold text-xs"
        >
          NUOVO
        </span>
        <span
          v-else
          class="badge badge-ghost text-gray-500 font-mono text-xs"
        >
          PROGRAMMATO
        </span>
      </div>

      <!-- Barra pulsanti: Modifica / Salva / Elimina -->
      <div class="flex items-center gap-1.5">
        <template v-if="!isEditing && urlId !== 'nuovo'">
          <button
            class="btn btn-sm btn-ghost btn-square"
            @click="isEditing = true"
            title="Modifica evento"
          >
            <PencilIcon class="size-4" />
          </button>
          <button
            class="btn btn-sm btn-ghost btn-square text-error hover:bg-error/10"
            @click="deleteEventModal?.showModal()"
            title="Elimina evento"
          >
            <TrashIcon class="size-4" />
          </button>
        </template>
        <template v-else>
          <button
            class="btn btn-xs btn-ghost"
            @click="abortChanges"
            :disabled="isSaving"
          >
            Annulla
          </button>
          <button
            class="btn btn-xs btn-primary text-white gap-1 font-bold shadow-sm"
            @click="saveChanges"
            :disabled="isSaving || !localEvent.title"
          >
            <CheckIcon class="size-3.5" />
            <span>{{ isSaving ? 'Salvataggio...' : 'Salva' }}</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Titolo Evento -->
    <div class="flex flex-col gap-1">
      <label class="text-[11px] uppercase font-bold text-gray-400">Titolo Evento</label>
      <input
        v-if="isEditing"
        v-model="localEvent.title"
        type="text"
        placeholder="Es. Mercatini di Natale, Notte Bianca..."
        class="input input-sm input-bordered w-full font-bold focus:input-primary"
      />
      <h2 v-else class="text-lg font-bold text-base-content leading-snug">
        {{ localEvent.title }}
      </h2>
    </div>

    <!-- Zone Coinvolte -->
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] uppercase font-bold text-gray-400">Zone Coinvolte</label>
      <ZonesPicker
        v-if="localEvent.zones"
        v-model:isEditing="isEditing"
        v-model:event="localEvent"
      />
    </div>

    <!-- Date e Orari -->
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] uppercase font-bold text-gray-400">Data e Durata</label>
      <DatePicker
        v-if="localEvent && localEvent.startDate && localEvent.endDate"
        v-model:event="localEvent"
        v-model:isEditing="isEditing"
      />
    </div>

    <!-- Grafico Storico dell'Evento -->
    <div v-if="urlId !== 'nuovo'" class="flex flex-col gap-1.5 mt-2">
      <label class="text-[11px] uppercase font-bold text-gray-400">Trend Flusso Pedonale</label>
      <ChartSmallMirror
        v-model:event="localEvent"
        v-model:zones="zoneList"
        :class="{ 'opacity-50 pointer-events-none': isEditing }"
      />
    </div>

    <!-- Modal Conferma Eliminazione -->
    <dialog ref="deleteEventModal" class="modal">
      <div class="modal-box p-5 max-w-sm">
        <h3 class="font-bold text-base text-error mb-2">Eliminare questo evento?</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-4">
          Sei sicuro di voler eliminare "{{ localEvent.title }}"? Questa operazione non può essere annullata.
        </p>
        <div class="flex justify-end gap-2">
          <button class="btn btn-sm btn-ghost" @click="deleteEventModal?.close()">
            Annulla
          </button>
          <button class="btn btn-sm btn-error text-white font-bold" @click="deleteEvent">
            Elimina
          </button>
        </div>
      </div>
    </dialog>
  </div>

  <div v-else class="flex flex-col items-center justify-center p-12 text-gray-400 text-xs">
    <span>Evento non trovato o rimosso.</span>
  </div>
</template>

<style scoped>
</style>
