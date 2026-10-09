<script setup>
import { ref, inject } from "vue";
import { XMarkIcon, KeyIcon } from "@heroicons/vue/20/solid";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const pswModal = ref(null);
const user = inject("user");
const notyf = inject("notyf");

const newPwd = ref("");
const confirmPwd = ref("");
const isUpdating = ref(false);

async function cambiaPass() {
  if (newPwd.value !== confirmPwd.value) {
    if (notyf) notyf.error("Le nuove password non corrispondono.");
    return;
  }
  if (!user?.value?._id) {
    if (notyf) notyf.error("Utente non autenticato o dati non ancora disponibili.");
    return;
  }
  
  try {
    isUpdating.value = true;
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
      throw new Error(`Errore HTTP ${response.status}`);
    }

    if (notyf) notyf.success("Password modificata con successo!");
    newPwd.value = "";
    confirmPwd.value = "";
    pswModal.value?.close();
  } catch (error) {
    if (notyf) notyf.error("Errore durante il cambio password: " + error.message);
  } finally {
    isUpdating.value = false;
  }
}
</script>

<template>
  <div v-if="user" class="flex flex-col gap-6">
    <div>
      <h2 class="text-xl font-bold text-base-content">Profilo Operatore</h2>
      <p class="text-xs text-gray-500 mt-0.5">Dati di accesso e credenziali della sessione corrente</p>
    </div>

    <!-- Scheda Informazioni Profilo -->
    <div class="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1 p-3 rounded-xl bg-base-200/50 border border-base-300/60">
          <span class="text-[11px] font-bold uppercase text-gray-400">Nome e Cognome</span>
          <span class="text-base font-semibold text-base-content">{{ user.name }} {{ user.surname }}</span>
        </div>

        <div class="flex flex-col gap-1 p-3 rounded-xl bg-base-200/50 border border-base-300/60">
          <span class="text-[11px] font-bold uppercase text-gray-400">Indirizzo Email</span>
          <span class="text-base font-mono font-medium text-base-content">{{ user.email }}</span>
        </div>

        <div class="flex flex-col gap-1 p-3 rounded-xl bg-base-200/50 border border-base-300/60">
          <span class="text-[11px] font-bold uppercase text-gray-400">Ruolo Assegnato</span>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              class="badge badge-sm uppercase font-bold text-xs"
              :class="user.role === 'admin' ? 'badge-primary text-white' : 'badge-neutral'"
            >
              {{ user.role === 'admin' ? 'Amministratore di Sistema' : 'Operatore Territoriale' }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1 p-3 rounded-xl bg-base-200/50 border border-base-300/60">
          <span class="text-[11px] font-bold uppercase text-gray-400">ID Identificativo DB</span>
          <span class="text-xs font-mono text-gray-500 truncate">{{ user._id }}</span>
        </div>
      </div>

      <div class="pt-2 border-t border-base-200 flex justify-end">
        <button @click="pswModal?.showModal()" class="btn btn-sm btn-outline btn-primary gap-2">
          <KeyIcon class="size-4" />
          <span>Cambia password</span>
        </button>
      </div>
    </div>

    <!-- Modal Cambio Password -->
    <dialog class="modal" ref="pswModal">
      <div class="modal-box p-6 max-w-md">
        <div class="flex items-center justify-between pb-3 border-b border-base-200">
          <h3 class="font-bold text-base text-base-content">Aggiorna Password</h3>
          <button class="btn btn-sm btn-ghost btn-circle" @click="pswModal?.close()">
            <XMarkIcon class="size-4" />
          </button>
        </div>

        <form @submit.prevent="cambiaPass" class="flex flex-col gap-4 mt-4">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Nuova password</span>
            </label>
            <input
              v-model="newPwd"
              type="password"
              placeholder="••••••••"
              required
              class="input input-sm input-bordered focus:input-primary"
            />
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Conferma nuova password</span>
            </label>
            <input
              v-model="confirmPwd"
              type="password"
              placeholder="••••••••"
              required
              class="input input-sm input-bordered focus:input-primary"
            />
          </div>

          <div class="modal-action mt-2">
            <button type="button" class="btn btn-sm btn-ghost" @click="pswModal?.close()">
              Annulla
            </button>
            <button
              type="submit"
              class="btn btn-sm btn-primary text-white font-bold"
              :disabled="isUpdating || !newPwd || newPwd !== confirmPwd"
            >
              {{ isUpdating ? 'Aggiornamento...' : 'Salva password' }}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>

  <div v-else class="flex justify-center p-16">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>

<style scoped>
</style>
