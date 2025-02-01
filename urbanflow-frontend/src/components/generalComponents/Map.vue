<script setup>
import { onMounted, ref, watch } from "vue";
import ZoomPane from "../mapComponents/ZoomPane.vue";
import eventBus from "../utility/eventBus";
const mapRef = ref(null);
const zoneLayer = ref(null);
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
  addZones(map);
  filterHandler()
};
// gestione dello zoom
const zoomLevel = ref(15);
watch(zoomLevel, () => {
  mapRef.value.setZoom(zoomLevel.value);
});
// colora le zone al passare del mouse
function mouseHandler(e) {
  const layer = e.target;
  layer.setStyle({
      color: 'red',
      fillColor: 'red'
  });
}
// gestisce il click delle zone
function clickHandler(layer){
  console.log(layer.feature.properties.nome);
}

// aggiunge le zone inserite le file geoJSON
async function addZones(map) {
    const response = await fetch("/map.geojson");
    const data = await response.json();
    zoneLayer.value = L.geoJson(data, {
      style: {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.15
      },
      onEachFeature: function (feature, layer) {
          layer.on({
              mouseover: mouseHandler,
              mouseout: ()=>zoneLayer.value.resetStyle(),
              click: ()=>{clickHandler(layer)}
          });
      }
    }).addTo(map);
}
function filterHandler(){
  // Ascolta i cambiamenti ai filtri
 /*  eventBus.filters.value = []; // Inizializza i filtri
  eventBus.filters.value = eventBus.filters.value; // Forza il reattivo */
  watch(() => eventBus.filters.value.length,()=>{filterUpdate(eventBus.filters.value)});
}
function filterUpdate(activeFilters){

  // same per gli eventi

  if (activeFilters.includes("Zone")) {
  // Aggiungi i poligoni per "Zone"
    mapRef.value.addLayer(zoneLayer.value);
  }else{
    mapRef.value.removeLayer(zoneLayer.value); // Pulisci i layer esistenti
  }
}

onMounted(mapInit);
</script>
<template>
  <div class="relative flex">
    <div id="map"></div>
    <div class="flex gap-5 fixed bottom-5 left-5">
      <ZoomPane v-model="zoomLevel"></ZoomPane>
    </div>
  </div>
</template>
<style>
#map {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: -100;
  filter: brightness(0.85);
}
</style>


