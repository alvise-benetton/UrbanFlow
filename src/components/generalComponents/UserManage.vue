<script setup>
import { ref, provide, onBeforeMount, onMounted ,inject, watch} from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import UsersList from "@/components/generalComponents/UsersList.vue";
import { authFetch } from "../utility/router";


const notyf = inject("notyf");

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
    password : "",
    role: "",
  };
  dialog.value.showModal();
};



const dialog = ref(null);
const users = ref([]);
provide("users", users);
//provide("focusedUser", focusedUser);
//provide("dialog", dialog);

watch(focusedUser, (newValue) => {
  console.log("Focused user changed:", newValue);
}, { deep: true });

onBeforeMount(async () => {

  try {
    const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/users`, {
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
    console.log("Utenti caricati:", users.value);
  } catch (error) {
    console.error("authFetch error:", error);
  }
});


const handleEditUser = (id) => {
  console.log("ID utente da modificare:", id);

  const user = users.value.find((user) => user._id === id);
  if (user) {
    focusedUser.value = { ...user }; 
    dialog.value.showModal();
  } else {
    console.error("Utente non trovato con ID:", id);
  } 

};

async function saveUser(){
  console.log("Salvataggio utente", focusedUser.value);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("JWT");

  const body = JSON.stringify(focusedUser.value);

  console.log("Salvataggio utente", body);

  if (focusedUser.value._id) {
    await authFetch(`${API_URL}/api/users/${focusedUser.value._id}`, {
      method: "PUT",
      headers: { 
        "x-access-token": token,
        "Content-Type": "application/json"
      },
      body: body,
    }).then(
      (res) => {
        if (!res.ok) {
          notyf.error("Errore durante il salvataggio dell'utente");
          throw new Error("Errore durante il salvataggio dell'utente");
        }

        notyf.success("Utente modificato con successo!");
        return res.json();
      }
    ).then(() => {
      users.value = users.value.map((user) =>
        user._id === focusedUser.value._id ? focusedUser.value : user
      );
    }
    );
  } else {
    await authFetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: { 
        "x-access-token": token,
        "Content-Type": "application/json"
      },
      body: body,
    }).then(
      (res) => {
        if (!res.ok) {
          notyf.error("Errore durante la creazione dell'utente");
          throw new Error("Errore durante la creazione dell'utente");
        }
        notyf.success("Utente creato con successo!");
        return res.json();
      }
    ).then((data) => {
      users.value.push(data);
      focusedUser.value = data;
    });
  }
  dialog.value.close();
}

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
      <UsersList @editUser="handleEditUser"></UsersList>
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
      <div v-if="!focusedUser._id" class="form-control">
        <label class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          v-model="focusedUser.password"
          type="password"
          placeholder="Password"
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
        <button 
          type="submit" 
          class="btn btn-primary" 
            :disabled="!focusedUser.name || !focusedUser.surname || (!focusedUser._id && !focusedUser.email) || !focusedUser.role"
          @click="saveUser()"
        >
          {{ focusedUser._id ? "Salva" : "Crea" }}
        </button>
        <button type="button" class="btn" @click="dialog.close() ">
          Annulla
        </button>
      </div>
    </form>
  </dialog>
</template>
