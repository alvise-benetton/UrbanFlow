import { Bars3BottomLeftIcon } from "@heroicons/vue/24/solid";
import { layouts } from "chart.js";
import "chartjs-adapter-date-fns";
// Dati del grafico
export const chartData = {
  datasets: [
    {
      label: "Rilevazioni",
      /* data: [
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
      ], */
      data: getData(),
      fill: true,
      backgroundColor: "rgba(75, 192, 192, 0.5)", // Colore di riempimento
      borderColor: "rgb(75, 192, 192)", // Colore della linea
      tension: 1, // Linea smussata
      pointRadius: 0, // Rimuove i cerchietti che indicano un dato
    },
  ],
};

function getData(){
  function gaussian(deltaDays, sigma = 7, amplitude = 100) {
    return amplitude * Math.exp(- (deltaDays * deltaDays) / (2 * sigma * sigma));
  }
  
  // Data di picco: 20 dicembre 2024 alle 00:00
  const peakDate = new Date('2024-12-20T00:00:00');
  
  // Array dove memorizzare i dati
  const data = [];
  
  // Date di inizio e fine
  const startDate = new Date('2024-12-01T00:00:00');
  const endDate   = new Date('2025-01-07T23:00:00'); // fino all'ultima ora del 7 gennaio
  
  // Funzione per aggiungere un po' di rumore casuale ad un valore
  function addNoise(value, noiseFactor = 10) {
    // Calcola una variazione casuale che va fino al noiseFactor in percentuale del valore
    const noise = (Math.random() * 8 - 5) * noiseFactor * value;
    return value + noise;
  }
  
  // Ciclo per ogni ora dal 1 dicembre 2024 al 7 gennaio 2025
  for (let dt = new Date(startDate); dt <= endDate; dt.setHours(dt.getHours() + 48)) {
    // Differenza in millisecondi tra il tempo corrente e il picco
    const diffMs = dt - peakDate;
    // Convertiamo la differenza in giorni
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    // Calcoliamo il valore gaussiano per il delta in giorni
    let yValue = gaussian(diffDays);
    // Aggiungiamo un po' di rumore per variare leggermente il valore
    yValue = addNoise(yValue, 0.08);
    // Eventuale truncamento dei valori in modo che siano compresi tra 0 e 100
    yValue = Math.max(0, Math.min(100, yValue));
    
    // Aggiungiamo l'oggetto all'array
    data.push({
      x: dt.toISOString(),
      y: yValue
    });
  }
  return data;
}

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
      display: true, // Nasconde l'asse x
      type: "time", // Scala temporale
      time: {
        unit: "day", // Mostra le ore come unità principale
        tooltipFormat: "dd/MM/yy HH:mm", // Formato tooltip
      },
      grid: {
        display: true,
      },
      
    },
    y: {
      display: true, // Nasconde l'asse y
      grid: {
        display: true,
      },
    },
  },
};


