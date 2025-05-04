s
<script setup>
import { defineExpose, ref } from "vue";
import { ClockIcon } from "@heroicons/vue/20/solid";

const event = defineModel("event");
const isEditing = defineModel("isEditing");
const isValid = ref(true);
defineExpose({ isValid }); // non credo vega usato


function changeDateFormat(dateTime){

  if(typeof dateTime !== "string")
    return "Errore!";
  let splitted = dateTime.split("T");
  let data = splitted[0].split("-");
  let time = splitted[1].split  (":");

  return data[2] + "/" + data[1] + "/" + data[0] +" " + time[0] + ":" + time[1]; 

}

function formatDateForInput(dateTime) {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
</script>
<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <ClockIcon class="size-4"></ClockIcon>
      <small>Quando è previsto l'evento?</small>
    </div>
    <div class="flex flex-row gap-2 w-fit">
      <div class="customItem">
        <div class="customItem bg-base-200 rounded-md !btn-sm">
          <small>Inizio:</small>
        </div>
        <div class="customItem bg-base-200 rounded-md !btn-sm">
          <small>Fine:</small>
        </div>
      </div>
      <div v-if="isEditing" class="customItem">
        <input
          @change="event.startDate = $event.target.value"
          type="datetime-local"
          class="btn-sm rounded-md"
          :class="{
            'bg-base-200 pointer-events-none': !isEditing,
            'btn btn-primary btn-outline': isEditing,
            'btn-error animate-pulse':
              new Date(event.startDate) > new Date(event.endDate),
          }"
          :value="formatDateForInput(event.startDate)"
          :max="formatDateForInput(event.endDate)"
        />
        <input
          @change="event.endDate = $event.target.value"
          type="datetime-local"
          class="btn-sm rounded-md"
          :class="{
            'bg-base-200 pointer-events-none': !isEditing,
            'btn btn-primary btn-outline': isEditing,
          }"
          :value="formatDateForInput(event.endDate)"
          :min="formatDateForInput(event.startDate)"
        />
      </div>
      <div v-else class="customItem">
          <span class="btn-sm rounded-md btn btn-primary btn-outline">{{ changeDateFormat(event.startDate) }}</span>
          <span class="btn-sm rounded-md btn btn-primary btn-outline">{{ changeDateFormat(event.endDate) }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.customItem {
  @apply flex flex-col justify-center gap-2 p-0;
}
</style>
