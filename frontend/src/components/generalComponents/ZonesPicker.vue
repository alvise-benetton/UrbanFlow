<script setup>
import { MapPinIcon, PlusIcon } from "@heroicons/vue/20/solid";
import { inject, ref, watch } from "vue";
import router from "../utility/router";

const zoneList = inject("listaZone", ref([]));

const event = defineModel("event");
const isEditing = defineModel("isEditing");

const zonesModal = ref(null);

const extractIds = (list) =>
  Array.isArray(list) ? list.filter(Boolean).map((z) => String(z._id || z)) : [];

const localZones = ref(extractIds(event.value?.zones));

watch(
  () => event.value?.zones,
  (newZones) => {
    localZones.value = extractIds(newZones);
  },
  { deep: true }
);

function toggleZone(zoneId) {
  const idStr = String(zoneId);
  const idx = localZones.value.indexOf(idStr);
  if (idx !== -1) {
    localZones.value.splice(idx, 1);
  } else {
    localZones.value.push(idStr);
  }
}

function confirmChanges() {
  localZones.value.sort();
  if (event.value) {
    event.value.zones = (zoneList.value || []).filter((z) =>
      localZones.value.includes(String(z._id))
    );
  }
  zonesModal.value?.close();
}

function goToZone(zoneId) {
  router.push(`/Zone/${zoneId}`);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <MapPinIcon class="size-4 text-base-content/70" />
      <small class="text-base-content/70">Dove ha luogo l'evento?</small>
    </div>
    <div class="flex flex-row gap-1.5 flex-wrap items-center">
      <button
        v-for="zone in (zoneList || []).filter((z) => localZones.includes(String(z._id)))"
        :key="zone._id"
        type="button"
        class="btn btn-sm bg-base-200 border-none rounded-md touch-manipulation"
        @click="goToZone(zone._id)"
      >
        Zona {{ zone.name }}
      </button>
      <span
        v-if="!isEditing && localZones.length === 0"
        class="text-xs text-base-content/50"
      >
        Nessuna zona associata
      </span>
      <button
        v-if="isEditing"
        type="button"
        class="btn btn-sm btn-square btn-primary btn-outline touch-manipulation"
        aria-label="Seleziona zone evento"
        @click="zonesModal?.showModal()"
      >
        <PlusIcon class="size-4" />
      </button>
    </div>
  </div>

  <dialog class="modal" ref="zonesModal">
    <div class="modal-box flex flex-col gap-4 max-w-md">
      <p class="font-semibold">In quali zone della città ha luogo l'evento?</p>
      <div class="flex flex-row flex-wrap gap-2">
        <input
          v-for="zone in zoneList || []"
          :key="zone._id"
          type="checkbox"
          class="btn btn-sm min-h-10 touch-manipulation"
          :aria-label="'Zona ' + zone.name"
          :checked="localZones.includes(String(zone._id))"
          @change="toggleZone(zone._id)"
        />
      </div>
      <div class="modal-action">
        <button type="button" class="btn btn-primary text-white" @click="confirmChanges">
          Conferma
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
</style>
