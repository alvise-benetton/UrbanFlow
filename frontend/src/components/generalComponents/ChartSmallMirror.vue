<script setup>
import { inject, onMounted, onUnmounted, ref, watch, computed } from "vue";
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns";

const chartCanvas = ref(null);
let chartInstance = null;
let lastContextKey = "";

const event = defineModel("event");
const zone = defineModel("zone");
const zones = defineModel("zoneList");
const misurazioni = inject("listaMisurazioni", ref([]));
const injectedZones = inject("listaZone", ref([]));

const PALETTE = [
  "rgb(59, 130, 246)",
  "rgb(16, 185, 129)",
  "rgb(245, 158, 11)",
  "rgb(168, 85, 247)",
  "rgb(236, 72, 153)",
];
const FILL_PALETTE = [
  "rgba(59, 130, 246, 0.14)",
  "rgba(16, 185, 129, 0.12)",
  "rgba(245, 158, 11, 0.12)",
  "rgba(168, 85, 247, 0.12)",
  "rgba(236, 72, 153, 0.12)",
];

function extractRecentPoints(rec) {
  if (!rec || !Array.isArray(rec.data)) return [];
  const pts = [];
  rec.data.forEach((pt) => {
    if (pt && typeof pt.density === "number" && pt.timestamp) {
      pts.push({ x: new Date(pt.timestamp), y: pt.density });
    }
  });
  pts.sort((a, b) => a.x - b.x);
  return pts.slice(-48);
}

const contextKey = computed(() => {
  if (zone.value && (zone.value._id || typeof zone.value === "string")) {
    return "zone:" + String(zone.value._id || zone.value);
  }
  if (event.value && Array.isArray(event.value.zones)) {
    return (
      "event:" +
      event.value.zones
        .map((z) => String(z?._id || z))
        .filter(Boolean)
        .sort()
        .join(",")
    );
  }
  return "default";
});

const chartDatasets = computed(() => {
  if (!misurazioni.value || misurazioni.value.length === 0) return [];

  const availableZones = zones?.value?.length ? zones.value : injectedZones?.value || [];

  // Single-zone view with threshold line and above-threshold point highlighting
  if (zone.value && (zone.value._id || typeof zone.value === "string")) {
    const targetId = String(zone.value._id || zone.value);
    const rec = misurazioni.value.find((m) => String(m.zone) === targetId);
    const pts = extractRecentPoints(rec);
    if (pts.length === 0) return [];

    const threshold = Number(zone.value.threshold);
    const hasThreshold = Number.isFinite(threshold) && threshold > 0;
    const pointColors = pts.map((p) =>
      hasThreshold && p.y > threshold ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)"
    );

    const datasets = [
      {
        label: zone.value.name || "Densità pedonale",
        data: pts,
        fill: true,
        backgroundColor: FILL_PALETTE[0],
        borderColor: PALETTE[0],
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4.5,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
      },
    ];

    if (hasThreshold) {
      datasets.push({
        label: `Limite (${threshold})`,
        data: [
          { x: pts[0].x, y: threshold },
          { x: pts[pts.length - 1].x, y: threshold },
        ],
        borderColor: "rgba(239, 68, 68, 0.85)",
        backgroundColor: "transparent",
        borderDash: [5, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      });
    }

    return datasets;
  }

  // Event view: separate line per assigned zone
  let targetZoneIds = [];
  if (event.value && Array.isArray(event.value.zones)) {
    targetZoneIds = event.value.zones.map((z) => String(z._id || z)).filter(Boolean);
  }
  const matchedRecords =
    targetZoneIds.length > 0
      ? misurazioni.value.filter((m) => targetZoneIds.includes(String(m.zone)))
      : [misurazioni.value[0]].filter(Boolean);

  return matchedRecords
    .map((rec, idx) => {
      const pts = extractRecentPoints(rec);
      if (pts.length === 0) return null;
      const matchedZone = availableZones.find((z) => String(z._id) === String(rec.zone));
      const color = PALETTE[idx % PALETTE.length];
      return {
        label: matchedZone?.name || `Zona ${idx + 1}`,
        data: pts,
        fill: matchedRecords.length === 1,
        backgroundColor: matchedRecords.length === 1 ? FILL_PALETTE[idx % FILL_PALETTE.length] : "transparent",
        borderColor: color,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 1.5,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color,
      };
    })
    .filter(Boolean);
});

const hasData = computed(() => chartDatasets.value.length > 0);

function renderChart() {
  if (!chartCanvas.value) return;

  if (!hasData.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
      lastContextKey = "";
    }
    return;
  }

  const datasets = chartDatasets.value.map((ds) => ({ ...ds, data: [...ds.data] }));
  const showLegend = datasets.length > 1;

  if (
    chartInstance &&
    lastContextKey === contextKey.value &&
    chartInstance.data.datasets.length === datasets.length
  ) {
    datasets.forEach((ds, i) => {
      Object.assign(chartInstance.data.datasets[i], ds);
    });
    chartInstance.options.plugins.legend.display = showLegend;
    chartInstance.update("none");
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = chartCanvas.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            color: "#9ca3af",
            font: { size: 10 },
          },
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: { hour: "HH:mm" },
            tooltipFormat: "dd/MM HH:mm",
          },
          grid: { color: "rgba(200, 200, 200, 0.15)" },
          ticks: { maxTicksLimit: 6, color: "#888", font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(200, 200, 200, 0.15)" },
          ticks: { color: "#888", font: { size: 10 } },
        },
      },
    },
  });
  lastContextKey = contextKey.value;
}

onMounted(() => {
  renderChart();
});

watch([chartDatasets, contextKey], () => {
  renderChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <div class="flex flex-col bg-base-200 rounded-box p-4 gap-2 overflow-hidden shadow-inner">
    <div class="flex justify-between items-center text-xs font-semibold text-gray-500">
      <span>Andamento densità (ultime 24h)</span>
      <span v-if="hasData" class="badge badge-sm badge-info text-white">Live</span>
    </div>
    <div v-if="hasData" class="relative w-full h-40">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="flex flex-col items-center justify-center p-6 text-gray-400 text-xs gap-1">
      <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Nessuna misurazione recente registrata</span>
    </div>
  </div>
</template>

<style scoped>
</style>
