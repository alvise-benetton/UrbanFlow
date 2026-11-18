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
      <nav class="inline-flex md:flex md:flex-col items-center md:items-stretch gap-1 p-1 md:p-0 bg-base-200/70 md:bg-transparent rounded-xl">
        <RouterLink
          class="h-10 px-3.5 rounded-lg inline-flex items-center justify-center md:justify-start text-sm font-medium text-base-content/75 hover:text-base-content transition-colors touch-manipulation"
          to="info"
        >
          Il mio profilo
        </RouterLink>
        <RouterLink
          v-if="user?.role === 'admin'"
          class="h-10 px-3.5 rounded-lg inline-flex items-center justify-center md:justify-start text-sm font-medium text-base-content/75 hover:text-base-content transition-colors touch-manipulation"
          to="manage"
        >
          Gestisci utenti
        </RouterLink>
      </nav>
      <button
        type="button"
        class="btn btn-primary h-10 min-h-10 px-4 text-white md:mt-auto w-fit touch-manipulation shrink-0"
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
  @apply bg-neutral text-neutral-content shadow-sm;
}
</style>
