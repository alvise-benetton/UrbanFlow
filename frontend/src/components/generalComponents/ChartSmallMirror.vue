<script setup>
import { inject, onMounted, onUnmounted, ref, watch, computed } from "vue";
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns";

const chartCanvas = ref(null);
let chartInstance = null;

const event = defineModel("event");
const zone = defineModel("zone");
const zones = defineModel("zoneList");
const misurazioni = inject("listaMisurazioni", ref([]));
const theme = inject("theme", ref("light"));

const isDark = computed(() => theme.value === "dark");

const thresholdValue = computed(() => {
  if (zone.value && typeof zone.value.threshold === "number") {
    return zone.value.threshold;
  }
  return null;
});

const chartPoints = computed(() => {
  if (!misurazioni.value || misurazioni.value.length === 0) return [];

  // Estrae gli ID delle zone interessate
  let targetZoneIds = [];
  if (zone.value && (zone.value._id || typeof zone.value === "string")) {
    targetZoneIds = [String(zone.value._id || zone.value)];
  } else if (event.value && Array.isArray(event.value.zones)) {
    targetZoneIds = event.value.zones.map((z) => String(z._id || z)).filter(Boolean);
  }

  const matchedRecords = targetZoneIds.length > 0
    ? misurazioni.value.filter((m) => targetZoneIds.includes(String(m.zone)))
    : [misurazioni.value[0]].filter(Boolean);

  if (matchedRecords.length === 0) return [];

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

  // Prende i punti delle ultime 24 ore (intervalli a 30 minuti)
  return allPoints.slice(-48);
});

const hasData = computed(() => chartPoints.value.length > 0);

const currentVal = computed(() => {
  if (!chartPoints.value.length) return 0;
  return chartPoints.value[chartPoints.value.length - 1].y;
});

const maxVal = computed(() => {
  if (!chartPoints.value.length) return 0;
  return Math.max(...chartPoints.value.map((p) => p.y));
});

const avgVal = computed(() => {
  if (!chartPoints.value.length) return 0;
  const sum = chartPoints.value.reduce((acc, p) => acc + p.y, 0);
  return Math.round(sum / chartPoints.value.length);
});

const isOverThreshold = computed(() => {
  if (!thresholdValue.value) return false;
  return currentVal.value > thresholdValue.value;
});

// Plugin personalizzato per tracciare la linea della soglia di sicurezza
const thresholdPlugin = {
  id: "thresholdLine",
  afterDraw(chart) {
    const t = thresholdValue.value;
    if (t === null || t === undefined || t <= 0) return;
    const yScale = chart.scales.y;
    const xScale = chart.scales.x;
    if (!yScale || !xScale) return;
    const yPos = yScale.getPixelForValue(t);
    if (yPos < yScale.top || yPos > yScale.bottom) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.moveTo(xScale.left, yPos);
    ctx.lineTo(xScale.right, yPos);
    ctx.stroke();

    // Etichetta "Soglia Max: N"
    ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
    ctx.font = "bold 9px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`SOGLIA MAX ${t}`, xScale.right - 4, yPos - 3);
    ctx.restore();
  },
};

function renderChart() {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!hasData.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  const chartHeight = chartCanvas.value.clientHeight || 176;
  const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);

  const mainColor = isOverThreshold.value ? "239, 68, 68" : "59, 130, 246";
  gradient.addColorStop(0, `rgba(${mainColor}, 0.32)`);
  gradient.addColorStop(0.65, `rgba(${mainColor}, 0.06)`);
  gradient.addColorStop(1, `rgba(${mainColor}, 0.0)`);

  const gridColor = isDark.value ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)";
  const tickColor = isDark.value ? "#94a3b8" : "#64748b";

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Densità pedonale",
          data: chartPoints.value,
          fill: true,
          backgroundColor: gradient,
          borderColor: `rgb(${mainColor})`,
          borderWidth: 2.2,
          tension: 0.35,
          cubicInterpolationMode: "monotone",
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: `rgb(${mainColor})`,
          pointHoverBorderWidth: 2.5,
        },
      ],
    },
    plugins: [thresholdPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: isDark.value ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)",
          titleColor: isDark.value ? "#f8fafc" : "#0f172a",
          bodyColor: isDark.value ? "#cbd5e1" : "#334155",
          borderColor: isDark.value ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)",
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6,
          boxPadding: 4,
          displayColors: false,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const date = new Date(items[0].parsed.x);
              return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            },
            label: (ctx) => {
              const val = ctx.parsed.y;
              const t = thresholdValue.value;
              if (t && t > 0) {
                const diff = val - t;
                const status = diff > 0 ? ` (+${diff} sopra soglia)` : ` (${Math.abs(diff)} sotto soglia)`;
                return `Densità: ${val} ped/m²${status}`;
              }
              return `Densità: ${val} pedoni/m²`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: { hour: "HH:mm" },
          },
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          ticks: {
            maxTicksLimit: 6,
            color: tickColor,
            font: { size: 10, family: "ui-monospace, monospace" },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          ticks: {
            color: tickColor,
            font: { size: 10, family: "ui-monospace, monospace" },
            callback: (val) => `${val}`,
          },
        },
      },
    },
  });
}

onMounted(() => {
  renderChart();
});

watch(
  [chartPoints, () => event?.value, () => zone?.value, theme],
  () => {
    renderChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <div class="flex flex-col bg-base-100 border border-base-300 rounded-xl p-4 gap-3 shadow-sm select-none">
    <!-- Header del Grafico con Titolo e Indicatori -->
    <div class="flex items-center justify-between pb-2 border-b border-base-200">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            :class="isOverThreshold ? 'bg-error' : 'bg-success'"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2"
            :class="isOverThreshold ? 'bg-error' : 'bg-success'"
          ></span>
        </span>
        <span class="text-xs font-bold text-base-content tracking-tight">Andamento Flusso (Ultime 24h)</span>
      </div>

      <div class="flex items-center gap-1.5">
        <span v-if="thresholdValue" class="badge badge-xs text-[10px] font-mono" :class="isOverThreshold ? 'badge-error text-white' : 'badge-ghost text-gray-500'">
          Soglia: {{ thresholdValue }}
        </span>
        <span class="badge badge-xs badge-info text-white font-semibold">Live</span>
      </div>
    </div>

    <!-- Mini KPI Cards in testata al grafico -->
    <div v-if="hasData" class="grid grid-cols-3 gap-2 text-center font-mono">
      <div class="bg-base-200/60 rounded-lg p-2 border border-base-300/60 flex flex-col">
        <span class="text-[9px] text-gray-500 uppercase font-sans font-semibold">Attuale</span>
        <span class="text-sm font-bold mt-0.5" :class="isOverThreshold ? 'text-error' : 'text-base-content'">
          {{ currentVal }} <small class="text-[9px] font-sans font-normal text-gray-400">ped/m²</small>
        </span>
      </div>
      <div class="bg-base-200/60 rounded-lg p-2 border border-base-300/60 flex flex-col">
        <span class="text-[9px] text-gray-500 uppercase font-sans font-semibold">Picco 24h</span>
        <span class="text-sm font-bold text-base-content mt-0.5">
          {{ maxVal }} <small class="text-[9px] font-sans font-normal text-gray-400">ped/m²</small>
        </span>
      </div>
      <div class="bg-base-200/60 rounded-lg p-2 border border-base-300/60 flex flex-col">
        <span class="text-[9px] text-gray-500 uppercase font-sans font-semibold">Media 24h</span>
        <span class="text-sm font-bold text-base-content mt-0.5">
          {{ avgVal }} <small class="text-[9px] font-sans font-normal text-gray-400">ped/m²</small>
        </span>
      </div>
    </div>

    <!-- Canvas del Grafico -->
    <div v-if="hasData" class="relative w-full h-44 mt-1">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Stato Vuoto -->
    <div v-else class="flex flex-col items-center justify-center p-8 text-gray-400 text-xs gap-1.5 bg-base-200/40 rounded-lg">
      <svg class="size-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span class="font-medium">Nessuna misurazione recente registrata</span>
    </div>
  </div>
</template>

<style scoped>
</style>
