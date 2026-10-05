<script setup>
  import { MapPinIcon, PlusIcon } from "@heroicons/vue/20/solid";
  import { computed, inject, ref, watch } from "vue";
import router from "../utility/router";

  const zoneList = inject("listaZone");

  const event = defineModel("event");
  const zones = ref(event.value.zones);
  const isEditing = defineModel("isEditing");

  const zonesModal = ref(null)
  const localZones = ref([...zones.value]);

  function confirmChanges() {
    localZones.value.sort();
    event.value.zones = zoneList.value.filter(z=>localZones.value.includes(z._id));
    zonesModal.value.close();
  }
  function goToZone(zoneId){
    router.push(`/Zone/${zoneId}`);
  }

</script>
<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <MapPinIcon class="size-4"></MapPinIcon>
      <small>Dove ha luogo l'evento?</small>
    </div>
    <div class="flex flex-row gap-1.5 flex-wrap">
      <div v-for="zone in zoneList.filter((z)=>localZones.includes(z._id))" class="customItem bg-base-200">
        <button @click="goToZone(zone._id)">Zona {{ zone.name }}</button>
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
          v-for="zone in zoneList"
          type="checkbox"
          class="btn btn-sm"
          :aria-label="'Zona ' + zone.name"
          :checked="localZones.includes(zone._id)"
          @change="
            () => {
              if (localZones.includes(zone._id)) {
                localZones.splice(localZones.indexOf(zone._id), 1);
              } else {
                localZones.push(zone._id);
              }
            }
          "
        />
      </div>
      <div class="modal-action">
        <button class="btn" @click="confirmChanges">
          <span>Conferma</span>
        </button>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.customItem {
  @apply btn-sm rounded-md flex flex-row justify-center items-center gap-2;
}
</style>
