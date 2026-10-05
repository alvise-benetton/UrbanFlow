<script setup>
import { ref, inject, computed } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";

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
  return users.value.filter((u) =>
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
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
      notyf.success("Utente eliminato con successo!");
      deleteDialog.value.close();
    } else {
      notyf.error("Errore durante l'eliminazione dell'utente");
    }
  } catch (error) {
    notyf.error("Errore durante l'eliminazione dell'utente");
  }
}

const deleteDialog = ref(null);
</script>

<template>
  <div class="rounded-lg overflow-hidden shadow-md bg-base-100 border border-base-200">
    <div v-if="filteredUsers.length > 0" class="divide-y divide-base-200">
      <div
        class="bg-base-100 flex flex-col p-5 relative hover:bg-base-200/50 transition-colors"
        v-for="user in filteredUsers"
        :key="user._id"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold">{{ user.name }} {{ user.surname }}</h2>
          <span class="badge badge-success badge-sm text-white font-medium" v-if="user._id === myID">Sei tu</span>
        </div>
        <h3 class="text-sm text-gray-500 font-mono">{{ user.email }}</h3>
        <div class="flex flex-row gap-1 uppercase mt-2">
          <span
            class="badge text-white p-2.5 text-xs font-semibold"
            :class="{
              'bg-blue-600': user.role === 'admin',
              'bg-purple-600': user.role === 'base' || user.role === 'user',
            }"
          >
            {{ user.role === 'admin' ? 'Amministratore' : 'Operatore Base' }}
          </span>
        </div>

        <div class="absolute flex flex-row top-1/2 right-5 -translate-y-1/2 gap-2">
          <button
            class="btn btn-sm btn-square btn-primary text-white"
            @click="editUser(user._id)"
            title="Modifica utente"
          >
            <PencilIcon class="size-4" />
          </button>
          <button
            v-if="user._id !== myID"
            class="btn btn-sm btn-square btn-error text-white"
            @click="deleteDialog.showModal(); focusedUser = user"
            title="Elimina utente"
          >
            <TrashIcon class="size-4" />
          </button>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
      <svg class="size-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span class="text-sm">Nessun utente trovato</span>
    </div>
  </div>

  <!-- Dialog Eliminazione -->
  <dialog ref="deleteDialog" class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-4 text-error">Conferma eliminazione</h3>
      <p>
        Sei sicuro di voler eliminare l'utente
        <strong v-if="focusedUser">{{ focusedUser.name }} {{ focusedUser.surname }}</strong>?
        Questa azione è irreversibile.
      </p>
      <div class="modal-action">
        <button type="button" class="btn btn-error text-white" @click="deleteUser()">Elimina</button>
        <button type="button" class="btn" @click="deleteDialog.close()">Annulla</button>
      </div>
    </form>
  </dialog>
</template>
