<script setup>
import { ref, inject } from "vue";
import { XMarkIcon } from "@heroicons/vue/20/solid";

const pswModal = ref(null);

const user = inject("user");

</script>
<template>
  <div class="flex flex-col gap-5">
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
        <span class="item-value">{{ user.name }}</span>
      </div>
      <div class="item-box">
        <span class="item-title">Cognome:</span>
        <span class="item-value">{{ user.surname }}</span>
      </div>
    </div>
    <!-- Email -->
    <div class="card-box rounded-md shadow-md bg-white flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Email:</span>
        <span class="item-value">{{ user.email }}</span>
      </div>
    </div>
    <!-- Ruolo -->
    <div class="card-box rounded-md shadow-md bg-white flex flex-row gap-3">
      <div class="item-box">
        <span class="item-title">Ruolo:</span>
        <span class="item-value">{{
          user.role == "admin" ? "Amministratore" : "Base"
        }}</span>
      </div>
    </div>
    <button @click="pswModal.showModal()" class="btn btn-primary w-fit">
      Cambia password
    </button>
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
      <form method="put" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="item-label">Vecchia password</label>
          <input
            class="item-input"
            type="password"
            placeholder="Vecchia password"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="item-label">Nuova password</label>
          <input
            class="item-input"
            type="password"
            placeholder="Nuova password"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="item-label">Ripeti nuova password</label>
          <input
            class="item-input"
            type="password"
            placeholder="Ripeti nuova password"
            required
          />
        </div>
        <div class="flex flex-row gap-2">
          <button type="submit" class="btn btn-primary w-fit">Salva</button>
        </div>
      </form>
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
