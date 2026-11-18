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
  "#1F4FA3",
  "#0D9488",
  "#D97706",
  "#7C3AED",
  "#DB2777",
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

const isSingleZoneMode = computed(
  () => Boolean(zone.value && (zone.value._id || typeof zone.value === "string"))
);

const chartDatasets = computed(() => {
  if (!misurazioni.value || misurazioni.value.length === 0) return [];

  const availableZones = zones?.value?.length ? zones.value : injectedZones?.value || [];

  // Single-zone view with threshold line and clean breach highlights
  if (isSingleZoneMode.value) {
    const targetId = String(zone.value._id || zone.value);
    const rec = misurazioni.value.find((m) => String(m.zone) === targetId);
    const pts = extractRecentPoints(rec);
    if (pts.length === 0) return [];

    const threshold = Number(zone.value.threshold);
    const hasThreshold = Number.isFinite(threshold) && threshold > 0;
    const pointRadii = pts.map((p) => (hasThreshold && p.y > threshold ? 3 : 0));
    const pointColors = pts.map((p) =>
      hasThreshold && p.y > threshold ? "#B3261E" : "#1F4FA3"
    );

    const datasets = [
      {
        label: zone.value.name || "Densità pedonale",
        data: pts,
        fill: true,
        borderColor: "#1F4FA3",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: pointRadii,
        pointHoverRadius: 5,
        pointHitRadius: 12,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        _useAreaGradient: true,
      },
    ];

    if (hasThreshold) {
      datasets.push({
        label: `Limite (${threshold})`,
        data: [
          { x: pts[0].x, y: threshold },
          { x: pts[pts.length - 1].x, y: threshold },
        ],
        borderColor: "rgba(179, 38, 30, 0.85)",
        backgroundColor: "transparent",
        borderDash: [5, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
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
        backgroundColor: "transparent",
        borderColor: color,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4.5,
        pointHitRadius: 12,
        pointBackgroundColor: color,
        pointBorderColor: color,
        _useAreaGradient: matchedRecords.length === 1,
      };
    })
    .filter(Boolean);
});

const hasData = computed(() => chartDatasets.value.length > 0);

const peakDensity = computed(() => {
  let maxVal = null;
  chartDatasets.value.forEach((ds) => {
    if (String(ds.label || "").startsWith("Limite")) return;
    ds.data.forEach((pt) => {
      if (maxVal === null || pt.y > maxVal) maxVal = pt.y;
    });
  });
  return maxVal;
});

const legendItems = computed(() => {
  if (isSingleZoneMode.value) {
    const items = [{ label: "Densità", color: "#1F4FA3", dashed: false }];
    const threshold = Number(zone.value?.threshold);
    if (Number.isFinite(threshold) && threshold > 0) {
      items.push({ label: `Limite (${threshold})`, color: "#B3261E", dashed: true });
    }
    return items;
  }
  return chartDatasets.value.map((ds) => ({
    label: ds.label,
    color: ds.borderColor,
    dashed: false,
  }));
});

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

  const ctx = chartCanvas.value.getContext("2d");
  const areaGradient = ctx.createLinearGradient(0, 0, 0, 160);
  areaGradient.addColorStop(0, "rgba(31, 79, 163, 0.26)");
  areaGradient.addColorStop(1, "rgba(31, 79, 163, 0.0)");

  const datasets = chartDatasets.value.map((ds) => {
    const { _useAreaGradient, ...clean } = ds;
    return {
      ...clean,
      backgroundColor: _useAreaGradient ? areaGradient : clean.backgroundColor,
      data: [...clean.data],
    };
  });

  if (
    chartInstance &&
    lastContextKey === contextKey.value &&
    chartInstance.data.datasets.length === datasets.length
  ) {
    datasets.forEach((ds, i) => {
      Object.assign(chartInstance.data.datasets[i], ds);
    });
    chartInstance.update("none");
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: { datasets },
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
          backgroundColor: "#1D2633",
          titleColor: "#E6EAF0",
          bodyColor: "#FFFFFF",
          borderColor: "rgba(220, 225, 232, 0.25)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          titleFont: {
            family: "'Atkinson Hyperlegible Next', sans-serif",
            size: 11,
            weight: "600",
          },
          bodyFont: {
            family: "'Atkinson Hyperlegible Next', sans-serif",
            size: 12,
          },
          filter: (item) => !String(item.dataset.label || "").startsWith("Limite"),
          callbacks: {
            label: (ctxItem) => ` ${ctxItem.dataset.label}: ${ctxItem.parsed.y} pedoni`,
          },
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
          border: { display: false },
          grid: { display: false },
          ticks: {
            maxTicksLimit: 5,
            color: "#64748B",
            font: { family: "'Atkinson Hyperlegible Next', sans-serif", size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false, dash: [4, 4] },
          grid: { color: "rgba(148, 163, 184, 0.22)" },
          ticks: {
            maxTicksLimit: 5,
            color: "#64748B",
            font: { family: "'Atkinson Hyperlegible Next', sans-serif", size: 10 },
          },
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
  <div class="flex flex-col shrink-0 bg-base-200/80 rounded-box p-3.5 sm:p-4 gap-2.5 border border-base-300/80">
    <div class="flex justify-between items-center gap-2 text-xs">
      <span class="font-semibold text-base-content/75">Andamento densità · ultime 24h</span>
      <div v-if="hasData" class="flex items-center gap-2 shrink-0">
        <span v-if="peakDensity !== null" class="text-base-content/60 tabular-nums">
          Picco: <strong class="text-base-content">{{ peakDensity }}</strong>
        </span>
        <span class="h-5 px-2 rounded-full bg-primary text-white text-[11px] font-semibold leading-none inline-flex items-center justify-center">
          Live
        </span>
      </div>
    </div>

    <!-- Legenda pulita HTML -->
    <div v-if="hasData && legendItems.length > 0" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-base-content/70 tabular-nums">
      <span v-for="item in legendItems" :key="item.label" class="inline-flex items-center gap-1.5">
        <span
          class="inline-block w-3.5 h-0.5 rounded-full"
          :style="
            item.dashed
              ? { borderTop: `2px dashed ${item.color}`, backgroundColor: 'transparent', height: '0' }
              : { backgroundColor: item.color }
          "
        ></span>
        <span>{{ item.label }}</span>
      </span>
    </div>

    <div v-if="hasData" class="relative w-full h-40 min-h-40 shrink-0">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="flex flex-col items-center justify-center p-6 text-base-content/50 text-xs gap-1">
      <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Nessuna misurazione recente registrata</span>
    </div>
  </div>
</template>

<style scoped>
</style>
