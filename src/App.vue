<template>
  <div id="app">
    <router-view></router-view> <!-- Qui verranno caricate le pagine -->
  </div>
</template>

<script>
import { ref, provide } from "vue";
import { Notyf } from "notyf";
import { jwtDecode } from 'jwt-decode';
import "notyf/notyf.min.css";
import { authFetch } from "./components/utility/router";

export default {
  setup() {
    const notyf = new Notyf(); 
    const user = ref(null);

    loadUser()

    provide('notyf',notyf);// servizio per i toast
    provide('user',user);// servizio per l'utente
    provide('loadUser',loadUser);
    return { user };
    

    async function loadUser(){
      const token = localStorage.getItem('JWT');
      if (!token) {
        console.error("Utente non caricato, Token non trovato");
        return;
      }

      const data = jwtDecode(token);
      if (!data) {
        console.error("Utente non caricato, Token non valido");
        return;
      }

      let ris = {};
      const API_URL = import.meta.env.VITE_API_URL;
      await authFetch(`${API_URL}/api/users/${data.id}`, {
        method: "GET",
        headers: { "x-access-token": token }
      }).then((resp) => {
        if (!resp.ok) {
          throw new Error('Errore durante il recupero dell\'utente');
        }
        return resp;
      }).then((resp) => resp.json()).then((data) => {
        user.value = data;
      });
  }

  }
  


  
};

</script>