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

const eventStatus = computed(() => {
  if (!event.value?.startDate || !event.value?.endDate) return null;
  const now = new Date();
  const start = new Date(event.value.startDate);
  const end = new Date(event.value.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (now < start) return { label: "In programma", badgeClass: "badge-info text-white" };
  if (now <= end) return { label: "In corso", badgeClass: "badge-error text-white" };
  return { label: "Concluso", badgeClass: "badge-neutral" };
});
</script>

<template>
  <div v-if="event" class="flex flex-col gap-2">
    <div class="flex flex-row items-center justify-between gap-2">
      <div class="flex flex-row gap-1 items-center">
        <ClockIcon class="size-4 text-base-content/60" />
        <small class="font-medium text-base-content/70">Quando è previsto l'evento?</small>
      </div>
      <span
        v-if="eventStatus"
        class="badge badge-xs font-semibold shrink-0"
        :class="eventStatus.badgeClass"
      >
        {{ eventStatus.label }}
      </span>
    </div>
    <div class="grid grid-cols-[auto_1fr] items-center gap-2 w-full">
      <span class="bg-base-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-center">
        Inizio:
      </span>
      <input
        v-if="isEditing"
        @change="event.startDate = $event.target.value"
        type="datetime-local"
        class="btn-sm rounded-md w-full btn btn-primary btn-outline text-base md:text-xs"
        :class="{
          'btn-error animate-pulse':
            event.startDate && event.endDate && new Date(event.startDate) > new Date(event.endDate),
        }"
        :value="event.startDate ? formatDateForInput(event.startDate) : ''"
        :max="event.endDate ? formatDateForInput(event.endDate) : undefined"
      />
      <span
        v-else
        class="bg-base-200/80 border border-base-300 rounded-lg px-3 py-1.5 text-xs tabular-nums flex items-center justify-center w-full"
      >
        {{ changeDateFormat(event.startDate) }}
      </span>

      <span class="bg-base-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-center">
        Fine:
      </span>
      <input
        v-if="isEditing"
        @change="event.endDate = $event.target.value"
        type="datetime-local"
        class="btn-sm rounded-md w-full btn btn-primary btn-outline text-base md:text-xs"
        :value="event.endDate ? formatDateForInput(event.endDate) : ''"
        :min="event.startDate ? formatDateForInput(event.startDate) : undefined"
      />
      <span
        v-else
        class="bg-base-200/80 border border-base-300 rounded-lg px-3 py-1.5 text-xs tabular-nums flex items-center justify-center w-full"
      >
        {{ changeDateFormat(event.endDate) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
</style>
