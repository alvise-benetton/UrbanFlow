<script setup>
import { inject } from "vue";
import { useRouter } from "vue-router";
import {
  UserIcon,
  UsersIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/20/solid";

const router = useRouter();
const user = inject("user");
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-base-200 overflow-hidden select-none">
    <!-- Top Bar -->
    <header class="h-14 bg-base-100 border-b border-base-300 px-6 flex items-center justify-between z-10 shrink-0 shadow-sm">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/Mappa')"
          class="btn btn-sm btn-ghost gap-1.5 text-xs text-base-content hover:bg-base-200"
        >
          <ArrowLeftIcon class="size-4" />
          <span>Torna alla Mappa</span>
        </button>
        <div class="h-5 w-px bg-base-300"></div>
        <div class="flex items-center gap-2">
          <ShieldCheckIcon class="size-5 text-primary" />
          <h1 class="font-bold text-sm text-base-content">Area Riservata Operatori</h1>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="text-gray-500">Connesso come:</span>
        <strong class="text-base-content">{{ user?.name }} {{ user?.surname }}</strong>
        <span
          class="badge badge-xs uppercase font-bold text-[10px]"
          :class="user?.role === 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
        >
          {{ user?.role === 'admin' ? 'Amministratore' : 'Operatore' }}
        </span>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar Navigazione Impostazioni -->
      <aside class="w-64 bg-base-100 border-r border-base-300 p-4 flex flex-col gap-2 shrink-0">
        <span class="text-[11px] uppercase font-bold text-gray-400 px-3 py-1 tracking-wider">
          Navigazione
        </span>
        <ul class="menu p-0 gap-1 text-xs">
          <li>
            <router-link
              to="/AreaRiservata/info"
              class="flex items-center gap-2.5 py-2.5 rounded-lg font-medium"
              active-class="bg-primary text-white font-bold"
            >
              <UserIcon class="size-4" />
              <span>Il mio profilo</span>
            </router-link>
          </li>
          <li v-if="user?.role === 'admin'">
            <router-link
              to="/AreaRiservata/manage"
              class="flex items-center gap-2.5 py-2.5 rounded-lg font-medium"
              active-class="bg-primary text-white font-bold"
            >
              <UsersIcon class="size-4" />
              <span>Gestione Utenti</span>
            </router-link>
          </li>
        </ul>
      </aside>

      <!-- Vista Interna -->
      <main class="flex-1 overflow-y-auto p-8 bg-base-200">
        <div class="max-w-4xl mx-auto">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
