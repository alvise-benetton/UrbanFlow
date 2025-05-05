<script setup>
import { MinusIcon, PlusIcon } from "@heroicons/vue/24/solid";
import { defineModel } from "vue";
const model = defineModel();
</script>
<template>
  <div class="flex flex-col bg-base-200 rounded-box shadow-md">
    <button
      class="w-10 h-10 flex justify-center items-center"
      id="zoomIn"
      @click="model += 1 ? model < 17 : 0"
      :class="{ disabled: model >= 17 }"
    >
      <PlusIcon class="size-4"></PlusIcon>
    </button>
    <button
      class="w-10 h-10 flex justify-center items-center"
      id="zoomOut"
      @click="model -= 1 ? model > 15 : 0"
      :class="{ disabled: model <= 15 }"
    >
      <MinusIcon class="size-4"></MinusIcon>
    </button>
  </div>
</template>
<style scoped>
button {
  transition: all 0.2s ease-in-out;
}
button:hover {
  background-color: rgba(127.5, 127.5, 127.5, 0.5);
}
.disabled {
  filter: opacity(0.5);
  opacity: 0.5;
  cursor: default;
  background-color: transparent !important;
}
#zoomIn {
  border-top-left-radius: var(--rounded-box, 1rem);
  border-top-right-radius: var(--rounded-box, 1rem);
}
#zoomOut {
  border-bottom-left-radius: var(--rounded-box, 1rem);
  border-bottom-right-radius: var(--rounded-box, 1rem);
}
</style>
