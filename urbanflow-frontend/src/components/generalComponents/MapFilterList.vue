<script setup>
import { ref } from "vue";
const filters = ref(["Eventi", "Zone"]);
</script>
<template>
  <div class="flex flex-col p-5 rounded-box shadow-md bg-base-200">
    <div v-for="filter in filters" class="flex">
      <label class="label cursor-pointer">
        <input
          type="checkbox"
          class="checkbox checkbox-primary rounded-full"
          checked
        />
        <span class="label-text ml-4">{{ filter }}</span>
      </label>
    </div>
  </div>
</template>
