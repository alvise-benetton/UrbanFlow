<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

maplibregl.setWorkerUrl(workerUrl);
import {
  PlusIcon,
  MinusIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
} from "@heroicons/vue/20/solid";
import ZoneTooltip from "../mapComponents/ZoneTooltip.vue";
import MapLegend from "../mapComponents/MapLegend.vue";

const route = useRoute();
const router = useRouter();

const listaZone = inject("listaZone", ref([]));
const listaEventi = inject("listaEventi", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));

const mapContainer = ref(null);
let map = null;

const hoveredZone = ref(null);
const hoveredEvents = ref(null);

const hoveredPolygon = computed(() => {
  if (!hoveredZone.value) return null;
  return projectedPolygons.value.find((p) => p.id === String(hoveredZone.value._id)) || null;
});

const theme = inject("theme", ref("light"));
const setTheme = inject("setTheme", () => {});

const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const alertMarkers = ref([]);
const projectedPolygons = ref([]);

function colorGradient(densityRatio) {
  if (densityRatio >= 1.5) return "rgb(255, 0, 0)";
  if (densityRatio > 1.0) return "rgb(255, 121, 0)";
  if (densityRatio > 0.7) return "rgb(255, 239, 2)";
  if (densityRatio > 0.5) return "rgb(131, 243, 13)";
  return "rgb(47, 235, 14)";
}

function calculateZoneCenter(coords) {
  let sumLng = 0;
  let sumLat = 0;
  coords.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });
  return [sumLng / coords.length, sumLat / coords.length];
}

function updateProjectedPolygons() {
  if (!map || !listaZone?.value || !listaMisurazioni?.value) {
    projectedPolygons.value = [];
    return;
  }

  const list = [];
  listaZone.value.forEach((zona) => {
    if (!Array.isArray(zona.coordinates) || zona.coordinates.length < 3) return;
    const m = (listaMisurazioni.value || []).find((item) => String(item.zone) === String(zona._id));
    const density = m?.data?.[0]?.density ?? 0;
    const threshold = zona.threshold || 100;
    const ratio = threshold > 0 ? density / threshold : 0;
    const color = colorGradient(ratio);

    const points = zona.coordinates
      .map(([lat, lng]) => {
        const p = map.project([lng, lat]);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

    list.push({
      id: String(zona._id),
      points,
      color,
    });
  });

  projectedPolygons.value = list;
}

function buildGeoJSON() {
  if (!listaZone?.value || !Array.isArray(listaZone.value)) {
    return { type: "FeatureCollection", features: [] };
  }

  const features = listaZone.value
    .filter((z) => Array.isArray(z.coordinates) && z.coordinates.length > 2)
    .map((zona) => {
      const m = (listaMisurazioni?.value || []).find((item) => String(item.zone) === String(zona._id));
      const density = m?.data?.[0]?.density ?? 0;
      const threshold = zona.threshold || 100;
      const ratio = threshold > 0 ? density / threshold : 0;
      const isAlert = density > threshold;

      // Coordinate dal DB sono [lat, lng] -> MapLibre richiede [lng, lat]
      const ring = zona.coordinates.map(([lat, lng]) => [lng, lat]);
      // Chiude il poligono se non è già chiuso
      if (
        ring.length > 0 &&
        (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
      ) {
        ring.push([...ring[0]]);
      }

      return {
        type: "Feature",
        id: zona._id,
        properties: {
          id: zona._id,
          name: zona.name,
          threshold,
          density,
          ratio,
          color: colorGradient(ratio),
          isAlert,
        },
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      };
    });

  return {
    type: "FeatureCollection",
    features,
  };
}

function updateAlertMarkers() {
  if (!map || !listaZone?.value || !listaMisurazioni?.value) {
    alertMarkers.value = [];
    return;
  }

  const list = [];
  (listaZone.value || []).forEach((zona) => {
    if (!Array.isArray(zona.coordinates) || zona.coordinates.length < 3) return;
    const m = (listaMisurazioni.value || []).find((item) => String(item.zone) === String(zona._id));
    const density = m?.data?.[0]?.density ?? 0;
    const threshold = zona.threshold || 100;
    const isAlert = threshold > 0 && density > threshold;

    if (isAlert) {
      const center = calculateZoneCenter(zona.coordinates);
      const p = map.project(center);
      list.push({
        id: String(zona._id),
        name: zona.name,
        density,
        threshold,
        x: Math.round(p.x),
        y: Math.round(p.y),
      });
    }
  });

  alertMarkers.value = list;
}

function onAlertMarkerClick(zoneId) {
  router.push(`/Zone/${zoneId}`);
  focusSelectedZone(zoneId);
}

function syncLayers() {
  if (!map || !map.isStyleLoaded()) return;

  const geojson = buildGeoJSON();
  const source = map.getSource("zones-source");

  if (source) {
    source.setData(geojson);
  } else {
    map.addSource("zones-source", {
      type: "geojson",
      data: geojson,
      promoteId: "id",
    });
  }

  // Rimuove eventuale vecchio layer heatmap se presente
  if (map.getLayer("zones-heatmap")) map.removeLayer("zones-heatmap");
  if (map.getSource("zones-heatmap-source")) map.removeSource("zones-heatmap-source");

  // Layer riempimento trasparente per hit-testing interattivo (hover e click)
  if (!map.getLayer("zones-fill")) {
    map.addLayer({
      id: "zones-fill",
      type: "fill",
      source: "zones-source",
      paint: {
        "fill-color": "#000000",
        "fill-opacity": 0.001,
      },
    });

    // Layer contorno perimetro: visibile ESCLUSIVAMENTE on hover in grigietto
    map.addLayer({
      id: "zones-line",
      type: "line",
      source: "zones-source",
      paint: {
        "line-color": "rgb(80, 80, 80)",
        "line-width": 2.5,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0,
        ],
      },
    });

    // Eventi interattivi mouse
    let hoveredId = null;

    map.on("mousemove", "zones-fill", (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features[0];
        if (hoveredId !== null) {
          map.setFeatureState({ source: "zones-source", id: hoveredId }, { hover: false });
        }
        hoveredId = f.properties.id;
        map.setFeatureState({ source: "zones-source", id: hoveredId }, { hover: true });

        const zoneObj = (listaZone.value || []).find((z) => String(z._id) === String(f.properties.id));
        const eventsObj = (listaEventi.value || []).filter((ev) =>
          Array.isArray(ev.zones) && ev.zones.some((z) => z && String(z._id || z) === String(f.properties.id))
        );
        hoveredZone.value = zoneObj || null;
        hoveredEvents.value = eventsObj;
      }
    });

    map.on("mouseleave", "zones-fill", () => {
      map.getCanvas().style.cursor = "";
      if (hoveredId !== null) {
        map.setFeatureState({ source: "zones-source", id: hoveredId }, { hover: false });
      }
      hoveredId = null;
      hoveredZone.value = null;
      hoveredEvents.value = null;
    });

    map.on("click", "zones-fill", (e) => {
      if (e.features && e.features.length > 0) {
        const zoneId = e.features[0].properties.id;
        router.push(`/Zone/${zoneId}`);
        focusSelectedZone(zoneId);
      }
    });
  }

  updateProjectedPolygons();
  updateAlertMarkers();
}

function focusSelectedZone(zoneId) {
  if (!map || !listaZone?.value) return;
  const targetId = zoneId || route.path.slice(1).split("/")[1];
  if (!targetId) return;

  const targetZone = listaZone.value.find((z) => String(z._id) === String(targetId));
  if (targetZone && Array.isArray(targetZone.coordinates) && targetZone.coordinates.length > 2) {
    const bounds = new maplibregl.LngLatBounds();
    targetZone.coordinates.forEach(([lat, lng]) => {
      bounds.extend([lng, lat]);
    });

    // Calcola padding tenendo conto della sidebar laterale se aperta
    const isSidebarOpen = window.innerWidth >= 640;
    map.fitBounds(bounds, {
      padding: {
        top: 60,
        bottom: 60,
        left: 60,
        right: isSidebarOpen ? 460 : 60,
      },
      maxZoom: 16.5,
      duration: 800,
    });
  }
}

function recenterTrento() {
  if (!map) return;
  const isSidebarOpen = window.innerWidth >= 640 && route.path !== "/Mappa";
  map.flyTo({
    center: isSidebarOpen ? [11.127, 46.0679] : [11.123, 46.0679],
    zoom: 15,
    pitch: 0,
    bearing: 0,
    duration: 800,
  });
}

function toggleTheme() {
  const nextTheme = theme.value === "dark" ? "light" : "dark";
  setTheme(nextTheme);
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: MAP_STYLES[theme.value],
    center: [11.123, 46.0679], // Trento centro
    zoom: 15,
    minZoom: 14,
    maxZoom: 18.5,
    attributionControl: false,
  });

  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: "OpenStreetMap & CARTO",
    }),
    "bottom-right"
  );

  const onMapRender = () => {
    updateProjectedPolygons();
    updateAlertMarkers();
  };

  map.on("load", () => {
    syncLayers();
    focusSelectedZone();
    onMapRender();
  });

  map.on("render", onMapRender);

  watch(
    [listaZone, listaMisurazioni],
    () => {
      syncLayers();
      onMapRender();
    },
    { deep: true }
  );

  watch(
    theme,
    (newTheme) => {
      if (!map) return;
      map.setStyle(MAP_STYLES[newTheme]);
      map.once("style.load", () => {
        syncLayers();
        focusSelectedZone();
        onMapRender();
      });
    }
  );

  watch(
    () => route.path,
    () => {
      const parts = route.path.slice(1).split("/");
      if (parts[0] === "Zone" && parts[1]) {
        focusSelectedZone(parts[1]);
      }
    }
  );

  resizeObserver = new ResizeObserver(() => {
    if (map) {
      map.resize();
      onMapRender();
    }
  });
  if (mapContainer.value) {
    resizeObserver.observe(mapContainer.value);
  }
});

let resizeObserver = null;

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- Canvas Mappa WebGL MapLibre -->
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Layer SVG Poligoni per Zona con Blurring CSS (feGaussianBlur) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="zone-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <!-- Poligoni colorati per zona con blur CSS -->
      <g filter="url(#zone-blur)" opacity="0.55">
        <polygon
          v-for="poly in projectedPolygons"
          :key="poly.id"
          :points="poly.points"
          :fill="poly.color"
        />
      </g>
      <!-- Bordo on-hover nitido in grigietto (#505050 / rgb(80,80,80)) -->
      <polygon
        v-if="hoveredPolygon"
        :points="hoveredPolygon.points"
        fill="transparent"
        stroke="rgb(80, 80, 80)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Marker Esclamativi di Allerta in Primo Piano (z-20, nitidi e sopra il blur) -->
    <div
      v-for="marker in alertMarkers"
      :key="marker.id"
      class="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer transition-transform hover:scale-125"
      :style="{ left: marker.x + 'px', top: marker.y + 'px' }"
      @click="onAlertMarkerClick(marker.id)"
      :title="`${marker.name} — Allerta superamento soglia (${marker.density}/${marker.threshold} pers/m²)`"
    >
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-red-500 opacity-80"></span>
        <div class="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white items-center justify-center text-white text-[11px] font-black shadow-lg">
          !
        </div>
      </div>
    </div>

    <!-- Controlli GIS Flottanti a Sinistra -->
    <div class="absolute top-4 left-4 z-20 flex flex-col gap-2 select-none">
      <!-- Gruppo Zoom & Re-centra -->
      <div class="join join-vertical bg-base-100 border border-base-300 shadow-lg rounded-lg overflow-hidden">
        <button
          @click="map?.zoomIn()"
          class="btn btn-sm btn-ghost join-item p-2 hover:bg-base-200"
          title="Ingrandisci mappa"
        >
          <PlusIcon class="size-4" />
        </button>
        <button
          @click="map?.zoomOut()"
          class="btn btn-sm btn-ghost join-item p-2 hover:bg-base-200 border-t border-base-300"
          title="Rimpicciolisci mappa"
        >
          <MinusIcon class="size-4" />
        </button>
        <button
          @click="recenterTrento"
          class="btn btn-sm btn-ghost join-item p-2 hover:bg-base-200 border-t border-base-300 text-primary"
          title="Re-centra centro storico di Trento"
        >
          <MapPinIcon class="size-4" />
        </button>
      </div>

      <!-- Switcher Tema Mappa (Day/Night) -->
      <button
        @click="toggleTheme"
        class="btn btn-sm btn-square bg-base-100 border border-base-300 shadow-lg hover:bg-base-200"
        :title="theme === 'dark' ? 'Passa alla mappa chiara (Positron)' : 'Passa alla mappa scura (Dark Matter)'"
      >
        <SunIcon v-if="theme === 'dark'" class="size-4 text-warning" />
        <MoonIcon v-else class="size-4 text-primary" />
      </button>
    </div>

    <!-- Legenda Densità ancorata in basso a sinistra -->
    <div class="absolute bottom-4 left-4 z-20">
      <MapLegend />
    </div>

    <!-- Tooltip al passaggio del mouse su zona -->
    <ZoneTooltip
      v-if="hoveredZone"
      v-model:hoveredZone="hoveredZone"
      v-model:hoveredEvents="hoveredEvents"
    />
  </div>
</template>

<style>
.maplibregl-canvas {
  outline: none;
}
</style>
