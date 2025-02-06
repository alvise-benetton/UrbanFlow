<script setup>
import { onMounted, ref, watch } from "vue";
import ZoomPane from "../mapComponents/ZoomPane.vue";
import eventBus from "../utility/eventBus";
import { useZoneStore } from '@/stores/zoneStore';




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
  //addZones(map);
  filterHandler()
  zoneLayer.value = L.layerGroup();

  const zoneStore = useZoneStore();

  zoneStore.updateZones().then(()=>{addZones(map,zoneStore.listaZone)});


  //listHandler.updateZones().then((lista)=>{addZones(map,lista)});
  //
  /* watch(listHandler.listaZone, ()=>{
    addZones(map)
  }) */
  
};
// gestione dello zoom
const zoomLevel = ref(15);
watch(zoomLevel, () => {
  mapRef.value.setZoom(zoomLevel.value);
});



// colora le zone al passare del mouse
function mouseHandler(e) {
  const layer = e.target;

  if(e.type === "mouseover"){
    layer.setStyle({
      color: 'red',
      fillColor: 'red'
    });
  }
  if(e.type === "mouseout"){
    layer.setStyle({
      color: 'blue',
      fillColor: 'blue'
    });
  } 
}
// gestisce il click delle zone
function clickHandler(layer){
  console.log("click",layer);
}

// aggiunge le zone inserite le file geoJSON
function addZones(map,lista) { 

    lista.forEach((zona)=>{

      let p = L.polygon(zona.coordinates,{
      style: {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.15
      }});
    
      p.on({
        mouseover: mouseHandler,
        mouseout: mouseHandler,
        click: (zona)=>{clickHandler(zona.target.id)}
      });

      p.id = zona._id  ;

      p.addTo(zoneLayer.value);
    
    });

    map.addLayer(zoneLayer.value);
    
    
}
function filterHandler(){
  watch(() => eventBus.filters.filters.value.length,()=>{filterUpdate(eventBus.filters.filters.value)});
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


