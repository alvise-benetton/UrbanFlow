<script setup>
import { ref, provide } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import UsersList from "./UsersList.vue";
const focusedUser = ref({
  _id: null,
  name: "",
  surname: "",
  email: "",
  role: "",
});
const createUser = () => {
  focusedUser.value = {
    _id: null,
    name: "",
    surname: "",
    email: "",
    role: "",
  };
  dialog.value.showModal();
};
const dialog = ref(null);
provide("focusedUser", focusedUser);
provide("dialog", dialog);
</script>
<template>
  <div class="flex flex-col gap-5">
    <div>
      <h2 class="text-lg">Tutti gli utenti</h2>
      <span class="text-black/50"
        >Gestisci tutti gli utenti iscritti alla piattaforma</span
      >
    </div>
    <div class="flex flex-row justify-between">
      <label
        class="flex flex-row gap-2 border-2 border-base-200 rounded-lg p-3 bg-white text-gray-500 items-center"
      >
        <MagnifyingGlassIcon class="size-5"></MagnifyingGlassIcon>
        <input type="text" class="outline-none" placeholder="Cerca utente" />
      </label>
      <button class="btn btn-primary w-fit" @click="createUser()">
        Nuovo utente
      </button>
    </div>
    <UsersList></UsersList>
  </div>
  <dialog id="userDialog" class="modal" ref="dialog">
    <form method="dialog" class="modal-box flex flex-col gap-2">
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
          class="input input-bordered"
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
          class="input input-bordered"
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
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Ruolo</span>
        </label>
        <select
          v-model="focusedUser.role"
          class="select select-bordered"
          required
        >
          <option value="" disabled>Seleziona ruolo</option>
          <option value="base">Base</option>
          <option value="admin">Amministratore</option>
        </select>
      </div>
      <div class="modal-action">
        <button type="submit" class="btn btn-primary">
          {{ focusedUser._id ? "Salva" : "Crea" }}
        </button>
        <button type="button" class="btn" @click="dialog.close()">
          Annulla
        </button>
      </div>
    </form>
  </dialog>
</template>
