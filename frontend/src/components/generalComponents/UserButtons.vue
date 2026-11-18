<script setup>
import { UserIcon } from "@heroicons/vue/24/solid";
import router, { authFetch } from "../utility/router";
import { inject, computed, ref, onMounted, onUnmounted } from "vue";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const user = inject("user");
const dropdownRef = ref(null);

const userName = computed(() => {
  if (user?.value?.name) {
    return `${user.value.name} ${user.value.surname || ""}`.trim();
  }
  return "Il mio account";
});

const userRole = computed(() => {
  return user?.value?.role === "admin" ? "Admin" : "Operatore";
});

function handleOutsideClick(event) {
  if (dropdownRef.value?.open && !dropdownRef.value.contains(event.target)) {
    dropdownRef.value.open = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

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
    console.warn("Logout session endpoint error:", err.message);
  } finally {
    if (dropdownRef.value) {
      dropdownRef.value.open = false;
    }
    localStorage.removeItem("JWT");
    if (user?.value) {
      user.value = null;
    }
    router.push("/login");
  }
}
</script>

<template>
  <div class="flex gap-5">
    <details ref="dropdownRef" class="dropdown dropdown-end">
      <summary
        class="btn h-11 min-h-11 bg-base-100/90 backdrop-blur-xl uf-panel-shadow flex items-center gap-2 px-2 md:px-3.5 rounded-full md:rounded-box border border-base-300/80 cursor-pointer hover:bg-base-200 transition-colors touch-manipulation"
        aria-label="Menu account"
      >
        <div class="avatar placeholder">
          <div class="bg-primary text-primary-content rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
            {{ user?.name ? user.name.charAt(0).toUpperCase() : "U" }}
          </div>
        </div>
        <span class="hidden md:inline font-medium text-sm">{{ userName }}</span>
        <span
          v-if="user?.role"
          class="hidden md:inline-flex badge h-auto py-1 px-2.5 font-medium text-xs"
          :class="user.role === 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
        >
          {{ userRole }}
        </span>
      </summary>
      <ul class="menu dropdown-content bg-base-100 rounded-box shadow-xl p-2 gap-1 mt-2 border border-base-200 z-50 min-w-48">
        <li class="md:hidden px-3 py-1.5 text-xs text-base-content/70 border-b border-base-200 mb-1 pointer-events-none">
          <span class="font-semibold text-base-content block">{{ userName }}</span>
          <span v-if="user?.role">{{ userRole }}</span>
        </li>
        <li>
          <router-link
            to="/AreaRiservata/info"
            class="flex items-center gap-2 text-sm font-medium min-h-10"
            @click="dropdownRef && (dropdownRef.open = false)"
          >
            <UserIcon class="size-4 text-primary" />
            Area riservata
          </router-link>
        </li>
        <li class="border-t border-base-200 mt-1 pt-1">
          <button type="button" class="text-error hover:bg-error/10 text-sm font-medium min-h-10" @click="logout">
            Esci dall'account
          </button>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
</style>
