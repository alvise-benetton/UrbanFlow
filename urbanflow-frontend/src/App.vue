<template>
  <div id="app">
    <router-view></router-view> <!-- Qui verranno caricate le pagine -->
  </div>
</template>

<script>
import { onMounted, onUnmounted, provide, ref } from "vue";
import router, { isTokenValid } from "./components/utility/router";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export default {
  setup() {
    // Dichiarazioni REATTIVE nello scope dello setup

    const notyf = new Notyf(); 
    const utente = ref(null);

    provide('notyf',notyf);// servizio per i toast

/*     // Funzioni API DENTRO lo setup
    const loadZones = async () => {
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

    const loadCameraData = async () => {
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

    const loadEvents = async() => {
      try {
          const response = await fetch('http://localhost:3000/api/events', {
          method: 'GET',
          headers: { 'x-access-token': localStorage.getItem('JWT') },
        });

        const data = await response.json();
        listaEventi.value = data;
        console.log(listaEventi.value);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    const loadAll = ()=>{
      if(isInit.value) // controllo di non aver già caricato
        return;
      loadEvents();
      loadZones();
      loadCameraData();
      isInit.value = true;
    }

    // Provide delle variabili e funzioni di aggiornamento
    provide("listaZone", listaZone);
    provide("listaMisurazioni", listaMisurazioni);
    provide("listaEventi", listaEventi);
    provide("loadAll", loadAll); */

    // Lifecycle hooks
   /*  onMounted(() => {
      if(isTokenValid(localStorage.getItem("JWT"))) {
        const intervalId = setInterval(loadCameraData, 5000);
        onUnmounted(() => clearInterval(intervalId));
      }
    }); */

    
  


  
    


    return { utente };
  }


  
};

</script>