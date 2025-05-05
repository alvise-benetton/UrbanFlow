<script setup>
import { inject, onMounted, ref } from "vue";
import { Chart } from "chart.js/auto";
import { chartData, chartOptions } from "../../assets/chartSetup.js";
const chart = ref(null);
const event = defineModel("event");
const zones = defineModel("zoneList");
const misuraz = inject("listaMisurazioni");

onMounted(() => {
  const ctx = chart.value.getContext("2d");
  new Chart(ctx, {
    type: "line", // Tipo di grafico
    data: chartData,
    // options: {
    //   ...chartOptions, // Usa la configurazione base
    //   scales: {
    //     ...chartOptions.scales, // Mantieni le altre opzioni per gli assi
    //     x: {
    //       ...chartOptions.scales.x,
    //       min: getThreeHoursBefore(), // Imposta l'orario minimo su 3 ore fa
    //       max: new Date(), // Imposta l'orario massimo sull'ora corrente
    //     },
    //   },
    // },
    options: chartOptions,
  });
});

function getChartData(){

  const mis = misuraz.value.filter((m)=>zones.includes(m.zone));  

  const startTime = new Date(event.value.startDate).getTime();

  const endTime = new Date(event.value.endDate).getTime();

  const filteredByTime = mis.data.filter((d)=>d.timestamp >= startTime && d.timestamp <= endTime); // QUESTE COSE VANNO FATTE A BACK END!


}

</script>
<template>
  <div class="flex flex-col bg-base-300 rounded-box gap-0 overflow-hidden">
    <canvas ref="chart" class="w-100 pt-10"></canvas>
   <!--  <div class="data flex items-center justify-between p-5">
      <button class="btn btn-sm">Mostra dati storici</button>
      <span class="font-bold">765</span>
    </div> -->
  </div>
</template>
<style scoped>
.data {
  background-color: rgba(75, 192, 192, 0.5);
}
</style>
