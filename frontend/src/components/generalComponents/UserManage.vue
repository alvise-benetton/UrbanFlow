<script setup>
import { ref, provide, onBeforeMount, inject, computed } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import UsersList from "@/components/generalComponents/UsersList.vue";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const notyf = inject("notyf");
const me = inject("user");
const myID = computed(() => me?.value?._id || null);

const focusedUser = ref({
  _id: null,
  name: "",
  surname: "",
  email: "",
  password: "",
  role: "",
});

const createUser = () => {
  focusedUser.value = {
    _id: null,
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "",
  };
  dialog.value?.showModal();
};

const dialog = ref(null);
const users = ref([]);
provide("users", users);

onBeforeMount(async () => {
  try {
    const res = await authFetch(`${API_URL}/api/users`, {
      method: "GET",
      headers: {
        "x-access-token": localStorage.getItem("JWT"),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    users.value = data;
  } catch (error) {
    console.error("authFetch error:", error);
  }
});

const handleEditUser = (id) => {
  const user = users.value.find((u) => u._id === id);
  if (user) {
    focusedUser.value = { ...user };
    dialog.value?.showModal();
  }
};

async function saveUser() {
  const token = localStorage.getItem("JWT");
  const body = JSON.stringify(focusedUser.value);

  try {
    if (focusedUser.value._id) {
      const res = await authFetch(`${API_URL}/api/users/${focusedUser.value._id}`, {
        method: "PUT",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body,
      });
      if (!res.ok) {
        throw new Error("Errore durante il salvataggio dell'utente");
      }
      await res.json();
      notyf?.success("Utente modificato con successo!");
      users.value = users.value.map((user) =>
        user._id === focusedUser.value._id ? { ...focusedUser.value } : user
      );
    } else {
      const res = await authFetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body,
      });
      if (!res.ok) {
        throw new Error("Errore durante la creazione dell'utente");
      }
      const data = await res.json();
      notyf?.success("Utente creato con successo!");
      users.value.push(data);
      focusedUser.value = data;
    }
    dialog.value?.close();
  } catch (err) {
    notyf?.error(err.message);
  }
}

const searchUserTerm = ref("");
</script>

<template>
  <div class="flex flex-col gap-5 max-w-4xl">
    <div>
      <h2 class="text-lg font-semibold">Tutti gli utenti</h2>
      <span class="text-sm text-base-content/60">
        Gestisci tutti gli utenti iscritti alla piattaforma
      </span>
    </div>

    <div class="flex flex-col sm:flex-row justify-between gap-3">
      <label
        class="flex flex-row gap-2 border-2 border-base-300 rounded-lg px-3 py-2.5 bg-base-100 text-base-content/60 items-center w-full sm:min-w-72 sm:max-w-sm"
      >
        <MagnifyingGlassIcon class="size-5 shrink-0" />
        <input
          v-model="searchUserTerm"
          type="text"
          class="outline-none grow min-w-0 text-base md:text-sm bg-transparent text-base-content"
          placeholder="Cerca utente per nome o email..."
        />
      </label>
      <button
        type="button"
        class="btn btn-primary text-white w-full sm:w-fit touch-manipulation"
        @click="createUser()"
      >
        Nuovo utente
      </button>
    </div>

    <UsersList :searchTerm="searchUserTerm" @editUser="handleEditUser" />
  </div>

  <dialog id="userDialog" class="modal" ref="dialog">
    <form @submit.prevent="saveUser()" class="modal-box flex flex-col gap-2 max-w-md">
      <h3 class="font-bold text-lg">
        {{ focusedUser._id ? "Modifica utente" : "Nuovo utente" }}
      </h3>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Nome</span>
        </label>
        <input
          v-model="focusedUser.name"
          type="text"
          placeholder="Nome"
          class="input input-bordered text-base md:text-sm"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Cognome</span>
        </label>
        <input
          v-model="focusedUser.surname"
          type="text"
          placeholder="Cognome"
          class="input input-bordered text-base md:text-sm"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          v-model="focusedUser.email"
          type="email"
          placeholder="Email"
          class="input input-bordered text-base md:text-sm"
          required
        />
      </div>
      <div v-if="!focusedUser._id" class="form-control">
        <label class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          v-model="focusedUser.password"
          type="password"
          placeholder="Password"
          class="input input-bordered text-base md:text-sm"
          required
        />
      </div>
      <div class="form-control" v-if="focusedUser._id !== myID">
        <label class="label">
          <span class="label-text">Ruolo</span>
        </label>
        <select
          v-model="focusedUser.role"
          class="select select-bordered text-base md:text-sm"
          required
        >
          <option value="" disabled>Seleziona ruolo</option>
          <option value="base">Base</option>
          <option value="admin">Amministratore</option>
        </select>
      </div>
      <div class="modal-action">
        <button
          type="submit"
          class="btn btn-primary text-white"
          :disabled="!focusedUser.name || !focusedUser.surname || (!focusedUser._id && !focusedUser.email) || !focusedUser.role"
        >
          {{ focusedUser._id ? "Salva" : "Crea" }}
        </button>
        <button type="button" class="btn" @click="dialog?.close()">
          Annulla
        </button>
      </div>
    </form>
  </dialog>
</template>
