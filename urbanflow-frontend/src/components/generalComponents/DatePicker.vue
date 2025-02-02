s
<script setup>
import { defineExpose, defineModel, ref } from "vue";
import { ClockIcon } from "@heroicons/vue/20/solid";
const event = defineModel("event");
const isEditing = defineModel("isEditing");
const isValid = ref(true);
defineExpose({ isValid });
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
      <div class="customItem">
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
          :value="event.startDate"
          :max="event.endDate"
        />
        <input
          @change="event.endDate = $event.target.value"
          type="datetime-local"
          class="btn-sm rounded-md"
          :class="{
            'bg-base-200 pointer-events-none': !isEditing,
            'btn btn-primary btn-outline': isEditing,
          }"
          :value="event.endDate"
          :min="event.startDate"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.customItem {
  @apply flex flex-col justify-center gap-2 p-0;
}
</style>
