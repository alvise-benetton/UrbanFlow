<script setup>
import { inject } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = inject("user");
</script>

<template>
  <div class="fixed inset-0 w-full h-full flex flex-col md:flex-row gap-0">
    <div
      class="w-full md:w-1/4 md:h-full bg-base-300 p-3 sm:p-4 md:pt-20 md:p-10 flex flex-row md:flex-col items-center md:items-stretch justify-between gap-2 shrink-0"
    >
      <ul class="menu menu-horizontal md:menu-vertical flex gap-1 sm:gap-2 p-0">
        <li>
          <RouterLink class="min-h-10 touch-manipulation" to="info">Il mio profilo</RouterLink>
        </li>
        <li v-if="user?.role === 'admin'">
          <RouterLink class="min-h-10 touch-manipulation" to="manage">Gestisci utenti</RouterLink>
        </li>
      </ul>
      <button
        type="button"
        class="btn btn-primary btn-sm md:btn-md text-white md:mt-auto w-fit touch-manipulation shrink-0"
        @click="router.push('/')"
      >
        Torna alla mappa
      </button>
    </div>
    <div class="w-full md:w-3/4 flex-1 bg-base-200 p-5 sm:p-10 md:p-20 overflow-y-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply active;
}
</style>
