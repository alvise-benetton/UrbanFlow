<template>
  <div class="min-h-dvh flex items-center justify-center bg-base-200 p-4 text-base-content">
    <div class="bg-base-100 uf-panel-shadow border border-base-300 rounded-box p-6 sm:p-8 w-full max-w-sm">
      <div class="flex flex-col items-center text-center mb-6">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-9 h-9 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-base">
            UF
          </div>
          <span class="text-xl font-bold tracking-tight">UrbanFlow</span>
        </div>
        <p class="text-xs text-base-content/60 mb-3">Monitoraggio flussi pedonali · Trento</p>
        <h2 class="text-lg font-semibold">Accedi al pannello</h2>
      </div>

      <form @submit.prevent="login">
        <div class="space-y-3.5">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="input input-bordered w-full text-base md:text-sm bg-base-100"
          />
          <div class="relative flex items-center">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              required
              class="input input-bordered w-full pr-10 text-base md:text-sm bg-base-100"
            />
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-circle absolute right-2 text-base-content/60"
              :aria-label="showPassword ? 'Nascondi password' : 'Mostra password'"
              @click="showPassword = !showPassword"
            >
              <EyeSlashIcon v-if="showPassword" class="size-4" />
              <EyeIcon v-else class="size-4" />
            </button>
          </div>

          <button
            type="submit"
            class="btn btn-primary text-white w-full min-h-11 touch-manipulation"
            :disabled="loading"
          >
            {{ loading ? "Accesso in corso..." : "Accedi" }}
          </button>
        </div>
      </form>

      <div class="text-xs text-center text-base-content/70 mt-6 pt-4 border-t border-base-300 space-y-1.5">
        <p class="font-semibold text-base-content">Account demo (clicca per compilare)</p>
        <button
          type="button"
          class="w-full bg-base-200 hover:bg-base-300 rounded-lg px-2.5 py-2 transition cursor-pointer touch-manipulation flex items-center justify-between gap-2"
          @click="fillDemo('mario.rossi@example.com', 'password_mario')"
        >
          <span class="truncate font-medium">mario.rossi@example.com</span>
          <span class="badge badge-primary badge-xs text-white shrink-0">Admin</span>
        </button>
        <button
          type="button"
          class="w-full bg-base-200 hover:bg-base-300 rounded-lg px-2.5 py-2 transition cursor-pointer touch-manipulation flex items-center justify-between gap-2"
          @click="fillDemo('luca.bianchi@example.com', 'password_luca')"
        >
          <span class="truncate font-medium">luca.bianchi@example.com</span>
          <span class="badge badge-neutral badge-xs shrink-0">Operatore</span>
        </button>
      </div>

      <!-- Toast error con condizione di visualizzazione -->
      <div
        v-if="showError"
        id="toast-error"
        class="alert alert-error text-white text-sm mt-4 py-2.5 px-3"
        role="alert"
      >
        <span class="flex-1">{{ errorMessage }}</span>
        <button
          type="button"
          aria-label="Chiudi errore"
          @click="showError = false"
          class="btn btn-ghost btn-xs btn-circle text-white"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/20/solid";
import { authFetch } from "../utility/router";
import { API_BASE_URL as API_URL } from "@/services/apiConfig";

const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const showError = ref(false);
const errorMessage = ref("");

function fillDemo(demoEmail, demoPassword) {
  email.value = demoEmail;
  password.value = demoPassword;
  showError.value = false;
}

const login = async () => {
  try {
    loading.value = true;
    showError.value = false;

    const response = await authFetch(`${API_URL}/api/session`, {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Credenziali non valide");
    }

    const data = await response.json();
    localStorage.setItem("JWT", data.JWT);

    await router.push("/");
  } catch (error) {
    showError.value = true;
    errorMessage.value = error.message;
    console.error("Login error:", error);
  } finally {
    loading.value = false;
  }
};
</script>
