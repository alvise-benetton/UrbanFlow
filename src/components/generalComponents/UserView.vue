<script setup>
import { useRoute } from "vue-router";
import { ref, provide, inject } from "vue";
import { jwtDecode } from "jwt-decode";
const path = useRoute();

const user = inject("user");

// Oggetto user
</script>
<template>
  <div class="fixed w-full h-full flex flex-row gap-0">
    <div class="w-1/4 h-full bg-base-300 pt-20 p-10">
      <ul class="menu flex flex-col gap-2">
        <li class="menu-item">
          <RouterLink class="menu-item" to="info">Il mio profilo</RouterLink>
        </li>
        <li>
          <RouterLink v-if="user.role === 'admin'" class="menu-item" to="manage">Gestisci utenti</RouterLink>
        </li>
      </ul>
    </div>
    <div class="w-3/4 h-full bg-base-200 p-20 overflow-scroll">
      <RouterView></RouterView>
    </div>
    <div class="absolute bottom-5 left-5">
      <button 
        class="btn btn-primary" 
        @click="$router.push('/')">
        Torna alla mappa
      </button>
    </div>
  </div>
</template>
<style scoped>
.router-link-active {
  @apply active;
}
</style>
