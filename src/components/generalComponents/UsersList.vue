<script setup>
import { ref, inject, onBeforeMount } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { useRoute } from "vue-router"
import { authFetch } from "../utility/router";

const users = inject("users");
const me = inject("user"); 
const notyf = inject("notyf");

const route = useRoute();
const myID = me.value._id;

const emit = defineEmits(['editUser']);


const focusedUser = ref(null);

const emitEditEvent = (id) => {
  emit('editUser', id);
};


const editUser = (id) => {
  emitEditEvent(id);
};


async function deleteUser() {
  const id = focusedUser.value._id;
  try {
    const response = await authFetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
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
    } else {
      notyf.error("Errore durante l'eliminazione dell'utente");
      console.error("Errore nell'eliminazione utente "+ id, response.statusText);
    }
  } catch (error) {
    notyf.error("Errore durante l'eliminazione dell'utente");
    console.error("Errore nell'eliminazione utente "+ id, error);
  }
}

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
        <span class="badge bg-success text-white p-3" v-if="user._id == myID">Sei tu</span>
      </div>
     
      <div
        class="absolute flex flex-row top-1/2 right-5 -translate-y-1/2 gap-2">
        
        <div>
          <button class="btn btn-xs btn-square btn-primary text-white" @click="editUser(user._id)">
            <PencilIcon class="size-4"></PencilIcon>
          </button>
          <button v-if="user._id !== myID"
            class="btn btn-xs btn-square btn-error text-white ml-2"
            @click="deleteDialog.showModal(); focusedUser = user">
            <TrashIcon class="size-4"></TrashIcon>
          </button>
        </div>
      </div>
    </div>
  </div>
  <dialog ref="deleteDialog" class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
      <p>Sei sicuro di voler eliminare questo utente?</p>
      <div class="modal-action">
        <button class="btn btn-error" @click="deleteUser()">Elimina</button>
        <button class="btn" @click="deleteDialog.close()">Annulla</button>
      </div>
    </form>
  </dialog>
</template>
