<script setup>
import { MapPinIcon } from "@heroicons/vue/20/solid";
import { PlusIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";
const zones = ref([1, 2, 3, 4, 5]); // Bisogna mettere tutte le zone
const event = defineModel("event");
const isEditing = defineModel("isEditing");
const setZones = event.value.zones;
const zonesModal = ref(null);
const changed = ref(false);
</script>
<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <MapPinIcon class="size-4"></MapPinIcon>
      <small>Dove ha luogo l'evento?</small>
    </div>
    <div class="flex flex-row flex-wrap gap-1.5 overflow-scroll">
      <div v-for="zone in setZones" class="customItem bg-base-200">
        <span>Zona {{ zone }}</span>
      </div>
      <button
        class="btn btn-sm btn-square btn-primary btn-outline"
        v-if="isEditing"
        @click="zonesModal.showModal()"
      >
        <PlusIcon class="size-4"></PlusIcon>
      </button>
    </div>
  </div>
  <dialog id="zonesModal" class="modal" ref="zonesModal">
    <div class="modal-box flex flex-col gap-5 w-fit">
      <p>In quali zone della citàà ha luogo l'evento?</p>
      <div class="flex flex-row flex-wrap gap-2">
        <input
          v-for="zone in zones"
          type="checkbox"
          class="btn"
          :aria-label="'Zona ' + zone"
          :checked="setZones.includes(zone)"
        />
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Conferma</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.customItem {
  @apply btn-sm rounded-md flex flex-row justify-center items-center gap-2;
}
</style>
