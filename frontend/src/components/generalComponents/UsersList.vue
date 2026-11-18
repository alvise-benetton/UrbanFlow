<script setup>
import { ref, inject, computed } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const props = defineProps({
  searchTerm: {
    type: String,
    default: "",
  },
});

const users = inject("users", ref([]));
const me = inject("user");
const notyf = inject("notyf");

const myID = computed(() => me?.value?._id || null);

const emit = defineEmits(["editUser"]);
const focusedUser = ref(null);

const filteredUsers = computed(() => {
  if (!users?.value || !Array.isArray(users.value)) return [];
  if (!props.searchTerm || props.searchTerm.trim() === "") return users.value;

  const term = props.searchTerm.toLowerCase().trim();
  return users.value.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.surname && u.surname.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
  );
});

const editUser = (id) => {
  emit("editUser", id);
};

async function deleteUser() {
  if (!focusedUser.value?._id) return;
  const id = focusedUser.value._id;
  try {
    const response = await authFetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "x-access-token": localStorage.getItem("JWT"),
      },
    });
    if (response.ok) {
      const index = users.value.findIndex((user) => user._id === id);
      if (index !== -1) {
        users.value.splice(index, 1);
      }
      notyf?.success("Utente eliminato con successo!");
      deleteDialog.value?.close();
    } else {
      notyf?.error("Errore durante l'eliminazione dell'utente");
    }
  } catch (error) {
    notyf?.error("Errore durante l'eliminazione dell'utente");
  }
}

const deleteDialog = ref(null);
</script>

<template>
  <div class="rounded-box overflow-hidden shadow-sm bg-base-100 border border-base-300">
    <div v-if="filteredUsers.length > 0" class="divide-y divide-base-300">
      <div
        class="bg-base-100 flex flex-row items-center justify-between gap-3 p-4 sm:p-5 hover:bg-base-200/50 transition-colors"
        v-for="user in filteredUsers"
        :key="user._id"
      >
        <div class="flex flex-col min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base sm:text-lg font-semibold truncate">
              {{ user.name }} {{ user.surname }}
            </h2>
            <span
              class="badge h-auto py-1 px-2.5 badge-success text-white text-xs font-medium shrink-0"
              v-if="user._id === myID"
            >
              Sei tu
            </span>
          </div>
          <h3 class="text-xs sm:text-sm text-base-content/60 [overflow-wrap:anywhere]">
            {{ user.email }}
          </h3>
          <div class="flex flex-row gap-1 mt-2">
            <span
              class="badge h-auto py-1 px-2.5 text-xs font-medium"
              :class="user.role === 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
            >
              {{ user.role === "admin" ? "Amministratore" : "Operatore base" }}
            </span>
          </div>
        </div>

        <div class="flex flex-row gap-2 shrink-0">
          <button
            type="button"
            class="btn btn-sm btn-square btn-primary text-white touch-manipulation"
            @click="editUser(user._id)"
            title="Modifica utente"
            aria-label="Modifica utente"
          >
            <PencilIcon class="size-4" />
          </button>
          <button
            v-if="user._id !== myID"
            type="button"
            class="btn btn-sm btn-square btn-error text-white touch-manipulation"
            @click="deleteDialog?.showModal(); focusedUser = user"
            title="Elimina utente"
            aria-label="Elimina utente"
          >
            <TrashIcon class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center p-12 text-base-content/50 gap-2">
      <svg class="size-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span class="text-sm">Nessun utente trovato</span>
    </div>
  </div>

  <!-- Dialog Eliminazione -->
  <dialog ref="deleteDialog" class="modal">
    <form method="dialog" class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-4 text-error">Conferma eliminazione</h3>
      <p>
        Sei sicuro di voler eliminare l'utente
        <strong v-if="focusedUser">{{ focusedUser.name }} {{ focusedUser.surname }}</strong>?
        Questa azione è irreversibile.
      </p>
      <div class="modal-action">
        <button type="button" class="btn btn-error text-white" @click="deleteUser()">
          Elimina
        </button>
        <button type="button" class="btn" @click="deleteDialog?.close()">Annulla</button>
      </div>
    </form>
  </dialog>
</template>
