<script setup>
import { ArrowPathIcon, MinusIcon, PlusIcon } from "@heroicons/vue/24/solid";

const model = defineModel({ default: 15 });
const emit = defineEmits(["reset"]);

function zoomIn() {
  if (model.value < 17) {
    model.value++;
  }
}

function zoomOut() {
  if (model.value > 15) {
    model.value--;
  }
}
</script>

<template>
  <div class="flex flex-col bg-base-100/90 backdrop-blur-xl rounded-xl uf-panel-shadow overflow-hidden border border-base-300/80">
    <button
      class="w-10 h-10 flex justify-center items-center hover:bg-base-200 transition-colors"
      id="zoomIn"
      @click="zoomIn"
      :disabled="model >= 17"
      :class="{ 'opacity-40 cursor-not-allowed': model >= 17 }"
      aria-label="Ingrandisci mappa"
    >
      <PlusIcon class="size-4" />
    </button>
    <div class="h-px bg-base-300"></div>
    <button
      class="w-10 h-10 flex justify-center items-center hover:bg-base-300 transition-colors"
      id="zoomOut"
      @click="zoomOut"
      :disabled="model <= 15"
      :class="{ 'opacity-40 cursor-not-allowed': model <= 15 }"
      aria-label="Rimpicciolisci mappa"
    >
      <MinusIcon class="size-4" />
    </button>
    <div class="h-px bg-base-300"></div>
    <button
      type="button"
      class="w-10 h-10 flex justify-center items-center hover:bg-base-300 transition-colors touch-manipulation"
      id="zoomReset"
      @click="emit('reset')"
      aria-label="Ricentra mappa"
      title="Ricentra mappa"
    >
      <ArrowPathIcon class="size-4" />
    </button>
  </div>
</template>

<style scoped>
</style>
