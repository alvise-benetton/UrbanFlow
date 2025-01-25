<script setup>
import { ref, watch } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
const appSection = defineModel("appSection");
const searchTerm = defineModel("searchTerm", { default: null });
const txt = ref("un evento o una zona");
watch(appSection, (newValue) => {
  if (newValue == "Eventi") {
    txt.value = "un evento";
  } else if (newValue == "Zone") {
    txt.value = "una zona";
  } else {
    txt.value = "un evento o una zona";
  }
});
</script>
<template>
  <label class="input flex items-center" id="searchBar">
    <input
      type="text"
      class="grow searchinput"
      :placeholder="'Cerca ' + txt"
      v-model="searchTerm"
    />
    <MagnifyingGlassIcon class="size-5 text-base-0" />
  </label>
</template>
<style scoped>
.searchinput {
  flex: 0 0 auto;
  min-width: 20vw;
}
.input {
  outline: none !important;
  border: none !important;
}
</style>
