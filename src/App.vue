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
    const notyf = new Notyf(); 
    const utente = ref(null);
    provide('notyf',notyf);// servizio per i toast


    return { utente };
  }


  
};

</script>