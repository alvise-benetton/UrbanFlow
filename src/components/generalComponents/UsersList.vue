<script setup>
import { ref, inject } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { useRoute } from "vue-router";
const users = [
  {
    _id: "123456789",
    name: "Alessandro",
    surname: "Moretti",
    email: "alessandro.moretti@comune.tn.it",
    role: "admin",
  },
  {
    _id: "987654321",
    name: "Giulia",
    surname: "Rossi",
    email: "giulia.rossi@comune.tn.it",
    role: "base",
  },
  {
    _id: "456789123",
    name: "Marco",
    surname: "Bianchi",
    email: "marco.bianchi@comune.tn.it",
    role: "base",
  },
  {
    _id: "654321987",
    name: "Elena",
    surname: "Verdi",
    email: "elena.verdi@comune.tn.it",
    role: "base",
  },
];
const route = useRoute();
const myID = route.params.id;
const focusedUser = inject("focusedUser");
const editDialog = inject("dialog");
const editUser = (id) => {
  focusedUser.value = users.find((user) => user._id == id);
  editDialog.value.showModal();
};
const deleteUser = (id) => {
  // Call the API to delete the user
  // After deletion, refresh the users list
};
const deleteDialog = ref(null);
</script>
<template>
  <div class="rounded-lg overflow-scroll shadow-md">
    <div
      class="bg-base-100 flex flex-col p-5 relative"
      v-for="user in users"
      :key="user._id"
    >
      <h2 class="text-lg">{{ user.name }} {{ user.surname }}</h2>
      <h3 class="text-sm">{{ user.email }}</h3>
      <div class="flex flex-row gap-1 uppercase">
        <span
          class="badge text-white p-3"
          :class="{
            'bg-blue-500': user.role == 'admin',
            'bg-pink-500': user.role == 'base',
          }"
          >{{ user.role }}</span
        >
        <span class="badge bg-success text-white p-3" v-if="user._id == myID"
          >Sei tu</span
        >
      </div>
      <div
        class="absolute flex flex-row top-1/2 right-5 -translate-y-1/2 gap-2"
      >
        <button
          class="btn btn-xs btn-square btn-primary text-white"
          @click="editUser(user._id)"
        >
          <PencilIcon class="size-4"></PencilIcon>
        </button>
        <button
          class="btn btn-xs btn-square btn-error text-white"
          v-if="user._id != myID"
          @click="deleteDialog.showModal()"
        >
          <TrashIcon class="size-4"></TrashIcon>
        </button>
      </div>
    </div>
  </div>
  <dialog ref="deleteDialog" class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
      <p>Sei sicuro di voler eliminare questo utente?</p>
      <div class="modal-action">
        <button class="btn btn-error">Elimina</button>
        <button class="btn" @click="deleteDialog.close()">Annulla</button>
      </div>
    </form>
  </dialog>
</template>
