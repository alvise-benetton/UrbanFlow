<template>
  <div id="total">
    <Navbar></Navbar>
    <Map></Map>
  </div>
</template>

<script setup>

import { onMounted } from 'vue'
import Map from './components/Map.vue' 

  onMounted(() => { // eseguito quando il component è correttamente caricato
    
    var map = L.map('map').setView([46.0701026717189, 11.122361662558886], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          zoom: 17,
          zoomControl: false, // Disabilita i controlli di default
      }).addTo(map);
      
    L.control.zoom({
      position: 'bottomright', // Posizione dei controlli zoom 
      //zoomControl : false
    }).addTo(map);
      
  })

</script>

<script>
import Navbar from './components/NavBar.vue'; // Importa il componente Navbar

export default {
  components: {
    Navbar,
  },
};

</script>

<style scoped>
    
  #total{
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
  }
</style>


