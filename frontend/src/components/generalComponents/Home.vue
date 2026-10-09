<script setup>
import { computed, inject, ref, provide, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

// Componenti
import Map from "./Map.vue";
import AppHeader from "./AppHeader.vue";
import SidePanel from "./SidePanel.vue";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const user = inject("user");
const loadUser = inject("loadUser");

const searchTerm = ref("");

const zonesData = ref([]);
const measureData = ref([]);
const eventsData = ref([]);
const isInit = ref(false);

const loadZones = async () => {
  try {
    const response = await authFetch(`${API_URL}/api/zones`, {
      method: "GET",
      headers: { "x-access-token": localStorage.getItem("JWT") },
    });
    const data = await response.json();
    zonesData.value = data;
  } catch (error) {
    console.error("authFetch error:", error);
  }
};

const loadCameraData = async () => {
  try {
    const response = await authFetch(`${API_URL}/api/cameraData`, {
      method: "GET",
      headers: { "x-access-token": localStorage.getItem("JWT") },
    });
    const data = await response.json();
    measureData.value = data;
  } catch (error) {
    console.error("authFetch error:", error);
  }
};

const loadEvents = async () => {
  try {
    const response = await authFetch(`${API_URL}/api/events`, {
      method: "GET",
      headers: { "x-access-token": localStorage.getItem("JWT") },
    });
    const data = await response.json();
    eventsData.value = data;
  } catch (error) {
    console.error("authFetch error:", error);
  }
};

const loadAll = () => {
  if (isInit.value) return;
  loadEvents();
  loadZones();
  loadCameraData();
  user.value = loadUser();
  isInit.value = true;
};

// Provide delle variabili reattive
provide("listaZone", zonesData);
provide("listaMisurazioni", measureData);
provide("listaEventi", eventsData);
provide("loadAll", loadAll);

onMounted(() => {
  loadAll();
  const intervalId = setInterval(() => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    loadCameraData();
  }, 5000);
  onUnmounted(() => clearInterval(intervalId));
});

const router = useRouter();
const route = useRoute();

const appSection = computed({
  get() {
    const query = route.query;
    if (query.page) {
      if (query.id) {
        router.push(`/${query.page}/${query.id}`);
      } else {
        router.push(`/${query.page}`);
      }
    }
    const path = route.path.slice(1);
    const pathParts = path.split("/");
    return pathParts[0] || "Mappa";
  },
  set(section) {
    const [newSection, id] = section.split("/");
    if (id) {
      router.push(`/${newSection}/${id}`.replace(/\/\//g, "/"));
    } else {
      router.push(`/${newSection}`.replace(/\/\//g, "/"));
    }
  },
});

const currentId = computed({
  get() {
    const pathParts = route.path.slice(1).split("/");
    return pathParts[1] || null;
  },
  set(val) {
    if (val) {
      router.push(`/${appSection.value}/${val}`);
    } else {
      router.push(`/${appSection.value}`);
    }
  }
});

const isPanelOpen = computed(() => {
  return appSection.value !== "Mappa" || !!currentId.value;
});
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-base-300">
    <!-- Navbar Superiore Unificata -->
    <AppHeader
      v-model:section="appSection"
      v-model:searchTerm="searchTerm"
    />

    <!-- Contenitore Mappa + SidePanel Dockato -->
    <main class="flex-1 relative flex overflow-hidden">
      <!-- Area Mappa GIS MapLibre -->
      <div class="flex-1 h-full relative">
        <Map />
      </div>

      <!-- Sidebar Dockata con transizione fluida -->
      <Transition name="slide-panel">
        <SidePanel
          v-if="isPanelOpen"
          :section="appSection"
          v-model:searchTerm="searchTerm"
          v-model:id="currentId"
        />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>