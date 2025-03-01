<script setup>
import { inject, onMounted, ref, watch } from "vue";
import ZoomPane from "../mapComponents/ZoomPane.vue";
import eventBus from "../utility/eventBus";
import ZoneTooltip from "../mapComponents/ZoneTooltip.vue";

const listaZone = inject("listaZone");
const listaEventi = inject("listaEventi");

const mapRef = ref(null);
const zoneLayer = ref(null);

const hoveredZone = ref(null);
const hoveredEvents = ref(null);

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
  filterHandler();
  zoneLayer.value = L.layerGroup();

  watch(listaZone, () => {
    if (listaZone.value)
      // in teoria viene fatto solo una volta
      addZones(mapRef.value, listaZone.value);
  });

  /* const zoneStore = useZoneStore();

  zoneStore.updateZones().then(()=>{addZones(map,zoneStore.listaZone)}); */

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

  if (e.type === "mouseover") {
    layer.setStyle({
      color: "red",
      fillColor: "red",
    });
    const tempZone = listaZone.value.find((zona) => zona._id === layer.id);
    const tempEvents = listaEventi.value.filter((evento) =>
      evento.zones.includes(tempZone._id)
    );
    hoveredZone.value = tempZone;
    hoveredEvents.value = tempEvents;
  }
  if (e.type === "mouseout") {
    layer.setStyle({
      color: "blue",
      fillColor: "blue",
    });
    hoveredZone.value = null;
    hoveredEvents.value = null;
  }
}
// gestisce il click delle zone
function clickHandler(layer) {}

function addZones(map, lista) {
  //console.log("adada");

  lista.forEach((zona) => {
    let p = L.polygon(zona.coordinates, {
      color: "blue",
      fillColor: "blue",
      fillOpacity: 0.15,
    });

    p.on({
      mouseover: mouseHandler,
      mouseout: mouseHandler,
      click: (zona) => {
        clickHandler(zona.target.id);
      },
    });

    p.id = zona._id;

    p.addTo(zoneLayer.value);
  });

  map.addLayer(zoneLayer.value);
}
function filterHandler() {
  watch(
    () => eventBus.filters.filters.value.length,
    () => {
      filterUpdate(eventBus.filters.filters.value);
    }
  );
}
function filterUpdate(activeFilters) {
  // same per gli eventi

  if (activeFilters.includes("Zone")) {
    // Aggiungi i poligoni per "Zone"
    mapRef.value.addLayer(zoneLayer.value);
  } else {
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
    <ZoneTooltip
      v-if="hoveredZone != null"
      v-model:hoveredZone="hoveredZone"
      v-model:hoveredEvents="hoveredEvents"
    ></ZoneTooltip>
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
