<script setup>
import { inject, onMounted, ref, watch } from "vue";
import ZoomPane from "../mapComponents/ZoomPane.vue";
import eventBus from "../utility/eventBus";
import ZoneTooltip from "../mapComponents/ZoneTooltip.vue";
import router from "../utility/router";

const listaZone = inject("listaZone");
const listaEventi = inject("listaEventi");
const listaMisurazioni = inject("listaMisurazioni");

const zonesAdded = ref(false);

const mapRef = ref(null);
const zoneLayer = ref(null);
const gradientLayer = ref(null);

const hoveredZone = ref(null);
const hoveredEvents = ref(null);

const mapInit = () => {
  const map = L.map("map", {
    zoomControl: false,
    maxZoom: 17,
    minZoom: 15,
    // preferCanvas: true,
  }).setView([46.0679, 11.123], 15);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  ).addTo(map);
  mapRef.value = map;
  filterHandler();
  zoneLayer.value = L.layerGroup();
  gradientLayer.value = L.layerGroup();

  watch(listaMisurazioni, () => {
    if (listaZone.value && listaMisurazioni.value && !zonesAdded.value) {
      // in teoria viene fatto solo una volta
      addZones(mapRef.value, listaZone.value, listaMisurazioni.value);
    } else {
      // se ci sono già le zone, aggiorna solo i colori
      updateGradient(mapRef.value, listaMisurazioni.value);
    }
  });

};
// gestione dello zoom
const zoomLevel = ref(15);
watch(zoomLevel, () => {
  mapRef.value.setZoom(zoomLevel.value);
});
function colorGradient(densityRatio) {
  if(densityRatio >= 1.5){
    return "rgb(255,0,0)";
  }
  if(densityRatio > 1){
    return "rgb(255,121,0)";;
  }
  if(densityRatio > 0.7){
    return "rgb(255,239,2)";
  }
  if(densityRatio > 0.5){
    return "rgb(131,243,13)";
  }
  return "rgb(47,235,14)";
     
}
function addGradientZone(coordinates, densityRatio) {
  const colorValue = colorGradient(densityRatio);
  let g = L.polygon(coordinates, {
    className: "bgZona",
    stroke: false,
    fillColor: colorValue,
    fillOpacity: 0.5,
  });
  g.addTo(gradientLayer.value);
}
function zoneMidPoint(coords) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < coords.length; i++) {
    x += coords[i][0];
    y += coords[i][1];
  }
  return [x / coords.length, y / coords.length];
}
function addWarnSymbol(id, coordinates) {
  let warnIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2U1NGE0YSIgY2xhc3M9InNpemUtNiI+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPgogICAgICA8ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMCIgc3RkRGV2aWF0aW9uPSIyIiBmbG9vZC1jb2xvcj0iIzdhNzk3OSIgZmxvb2Qtb3BhY2l0eT0iMC41Ii8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0id2hpdGUiIGZpbHRlcj0idXJsKCNzaGFkb3cpIi8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMi4yNSAxMmMwLTUuMzg1IDQuMzY1LTkuNzUgOS43NS05Ljc1czkuNzUgNC4zNjUgOS43NSA5Ljc1LTQuMzY1IDkuNzUtOS43NSA5Ljc1UzIuMjUgMTcuMzg1IDIuMjUgMTJaTTEyIDguMjVhLjc1Ljc1IDAgMCAxIC43NS43NXYzLjc1YS43NS43NSAwIDAgMS0xLjUgMFY5YS43NS43NSAwIDAgMSAuNzUtLjc1Wm0wIDguMjVhLjc1Ljc1IDAgMSAwIDAtMS41Ljc1Ljc1IDAgMCAwIDAgMS41WiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPgo8L3N2Zz4K",
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
  });
  let warnMarker = L.marker(zoneMidPoint(coordinates), { icon: warnIcon });
  warnMarker.addTo(zoneLayer.value);
}
// colora le zone al passare del mouse
function mouseHandler(e) {
  const layer = e.target;
  if (e.type === "mouseover") {
    layer.setStyle({ stroke: true });
    layer.bringToFront();
    const tempZone = listaZone.value.find((zona) => zona._id === layer.id);
    const tempEvents = listaEventi.value.filter((evento) =>
      evento.zones.includes(tempZone._id)
    );
    hoveredZone.value = tempZone;
    hoveredEvents.value = tempEvents;
  }
  if (e.type === "mouseout") {
    layer.setStyle({ stroke: false });
    hoveredZone.value = null;
    hoveredEvents.value = null;
  }
}
// gestisce il click delle zone
function clickHandler(zona) {
  router.push(`/Zone/${zona}`)
}

function addZones(map, zone, misurazioni) {
  zonesAdded.value = true;
  zone.forEach((zona) => {
    const density = misurazioni.find((m) => m.zone === zona._id).data[0]
      .density;
    addGradientZone(zona.coordinates, density/zona.threshold);
    if (density > zona.threshold) {
      addWarnSymbol(zona._id, zona.coordinates);
    }
    let p = L.polygon(zona.coordinates, {
      stroke: false,
      color: "rgb(80,80,80)",
      weight: 2.5,
      fillColor: "transparent",
      lineCap: "round",
      lineJoin: "round",
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
  map.addLayer(gradientLayer.value);
  map.addLayer(zoneLayer.value);
}
function updateGradient() {}
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
    <svg xmlns="w3.org/2000/svg" version="1.1" class="absolute top-0 left-0">
      <defs>
        <filter id="blur" width="150%" height="150%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
    </svg>
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
.bgZona {
  filter: url(#blur);
}
#map {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: -100;
}
.leaflet-tile-pane {
  filter: brightness(0.85);
}
</style>
