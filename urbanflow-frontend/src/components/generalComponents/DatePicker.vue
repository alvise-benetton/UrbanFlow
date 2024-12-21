<script setup>
const event = defineModel("event");
</script>
<template>
  <div class="flex gap-2 items-center">
    <p>Da</p>
    <input
      type="datetime-local"
      class="bg-gray-200 border-none rounded-box pt-2 pb-2 pl-3 pr-3 cursor-pointer"
      :value="new Date(event.startDate).toISOString().slice(0, 16)"
    />
    <p>a</p>
    <input
      type="datetime-local"
      class="bg-gray-200 border-none rounded-box pt-2 pb-2 pl-3 pr-3 cursor-pointer"
      :value="new Date(event.endDate).toISOString().slice(0, 16)"
    />
  </div>
</template>
