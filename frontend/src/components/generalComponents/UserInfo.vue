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

    <div class="bg-base-100 rounded-box border border-base-300 shadow-sm divide-y divide-base-300 overflow-hidden">
      <!-- Avatar header -->
      <div class="flex items-center gap-4 p-4 sm:p-5 bg-base-100">
        <div class="avatar placeholder">
          <div class="bg-primary text-primary-content rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
            {{ user?.name ? user.name.charAt(0).toUpperCase() : "U" }}{{ user?.surname ? user.surname.charAt(0).toUpperCase() : "" }}
          </div>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-semibold text-base sm:text-lg truncate">
            {{ user?.name }} {{ user?.surname }}
          </span>
          <span
            class="badge badge-sm font-medium w-fit mt-1"
            :class="user?.role == 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
          >
            {{ user?.role == "admin" ? "Amministratore" : "Operatore base" }}
          </span>
        </div>
      </div>

      <!-- Lista definizione compatta -->
      <dl class="divide-y divide-base-300 text-sm">
        <div class="flex flex-col sm:flex-row sm:justify-between gap-1 px-4 sm:px-5 py-3.5">
          <dt class="text-base-content/60">Nome</dt>
          <dd class="font-medium sm:text-right">{{ user?.name }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:justify-between gap-1 px-4 sm:px-5 py-3.5">
          <dt class="text-base-content/60">Cognome</dt>
          <dd class="font-medium sm:text-right">{{ user?.surname }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:justify-between gap-1 px-4 sm:px-5 py-3.5">
          <dt class="text-base-content/60">Email</dt>
          <dd class="font-medium sm:text-right [overflow-wrap:anywhere]">{{ user?.email }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:justify-between gap-1 px-4 sm:px-5 py-3.5">
          <dt class="text-base-content/60">Ruolo</dt>
          <dd class="font-medium sm:text-right">
            {{ user?.role == "admin" ? "Amministratore" : "Operatore base" }}
          </dd>
        </div>
      </dl>
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
.item-input {
  @apply outline-none border-2 border-base-300 bg-base-100 rounded-md p-2.5;
}
.item-label {
  @apply text-sm text-base-content/60;
}
</style>
