<script setup>
import { onMounted, ref, watch } from "vue";
import ZoomPane from "../mapComponents/ZoomPane.vue";
const mapRef = ref(null);
const mapInit = () => {
  const map = L.map("map", {
    zoomControl: false,
    maxZoom: 17,
    minZoom: 15,
  }).setView([46.0679, 11.123], 15);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  ).addTo(map);
  mapRef.value = map;
};
const zoomLevel = ref(15);
watch(zoomLevel, () => {
  mapRef.value.setZoom(zoomLevel.value);
});
onMounted(mapInit);
</script>
<template>
  <div class="relative flex">
    <div id="map"></div>
    <ZoomPane
      v-model="zoomLevel"
      class="absolute bottom-[calc(-100vh+30px)] right-5"
    ></ZoomPane>
  </div>
</template>
<style>
#map {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -100;
  filter: brightness(0.85);
}
</style>
