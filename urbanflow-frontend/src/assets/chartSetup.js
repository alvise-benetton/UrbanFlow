import { Bars3BottomLeftIcon } from "@heroicons/vue/24/solid";
import { layouts } from "chart.js";
import "chartjs-adapter-date-fns";
// Dati del grafico
export const chartData = {
  datasets: [
    {
      label: "Rilevazioni",
      data: [
        { x: "2021-11-06T23:39:30", y: 50 },
        { x: "2021-11-07T01:00:28", y: 60 },
        { x: "2021-11-07T09:00:28", y: 20 },
        { x: "2021-11-07T12:00:00", y: 80 },
        { x: "2021-11-07T15:00:00", y: 30 },
        { x: "2021-11-07T18:00:00", y: 70 },
        { x: "2021-11-07T21:00:00", y: 40 },
        { x: "2021-11-08T00:00:00", y: 90 },
        { x: "2021-11-08T03:00:00", y: 10 },
        { x: "2021-11-08T06:00:00", y: 60 },
        { x: "2021-11-08T09:00:00", y: 20 },
        { x: "2021-11-08T12:00:00", y: 80 },
        { x: "2021-11-08T15:00:00", y: 30 },
        { x: "2021-11-08T18:00:00", y: 70 },
        { x: "2021-11-08T21:00:00", y: 40 },
        { x: "2021-11-09T00:00:00", y: 90 },
        { x: "2021-11-09T03:00:00", y: 10 },
        { x: "2021-11-09T06:00:00", y: 60 },
        { x: "2021-11-09T09:00:00", y: 20 },
        { x: "2021-11-09T12:00:00", y: 80 },
        { x: "2021-11-09T15:00:00", y: 30 },
        { x: "2021-11-09T18:00:00", y: 70 },
        { x: "2021-11-09T21:00:00", y: 40 },
        { x: "2021-11-10T00:00:00", y: 90 },
        { x: "2021-11-10T03:00:00", y: 10 },
        { x: "2021-11-10T06:00:00", y: 60 },
        { x: "2021-11-10T09:00:00", y: 20 },
        { x: "2021-11-10T12:00:00", y: 80 },
        { x: "2021-11-10T15:00:00", y: 30 },
        { x: "2021-11-10T18:00:00", y: 70 },
        { x: "2021-11-10T21:00:00", y: 40 },
      ],
      fill: true,
      backgroundColor: "rgba(75, 192, 192, 0.5)", // Colore di riempimento
      borderColor: "rgb(75, 192, 192)", // Colore della linea
      tension: 0.4, // Linea smussata
      pointRadius: 0, // Rimuove i cerchietti che indicano un dato
    },
  ],
};

// Configurazione del grafico
export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // Nasconde la legenda
    },
    tooltip: {
      enabled: false, // Disabilita i tooltip
    },
  },
  scales: {
    x: {
      display: false, // Nasconde l'asse x
      type: "time", // Scala temporale
      time: {
        unit: "day", // Mostra le ore come unità principale
        tooltipFormat: "dd/MM/yy HH:mm", // Formato tooltip
      },
      grid: {
        display: false,
      },
    },
    y: {
      display: false, // Nasconde l'asse y
      grid: {
        display: false,
      },
    },
  },
};
