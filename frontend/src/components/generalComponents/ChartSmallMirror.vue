<script setup>
import { inject, onMounted, onUnmounted, ref, watch, computed } from "vue";
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns";

const chartCanvas = ref(null);
let chartInstance = null;

const event = defineModel("event");
const zones = defineModel("zoneList");
const misurazioni = inject("listaMisurazioni", ref([]));

const chartPoints = computed(() => {
  if (!misurazioni.value || misurazioni.value.length === 0) return [];

  // Extract zone IDs to inspect
  let targetZoneIds = [];
  if (event.value && Array.isArray(event.value.zones)) {
    targetZoneIds = event.value.zones.map((z) => String(z._id || z)).filter(Boolean);
  }

  // If no specific zones, take first available measurement
  const matchedRecords = targetZoneIds.length > 0
    ? misurazioni.value.filter((m) => targetZoneIds.includes(String(m.zone)))
    : [misurazioni.value[0]].filter(Boolean);

  if (matchedRecords.length === 0) return [];

  // Combine and sort points ascending by timestamp
  const allPoints = [];
  matchedRecords.forEach((rec) => {
    if (Array.isArray(rec.data)) {
      rec.data.forEach((pt) => {
        if (pt && typeof pt.density === "number" && pt.timestamp) {
          allPoints.push({
            x: new Date(pt.timestamp),
            y: pt.density,
          });
        }
      });
    }
  });

  allPoints.sort((a, b) => a.x - b.x);

  // Take the most recent 48 points (last 24 hours at 30-min intervals) for clarity
  return allPoints.slice(-48);
});

const hasData = computed(() => chartPoints.value.length > 0);

function renderChart() {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!hasData.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Densità pedonale (pers/m²)",
          data: chartPoints.value,
          fill: true,
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 1.5,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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
}

onMounted(() => {
  renderChart();
});

watch([chartPoints, () => event.value], () => {
  renderChart();
}, { deep: true });

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
