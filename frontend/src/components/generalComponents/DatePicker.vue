<script setup>
import { ref, computed } from "vue";
import { ClockIcon } from "@heroicons/vue/20/solid";

const event = defineModel("event");
const isEditing = defineModel("isEditing");

function changeDateFormat(dateTime) {
  if (!dateTime) return "Data non impostata";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "Data non valida";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateForInput(dateTime) {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
</script>

<template>
  <div v-if="event" class="flex flex-col gap-2">
    <div class="flex flex-row gap-1 items-center">
      <ClockIcon class="size-4 text-gray-500" />
      <small class="font-medium text-gray-500">Quando è previsto l'evento?</small>
    </div>
    <div class="flex flex-row gap-2 w-fit items-center">
      <div class="customItem">
        <div class="customItem bg-base-200 rounded-md !btn-sm">
          <small class="font-semibold">Inizio:</small>
        </div>
        <div class="customItem bg-base-200 rounded-md !btn-sm">
          <small class="font-semibold">Fine:</small>
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
              event.startDate && event.endDate && new Date(event.startDate) > new Date(event.endDate),
          }"
          :value="event.startDate ? formatDateForInput(event.startDate) : ''"
          :max="event.endDate ? formatDateForInput(event.endDate) : undefined"
        />
        <input
          @change="event.endDate = $event.target.value"
          type="datetime-local"
          class="btn-sm rounded-md"
          :class="{
            'bg-base-200 pointer-events-none': !isEditing,
            'btn btn-primary btn-outline': isEditing,
          }"
          :value="event.endDate ? formatDateForInput(event.endDate) : ''"
          :min="event.startDate ? formatDateForInput(event.startDate) : undefined"
        />
      </div>
      <div v-else class="customItem">
        <span class="btn-sm rounded-md btn btn-primary btn-outline font-mono text-xs flex items-center">
          {{ changeDateFormat(event.startDate) }}
        </span>
        <span class="btn-sm rounded-md btn btn-primary btn-outline font-mono text-xs flex items-center">
          {{ changeDateFormat(event.endDate) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customItem {
  @apply flex flex-col justify-center gap-2 p-0;
}
</style>
