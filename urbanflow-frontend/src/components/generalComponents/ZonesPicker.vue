<script setup>
import { PlusIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";
const zones = ref([1, 2, 3, 4, 5]);
const event = defineModel("event");
const setZones = defineModel("zones");
const zonesModal = ref(null);
</script>
<template>
  <div class="flex gap-2 items-center">
    <div
      v-for="zone in setZones"
      class="bg-gray-200 rounded-box pt-2 pb-2 pl-3 pr-3 cursor-pointer"
    >
      <span>Zona {{ zone }}</span>
    </div>
    <button
      class="btn btn-circle btn-sm bg-gray-200 border-none"
      @click="zonesModal.showModal()"
    >
      <PlusIcon class="size-5"></PlusIcon>
    </button>
  </div>
  <dialog class="modal" id="zonesModal" ref="zonesModal">
    <div class="modal-box w-80">
      <h3 class="text-lg font-bold">{{ event.title }}</h3>
      <p class="py-4">In quali zone ha luogo l'evento?</p>
      <div class="flex flex-wrap gap-2">
        <input
          v-for="zone in zones"
          :aria-label="'Zona ' + zone"
          class="btn rounded-box"
          type="checkbox"
          :checked="setZones.includes(zone)"
        />
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
