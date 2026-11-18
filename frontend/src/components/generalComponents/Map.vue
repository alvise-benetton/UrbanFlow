<script setup>
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import ZoomPane from "../mapComponents/ZoomPane.vue";
import eventBus from "../utility/eventBus";
import ZoneTooltip from "../mapComponents/ZoneTooltip.vue";
import router from "../utility/router";

maplibregl.setWorkerUrl(workerUrl);

const VOYAGER_STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const WARN_ICON_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2U1NGE0YSIgY2xhc3M9InNpemUtNiI+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPgogICAgICA8ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMCIgc3RkRGV2aWF0aW9uPSIyIiBmbG9vZC1jb2xvcj0iIzdhNzk3OSIgZmxvb2Qtb3BhY2l0eT0iMC41Ii8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0id2hpdGUiIGZpbHRlcj0idXJsKCNzaGFkb3cpIi8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMi4yNSAxMmMwLTUuMzg1IDQuMzY1LTkuNzUgOS43NS05Ljc1czkuNzUgNC4zNjUgOS43NSA5Ljc1LTQuMzY1IDkuNzUtOS43NSA5Ljc1UzIuMjUgMTcuMzg1IDIuMjUgMTJaTTEyIDguMjVhLjc1Ljc1IDAgMCAxIC43NS43NXYzLjc1YS43NS43NSAwIDAgMS0xLjUgMFY5YS43NS43NSAwIDAgMSAuNzUtLjc1Wm0wIDguMjVhLjc1Ljc1IDAgMSAwIDAtMS41Ljc1Ljc1IDAgMCAwIDAgMS41WiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPgo8L3N2Zz4K";

const props = defineProps({
  selectedZoneId: { type: String, default: null },
  highlightedZoneIds: { type: Array, default: () => [] },
  hasOpenPanel: { type: Boolean, default: false },
});

const listaZone = inject("listaZone");
const listaEventi = inject("listaEventi");
const listaMisurazioni = inject("listaMisurazioni");

const mapContainer = ref(null);
let map = null;
let resizeObserver = null;
let syncingZoomFromMap = false;
let lastFocusedKey = "";

const zoomLevel = ref(15);
const zonesVisible = ref(true);
const isTouchDevice = ref(
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)")?.matches)
);

const hoveredZone = ref(null);
const hoveredEvents = ref(null);
const projectedPolygons = ref([]);
const warnMarkers = ref([]);

const hoveredPolygon = computed(() => {
  if (!hoveredZone.value) return null;
  return projectedPolygons.value.find((p) => p.id === String(hoveredZone.value._id)) || null;
});

const highlightedIdsSet = computed(() => {
  const ids = new Set((props.highlightedZoneIds || []).map((id) => String(id)));
  if (props.selectedZoneId) {
    ids.add(String(props.selectedZoneId));
  }
  return ids;
});

const highlightedPolygons = computed(() => {
  if (highlightedIdsSet.value.size === 0) return [];
  return projectedPolygons.value.filter((p) => highlightedIdsSet.value.has(p.id));
});

const activeFocusIds = computed(() => Array.from(highlightedIdsSet.value).sort());

function colorGradient(densityRatio) {
  if (densityRatio >= 1.5) {
    return "rgb(255,0,0)";
  }
  if (densityRatio > 1) {
    return "rgb(255,121,0)";
  }
  if (densityRatio > 0.7) {
    return "rgb(255,239,2)";
  }
  if (densityRatio > 0.5) {
    return "rgb(131,243,13)";
  }
  return "rgb(47,235,14)";
}

function zoneMidPoint(coords) {
  let latSum = 0;
  let lngSum = 0;
  for (let i = 0; i < coords.length; i++) {
    latSum += coords[i][0];
    lngSum += coords[i][1];
  }
  return [lngSum / coords.length, latSum / coords.length];
}

function getZoneDensity(zoneId) {
  const m = (listaMisurazioni?.value || []).find((item) => String(item.zone) === String(zoneId));
  return m?.data?.[0]?.density ?? 0;
}

function buildGeoJSON() {
  if (!listaZone?.value || !Array.isArray(listaZone.value)) {
    return { type: "FeatureCollection", features: [] };
  }

  const features = listaZone.value
    .filter((zona) => Array.isArray(zona.coordinates) && zona.coordinates.length > 0)
    .map((zona) => {
      const ring = zona.coordinates.map(([lat, lng]) => [lng, lat]);
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

function updateOverlays() {
  if (!map || !listaZone?.value || !listaMisurazioni?.value) {
    projectedPolygons.value = [];
    warnMarkers.value = [];
    return;
  }

  const polys = [];
  const markers = [];

  listaZone.value.forEach((zona) => {
    if (!Array.isArray(zona.coordinates) || zona.coordinates.length === 0) return;

    const density = getZoneDensity(zona._id);
    const ratio = zona.threshold ? density / zona.threshold : 0;
    const color = colorGradient(ratio);

    const points = zona.coordinates
      .map(([lat, lng]) => {
        const p = map.project([lng, lat]);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

    polys.push({
      id: String(zona._id),
      points,
      color,
    });

    if (density > zona.threshold) {
      const center = zoneMidPoint(zona.coordinates);
      const p = map.project(center);
      markers.push({
        id: String(zona._id),
        name: zona.name,
        x: p.x,
        y: p.y,
      });
    }
  });

  projectedPolygons.value = polys;
  warnMarkers.value = markers;
}

function clickHandler(zona) {
  if (isTouchDevice.value) {
    hoveredZone.value = null;
    hoveredEvents.value = null;
  }
  router.push(`/Zone/${zona}`);
}

function focusZones(zoneIds) {
  if (!map || !listaZone?.value) return;
  const targetIds = Array.isArray(zoneIds)
    ? zoneIds.map(String)
    : zoneIds
      ? [String(zoneIds)]
      : [];
  if (targetIds.length === 0) return;

  const bounds = new maplibregl.LngLatBounds();
  let hasPoint = false;
  listaZone.value
    .filter((z) => targetIds.includes(String(z._id)))
    .forEach((targetZone) => {
      if (Array.isArray(targetZone.coordinates)) {
        targetZone.coordinates.forEach(([lat, lng]) => {
          bounds.extend([lng, lat]);
          hasPoint = true;
        });
      }
    });
  if (!hasPoint) return;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  map.fitBounds(bounds, {
    padding: isMobile
      ? { top: 70, bottom: 320, left: 40, right: 40 }
      : { top: 80, bottom: 80, left: 80, right: 380 },
    maxZoom: 16.5,
    duration: 650,
  });
  lastFocusedKey = targetIds.slice().sort().join(",");
}

function resetView() {
  if (!map) return;
  map.flyTo({ center: [11.123, 46.0679], zoom: 15, duration: 550 });
}

function syncLayers() {
  if (!map || !map.isStyleLoaded()) return;

  const geojson = buildGeoJSON();
  const existingSource = map.getSource("zones-source");

  if (existingSource) {
    existingSource.setData(geojson);
  } else {
    map.addSource("zones-source", {
      type: "geojson",
      data: geojson,
      promoteId: "id",
    });
  }

  if (!map.getLayer("zones-fill")) {
    map.addLayer({
      id: "zones-fill",
      type: "fill",
      source: "zones-source",
      layout: {
        visibility: zonesVisible.value ? "visible" : "none",
      },
      paint: {
        "fill-color": "#000000",
        "fill-opacity": 0.001,
      },
    });

    map.on("mousemove", "zones-fill", (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const zoneId = e.features[0].properties.id;
        const tempZone = listaZone?.value?.find((zona) => String(zona._id) === String(zoneId));
        const tempEvents = (listaEventi?.value || []).filter(
          (evento) =>
            Array.isArray(evento.zones) &&
            evento.zones.some((z) => String(z._id || z) === String(tempZone?._id))
        );
        hoveredZone.value = tempZone || null;
        hoveredEvents.value = tempEvents;
      }
    });

    map.on("mouseleave", "zones-fill", () => {
      map.getCanvas().style.cursor = "";
      hoveredZone.value = null;
      hoveredEvents.value = null;
    });

    map.on("click", "zones-fill", (e) => {
      if (e.features && e.features.length > 0) {
        clickHandler(e.features[0].properties.id);
      }
    });
  }

  updateOverlays();
}

function filterUpdate(activeFilters) {
  const showZones = activeFilters.includes("Zone");
  zonesVisible.value = showZones;
  if (!showZones) {
    hoveredZone.value = null;
    hoveredEvents.value = null;
  }
  if (map && map.getLayer("zones-fill")) {
    map.setLayoutProperty("zones-fill", "visibility", showZones ? "visible" : "none");
  }
}

function filterHandler() {
  watch(
    () => eventBus.filters.filters.value.length,
    () => {
      filterUpdate(eventBus.filters.filters.value);
    }
  );
}

watch(zoomLevel, (newZoom) => {
  if (syncingZoomFromMap || !map) return;
  map.zoomTo(newZoom, { duration: 200 });
});

const mapInit = () => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: VOYAGER_STYLE_URL,
    center: [11.123, 46.0679],
    zoom: 15,
    minZoom: 15,
    maxZoom: 17,
    attributionControl: false,
  });

  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: "OpenStreetMap & CARTO",
    }),
    "bottom-right"
  );

  filterHandler();

  map.on("load", () => {
    syncLayers();
    updateOverlays();
    if (activeFocusIds.value.length > 0) {
      focusZones(activeFocusIds.value);
    }
  });

  map.on("render", updateOverlays);

  map.on("zoomend", () => {
    if (!map) return;
    syncingZoomFromMap = true;
    zoomLevel.value = Math.min(17, Math.max(15, Math.round(map.getZoom())));
    nextTick(() => {
      syncingZoomFromMap = false;
    });
  });

  watch(
    [activeFocusIds, listaZone],
    ([newIds]) => {
      const nextKey = (newIds || []).join(",");
      if (!nextKey) {
        lastFocusedKey = "";
        return;
      }
      if (nextKey !== lastFocusedKey) {
        focusZones(newIds);
      }
    }
  );

  watch(
    [listaZone, listaMisurazioni],
    () => {
      syncLayers();
      updateOverlays();
    },
    { deep: true }
  );

  resizeObserver = new ResizeObserver(() => {
    if (map) {
      map.resize();
      updateOverlays();
    }
  });
  if (mapContainer.value) {
    resizeObserver.observe(mapContainer.value);
  }
};

onMounted(mapInit);

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
  <div class="relative flex">
    <div ref="mapContainer" id="map"></div>
    <svg
      v-show="zonesVisible"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      class="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[1]"
    >
      <defs>
        <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g filter="url(#blur)" opacity="0.5">
        <polygon
          v-for="poly in projectedPolygons"
          :key="poly.id"
          :points="poly.points"
          :fill="poly.color"
        />
      </g>
      <polygon
        v-for="poly in highlightedPolygons"
        :key="'hl-' + poly.id"
        :points="poly.points"
        fill="transparent"
        stroke="rgb(70,70,70)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <polygon
        v-if="hoveredPolygon && !highlightedIdsSet.has(hoveredPolygon.id)"
        :points="hoveredPolygon.points"
        fill="transparent"
        stroke="rgb(80,80,80)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div
      v-if="zonesVisible"
      class="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[2]"
    >
      <button
        v-for="marker in warnMarkers"
        :key="marker.id"
        type="button"
        class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group flex items-center justify-center w-8 h-8 rounded-full focus:outline-none touch-manipulation"
        :style="{ left: marker.x + 'px', top: marker.y + 'px' }"
        :aria-label="'Allerta in ' + marker.name"
        :title="'Allerta in ' + marker.name"
        @click="clickHandler(marker.id)"
      >
        <span class="absolute w-6 h-6 rounded-full bg-red-500/40 animate-ping"></span>
        <img
          :src="WARN_ICON_URL"
          alt=""
          class="relative w-[25px] h-[25px] group-hover:scale-110 transition-transform"
        />
      </button>
    </div>
    <div
      class="flex items-end gap-2.5 fixed bottom-20 left-3 md:bottom-5 md:left-5 z-10"
      :class="{ 'max-md:hidden': hasOpenPanel }"
    >
      <ZoomPane v-model="zoomLevel" @reset="resetView"></ZoomPane>
      <div
        class="hidden sm:flex items-center gap-2.5 bg-base-200/95 backdrop-blur px-3 py-2 rounded-box shadow-md border border-base-300 text-xs text-base-content/80 select-none"
        aria-label="Legenda densità"
      >
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#2feb0e]"></span>&lt;50%</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#ffef02]"></span>&gt;70%</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#ff7900]"></span>&gt;100%</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#ff0000]"></span>≥150%</span>
      </div>
    </div>
    <ZoneTooltip
      v-if="hoveredZone != null && !isTouchDevice"
      v-model:hoveredZone="hoveredZone"
      v-model:hoveredEvents="hoveredEvents"
    ></ZoneTooltip>
  </div>
</template>

<style>
#map {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.maplibregl-canvas {
  filter: brightness(0.85);
  outline: none;
}
</style>
