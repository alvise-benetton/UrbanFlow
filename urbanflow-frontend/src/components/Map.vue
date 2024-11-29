

<template>
    <div id="map"></div>
</template>
  
<script setup>
  import { onMounted } from 'vue'
  
  onMounted(() => { // eseguito quando il component è correttamente caricato
    var map = L.map('map', {
      center: [46.0701026717189, 11.122361662558886],
      zoom: 16,
      zoomControl: false // Disabilita il controllo zoom predefinito
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        minZoom:15,
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        
      }).addTo(map);
  
    L.control.zoom({
      position: 'bottomright', // Posizione dei controlli zoom 
    }).addTo(map);

});

  
</script>

<style scoped>

#map{ 
    width: 100vw; 
    height: 100vh ; 
    display: block; 
    z-index: 0; 
    position: absolute; 
    top:0; 
    left:0;
}

</style>