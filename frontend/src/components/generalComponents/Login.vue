<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="bg-base-100 border border-base-300 shadow-xl rounded-2xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl mb-3 shadow">
          UF
        </div>
        <h2 class="text-2xl font-bold text-base-content tracking-tight">UrbanFlow Trento</h2>
        <p class="text-sm text-gray-500 mt-1">Monitoraggio flussi pedonali centro storico</p>
      </div>

      <form @submit.prevent="login">
        <div class="space-y-4">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-medium text-xs text-gray-600">Email operatore</span>
            </label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="nome@comune.trento.it" 
              required
              class="input input-bordered w-full focus:input-primary"
            />
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-medium text-xs text-gray-600">Password</span>
            </label>
            <div class="relative">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                required
                class="input input-bordered w-full pr-10 focus:input-primary"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {{ showPassword ? 'Nascondi' : 'Mostra' }}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full shadow text-white"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Autenticazione in corso...' : 'Accedi' }}</span>
          </button>
        </div>
      </form>

      <!-- Accesso rapido account demo -->
      <div class="mt-6 pt-5 border-t border-base-200 flex flex-col gap-2.5">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
          Accesso Rapido Demo
        </span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline btn-primary flex justify-between items-center text-xs"
            :disabled="loading"
            @click="quickLogin('mario.rossi@example.com', 'password_mario')"
          >
            <span>Admin</span>
            <span class="badge badge-primary badge-xs text-white">mario.rossi</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline btn-neutral flex justify-between items-center text-xs"
            :disabled="loading"
            @click="quickLogin('luca.bianchi@example.com', 'password_luca')"
          >
            <span>Operatore</span>
            <span class="badge badge-neutral badge-xs">luca.bianchi</span>
          </button>
        </div>
      </div>

      <!-- Errore notifica -->
      <div 
        v-if="showError"
        class="alert alert-error mt-4 shadow-sm py-2 px-3 text-xs text-white flex justify-between"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
        <button 
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authFetch } from '../utility/router';
import { API_BASE_URL as API_URL } from '@/services/apiConfig';

const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const login = async () => {
  try {
    loading.value = true;
    showError.value = false;

    const response = await authFetch(`${API_URL}/api/session`, {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error('Credenziali non valide');
    }

    const data = await response.json();
    localStorage.setItem('JWT', data.JWT);
    await router.push('/');
  } catch (error) {
    showError.value = true;
    errorMessage.value = error.message;
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const quickLogin = (demoEmail, demoPassword) => {
  email.value = demoEmail;
  password.value = demoPassword;
  login();
};
</script>