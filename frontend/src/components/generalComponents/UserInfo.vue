<script setup>
import { ref, inject } from "vue";
import { XMarkIcon } from "@heroicons/vue/20/solid";

const pswModal = ref(null);

const user = inject("user");
console.log("User info:", user);

const notyf = inject("notyf");

const newPwd = ref("");
const confirmPwd = ref("");

async function cambiaPass() {
  if (newPwd.value !== confirmPwd.value) {
    notyf.error("Le nuove password non corrispondono.");
    return;
  }
  if (!user?.value?._id) {
    notyf.error("Utente non autenticato o dati non ancora disponibili.");
    return;
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await fetch(`${API_URL}/api/users/${user.value._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("JWT"),
      },
      body: JSON.stringify({
        password: newPwd.value
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Password cambiata con successo:", data);
    notyf.success("Password cambiata con successo!");
    pswModal.value.close();
  } catch (error) {
    notyf.error("Errore durante il cambio password: " + error.message);
    console.error("Errore durante il cambio password:", error);
  }
}

</script>
<template>
  <div v-if="user" class="flex flex-col gap-5">
    <div>
      <h2 class="text-lg">Il tuo utente</h2>
      <span class="text-black/50"
        >Visualizza le informazioni associate al tuo account</span
      >
    </div>
    <!-- Nome e cognome -->
    <div class="card-box rounded-md shadow-md bg-white flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Nome:</span>
        <span class="item-value">{{ user?.name }}</span>
      </div>
      <div class="item-box">
        <span class="item-title">Cognome:</span>
        <span class="item-value">{{ user?.surname }}</span>
      </div>
    </div>
    <!-- Email -->
    <div class="card-box rounded-md shadow-md bg-white flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Email:</span>
        <span class="item-value">{{ user?.email }}</span>
      </div>
    </div>
    <!-- Ruolo -->
    <div class="card-box rounded-md shadow-md bg-white flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Ruolo:</span>
        <span class="item-value">{{
          user?.role == "admin" ? "Amministratore" : "Base"
        }}</span>
      </div>
    </div>
    <button @click="pswModal.showModal()" class="btn btn-primary w-fit">
      Cambia password
    </button>
  </div>
  <div v-else class="flex justify-center p-10">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <!-- Modal -->
  <dialog class="modal" ref="pswModal">
    <div class="modal-box flex flex-col gap-5 p-5">
      <form class="w-full flex flex-row justify-end" method="dialog">
        <button class="btn btn-circle btn-sm">
          <XMarkIcon class="size-5" />
        </button>
      </form>
      <h2 class="text-lg font-bold">Cambia password</h2>
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="item-label">Nuova password</label>
          <input
            v-model="newPwd"
            class="item-input"
            type="password"
            placeholder="Nuova password"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="item-label">Ripeti nuova password</label>
          <input
            v-model="confirmPwd"
            class="item-input"
            type="password"
            placeholder="Ripeti nuova password"
            required
          />
        </div>
        <div class="flex flex-row gap-2">
          <button type="submit" class="btn btn-primary w-fit"  @click="cambiaPass()" >Salva</button>
        </div>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.item-box {
  @apply flex flex-col gap-2 p-5 w-fit;
}
.item-title {
  @apply text-sm text-black/50;
}
.item-value {
  @apply font-normal text-xl;
}
.item-input {
  @apply outline-none border-2 border-base-200 rounded-md p-2;
}
.item-label {
  @apply text-sm text-black/50;
}
</style>
