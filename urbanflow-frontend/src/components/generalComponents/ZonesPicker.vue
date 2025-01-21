<script setup>
import { MapPinIcon, PlusIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";
const zones = ref([1, 2, 3, 4, 5]); // Bisogna mettere tutte le zone
const event = defineModel("event");
const isEditing = defineModel("isEditing");
const zonesModal = ref(null);
</script>
<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <MapPinIcon class="size-4"></MapPinIcon>
      <small>Dove ha luogo l'evento?</small>
    </div>
    <div class="flex flex-row gap-1.5 flex-wrap">
      <div v-for="zone in event.zones" class="customItem bg-base-200">
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
  <dialog class="modal" ref="zonesModal">
    <div class="modal-box flex flex-col gap-5 w-fit">
      <p>In quali zone della città ha luogo l'evento?</p>
      <div class="flex flex-row flex-wrap gap-2">
        <input
          v-for="zone in zones"
          type="checkbox"
          class="btn btn-sm"
          :aria-label="'Zona ' + zone"
          :checked="event.zones.includes(zone)"
          @change="
            () => {
              if (event.zones.includes(zone)) {
                event.zones.splice(event.zones.indexOf(zone), 1);
              } else {
                event.zones.push(zone);
                event.zones.sort();
              }
            }
          "
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
