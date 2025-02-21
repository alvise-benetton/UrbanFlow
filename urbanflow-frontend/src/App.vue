<template>
  <div id="app">
    <router-view></router-view> <!-- Qui verranno caricate le pagine -->
  </div>
</template>

<script>
import { onMounted, onUnmounted, provide, ref } from "vue";
import router, { isTokenValid } from "./components/utility/router";

export default {
  setup() {
    // Dichiarazioni REATTIVE nello scope dello setup
    const listaZone = ref([]);
    const listaMisurazioni = ref([]);
    const listaEventi = ref([]);
    const utente = ref(null);

    // Funzioni API DENTRO lo setup
    const updateZones = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/zones', {
          method: 'GET',
          headers: { 'x-access-token': localStorage.getItem('JWT') },
        });

        const data = await response.json();
        listaZone.value = data; // Usa .value correttamente
        console.log('Zone aggiornate:', listaZone.value);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    const updateCameraData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cameraData', {
          method: 'GET',
          headers: { 'x-access-token': localStorage.getItem('JWT') },
        });

        const data = await response.json();
        listaMisurazioni.value = data;
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    // Provide delle variabili
    provide("listaZone", listaZone);
    provide("listaMisurazioni", listaMisurazioni);
    provide("listaEventi", listaEventi);

    // Lifecycle hooks
    onMounted(() => {
      if(isTokenValid(localStorage.getItem("JWT"))) {
        updateCameraData();
        updateZones();
        const intervalId = setInterval(updateCameraData, 5000);
        onUnmounted(() => clearInterval(intervalId));
      }
    });

    return { utente };
  }
};
</script>