<script setup>
import { useRoute } from "vue-router";
import { ref, provide } from "vue";
const path = useRoute();
// Oggetto user
const user = ref({
  _id: "123456789",
  name: "Alessandro",
  surname: "Moretti",
  email: "alessandro.moretti@comune.tn.it",
  role: "admin",
});
provide("user", user);
</script>
<template>
  <div class="fixed w-full h-full flex flex-row gap-0">
    <div class="w-1/4 h-full bg-base-300 pt-20 p-10">
      <ul class="menu flex flex-col gap-2">
        <li class="menu-item">
          <RouterLink class="menu-item" to="info">Il mio profilo</RouterLink>
        </li>
        <li>
          <RouterLink v-if="user.role == 'admin'" class="menu-item" to="manage"
            >Gestisci utenti</RouterLink
          >
        </li>
      </ul>
    </div>
    <div class="w-3/4 h-full bg-base-200 p-20 overflow-scroll">
      <RouterView></RouterView>
    </div>
  </div>
</template>
<style scoped>
.router-link-active {
  @apply active;
}
</style>
