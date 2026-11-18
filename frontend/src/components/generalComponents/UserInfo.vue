<script setup>
import { ref, inject } from "vue";
import { XMarkIcon } from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const pswModal = ref(null);

const user = inject("user");
const notyf = inject("notyf");

const newPwd = ref("");
const confirmPwd = ref("");
const saving = ref(false);

async function cambiaPass() {
  if (!newPwd.value) {
    notyf?.error("Inserisci una nuova password.");
    return;
  }
  if (newPwd.value !== confirmPwd.value) {
    notyf?.error("Le nuove password non corrispondono.");
    return;
  }
  if (!user?.value?._id) {
    notyf?.error("Utente non autenticato o dati non ancora disponibili.");
    return;
  }

  try {
    saving.value = true;
    const response = await authFetch(`${API_URL}/api/users/${user.value._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("JWT"),
      },
      body: JSON.stringify({
        password: newPwd.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    notyf?.success("Password cambiata con successo!");
    newPwd.value = "";
    confirmPwd.value = "";
    pswModal.value?.close();
  } catch (error) {
    notyf?.error("Errore durante il cambio password: " + error.message);
    console.error("Errore durante il cambio password:", error);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div v-if="user" class="flex flex-col gap-5 max-w-2xl">
    <div>
      <h2 class="text-lg font-semibold">Il tuo utente</h2>
      <span class="text-sm text-base-content/60">
        Visualizza le informazioni associate al tuo account
      </span>
    </div>

    <!-- Nome e cognome -->
    <div class="card-box rounded-md shadow-md bg-base-100 flex flex-col sm:flex-row gap-2 sm:gap-6">
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
    <div class="card-box rounded-md shadow-md bg-base-100 flex flex-row gap-3">
      <div class="item-box min-w-0 w-full">
        <span class="item-title">Email:</span>
        <span class="item-value [overflow-wrap:anywhere]">{{ user?.email }}</span>
      </div>
    </div>

    <!-- Ruolo -->
    <div class="card-box rounded-md shadow-md bg-base-100 flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Ruolo:</span>
        <span class="item-value">
          {{ user?.role == "admin" ? "Amministratore" : "Base" }}
        </span>
      </div>
    </div>

    <button
      type="button"
      @click="pswModal?.showModal()"
      class="btn btn-primary text-white w-fit touch-manipulation"
    >
      Cambia password
    </button>
  </div>

  <div v-else class="flex justify-center p-10">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Modal -->
  <dialog class="modal" ref="pswModal">
    <div class="modal-box flex flex-col gap-5 p-5 max-w-md">
      <form class="w-full flex flex-row justify-end" method="dialog">
        <button class="btn btn-circle btn-sm" aria-label="Chiudi finestra">
          <XMarkIcon class="size-5" />
        </button>
      </form>
      <h2 class="text-lg font-bold">Cambia password</h2>
      <form @submit.prevent="cambiaPass()" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="item-label">Nuova password</label>
          <input
            v-model="newPwd"
            class="item-input text-base md:text-sm"
            type="password"
            placeholder="Nuova password"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="item-label">Ripeti nuova password</label>
          <input
            v-model="confirmPwd"
            class="item-input text-base md:text-sm"
            type="password"
            placeholder="Ripeti nuova password"
            required
          />
        </div>
        <div class="flex flex-row gap-2">
          <button type="submit" class="btn btn-primary text-white w-fit" :disabled="saving">
            {{ saving ? "Salvataggio..." : "Salva" }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<style scoped>
.item-box {
  @apply flex flex-col gap-1.5 p-4 sm:p-5 w-fit;
}
.item-title {
  @apply text-sm text-base-content/60;
}
.item-value {
  @apply font-normal text-lg sm:text-xl;
}
.item-input {
  @apply outline-none border-2 border-base-300 bg-base-100 rounded-md p-2.5;
}
.item-label {
  @apply text-sm text-base-content/60;
}
</style>
