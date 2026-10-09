<script setup>
import { computed, inject, ref } from "vue";
import { useRouter } from "vue-router";
import {
  MapPinIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const router = useRouter();

const section = defineModel("section", { default: "Mappa" });
const searchTerm = defineModel("searchTerm", { default: "" });

const theme = inject("theme", ref("light"));
const setTheme = inject("setTheme", () => {});

function toggleTheme() {
  const nextTheme = theme.value === "dark" ? "light" : "dark";
  setTheme(nextTheme);
}

const user = inject("user");
const listaZone = inject("listaZone", ref([]));
const listaMisurazioni = inject("listaMisurazioni", ref([]));
const listaEventi = inject("listaEventi", ref([]));

const activeAlertsCount = computed(() => {
  if (!listaZone?.value || !listaMisurazioni?.value) return 0;
  return listaZone.value.filter((zone) => {
    const m = listaMisurazioni.value.find((item) => item.zone === zone._id);
    const density = m?.data?.[0]?.density ?? 0;
    return zone.threshold && density > zone.threshold;
  }).length;
});

const currentEventsCount = computed(() => {
  if (!listaEventi?.value) return 0;
  const now = new Date();
  return listaEventi.value.filter((ev) => {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    return s <= now && e >= now;
  }).length;
});

const userName = computed(() => {
  if (user?.value?.name) {
    return `${user.value.name} ${user.value.surname || ""}`.trim();
  }
  return "Operatore";
});

const userRole = computed(() => {
  return user?.value?.role === "admin" ? "Admin" : "Operatore";
});

const setSection = (newSection) => {
  section.value = newSection;
  router.push(`/${newSection}`);
};

async function logout() {
  const token = localStorage.getItem("JWT");
  try {
    if (token) {
      await authFetch(`${API_URL}/api/session`, {
        method: "DELETE",
        headers: { "x-access-token": token },
      });
    }
  } catch (err) {
    console.warn("Logout error:", err.message);
  } finally {
    localStorage.removeItem("JWT");
    if (user?.value) user.value = null;
    router.push("/login");
  }
}
</script>

<template>
  <header class="h-14 bg-base-100 border-b border-base-300 px-4 flex items-center justify-between gap-4 z-40 select-none shrink-0 shadow-sm">
    <!-- Branding Sinistra -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="flex items-center gap-2 cursor-pointer" @click="setSection('Mappa')">
        <div class="w-8 h-8 rounded-lg bg-primary text-primary-content font-black text-sm flex items-center justify-center shadow-sm">
          UF
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-sm tracking-tight leading-none text-base-content">UrbanFlow</span>
          <span class="text-[10px] text-gray-500 font-medium tracking-wide">Trento GIS Control</span>
        </div>
      </div>
    </div>

    <!-- Centro: Navigazione & Ricerca -->
    <div class="flex items-center gap-2 md:gap-4 flex-1 justify-center max-w-2xl">
      <!-- Segmented Buttons per Sezioni -->
      <div class="join bg-base-200 p-0.5 rounded-lg border border-base-300">
        <button
          class="join-item btn btn-xs md:btn-sm gap-1.5 font-medium transition-all"
          :class="section === 'Mappa' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="setSection('Mappa')"
        >
          <MapPinIcon class="size-3.5" />
          <span class="hidden sm:inline">Mappa</span>
        </button>

        <button
          class="join-item btn btn-xs md:btn-sm gap-1.5 font-medium transition-all"
          :class="section === 'Zone' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="setSection('Zone')"
        >
          <ShieldExclamationIcon class="size-3.5" />
          <span>Zone</span>
          <span
            v-if="activeAlertsCount > 0"
            class="badge badge-error badge-xs text-white font-bold animate-pulse"
          >
            {{ activeAlertsCount }}
          </span>
        </button>

        <button
          class="join-item btn btn-xs md:btn-sm gap-1.5 font-medium transition-all"
          :class="section === 'Eventi' ? 'btn-primary text-white shadow-sm' : 'btn-ghost text-base-content hover:bg-base-300'"
          @click="setSection('Eventi')"
        >
          <CalendarDaysIcon class="size-3.5" />
          <span>Eventi</span>
          <span
            v-if="currentEventsCount > 0"
            class="badge badge-info badge-xs text-white font-bold"
          >
            {{ currentEventsCount }}
          </span>
        </button>
      </div>

      <!-- Barra di ricerca rapida -->
      <div class="relative w-40 md:w-56 hidden sm:block">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Cerca zona o evento..."
          class="input input-xs md:input-sm input-bordered w-full pl-8 pr-7 bg-base-200 focus:bg-base-100 text-xs"
        />
        <MagnifyingGlassIcon class="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <button
          v-if="searchTerm"
          @click="searchTerm = ''"
          class="size-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-base-content"
        >
          <XMarkIcon class="size-3.5" />
        </button>
      </div>
    </div>

    <!-- Destra: KPI riassuntivi & Profilo Utente -->
    <div class="flex items-center gap-3 shrink-0">
      <!-- Mini contatori KPI -->
      <div class="hidden xl:flex items-center gap-3 text-xs text-gray-500 font-mono">
        <div class="flex items-center gap-1">
          <span class="font-bold text-base-content">{{ listaZone?.length || 0 }}</span> zone
        </div>
        <span class="text-base-300">•</span>
        <div class="flex items-center gap-1">
          <span :class="activeAlertsCount > 0 ? 'text-error font-bold' : 'text-success font-bold'">
            {{ activeAlertsCount }}
          </span> allerte
        </div>
        <span class="text-base-300">•</span>
        <div class="flex items-center gap-1">
          <span class="font-bold text-base-content">{{ listaEventi?.length || 0 }}</span> eventi
        </div>
      </div>

      <!-- Toggle Tema Giorno / Notte -->
      <button
        @click="toggleTheme"
        class="btn btn-sm btn-ghost btn-circle hover:bg-base-200 border border-base-300"
        :title="theme === 'light' ? 'Passa a modalità scura (Notte)' : 'Passa a modalità chiara (Giorno)'"
      >
        <MoonIcon v-if="theme === 'light'" class="size-4 text-base-content" />
        <SunIcon v-else class="size-4 text-warning" />
      </button>

      <!-- Dropdown Utente -->
      <details class="dropdown dropdown-end">
        <summary class="btn btn-sm btn-ghost gap-2 px-2 hover:bg-base-200 border border-base-300 rounded-lg">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">
              {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
            </div>
          </div>
          <span class="text-xs font-semibold hidden md:inline">{{ userName }}</span>
          <span
            v-if="user?.role"
            class="badge badge-xs uppercase font-semibold text-[10px]"
            :class="user.role === 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
          >
            {{ userRole }}
          </span>
        </summary>
        <ul class="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-300 mt-2 z-50 text-xs">
          <li class="menu-title text-gray-500">Account Operativo</li>
          <li>
            <router-link to="/AreaRiservata/info" class="flex items-center gap-2 py-2">
              <UserIcon class="size-4 text-primary" />
              <span>Profilo & Impostazioni</span>
            </router-link>
          </li>
          <li v-if="user?.role === 'admin'">
            <router-link to="/AreaRiservata/manage" class="flex items-center gap-2 py-2">
              <ShieldExclamationIcon class="size-4 text-primary" />
              <span>Gestione Utenti</span>
            </router-link>
          </li>
          <li class="border-t border-base-200 mt-1 pt-1">
            <button class="text-error hover:bg-error/10 flex items-center gap-2 py-2" @click="logout">
              <ArrowRightOnRectangleIcon class="size-4" />
              <span>Disconnetti</span>
            </button>
          </li>
        </ul>
      </details>
    </div>
  </header>
</template>

<style scoped>
</style>
