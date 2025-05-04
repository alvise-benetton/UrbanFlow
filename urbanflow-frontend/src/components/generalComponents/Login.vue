<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg rounded-lg p-8 w-96">
      <h2 class="text-2xl font-bold text-center text-gray-800">Accedi</h2>
      <p class="text-center text-gray-500 mb-6">Inserisci le tue credenziali</p>
      <form>
        <div class="space-y-4">
        
            <input 
              v-model="email" 
              type="text" 
              placeholder="Email" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              v-model="password" 
              type="password" 
              placeholder="Password" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button 
              @click="login" 
              class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              :disabled="loading"
            >
              {{ loading ? 'Caricamento...' : 'Accedi' }}
            </button>
        </div>
    </form>

      <p class="text-sm text-center text-gray-500 mt-4">
        login test: email:test@test.it, pwd:test
      </p>
      
      <!-- Toast error con condizione di visualizzazione -->
      <div 
        v-if="showError"
        id="toast-error" 
        class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm mt-4"
      >
        <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
        </div>
        <div class="ms-3 text-sm font-normal">{{ errorMessage }}</div>
        <button 
          @click="showError = false" 
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        >
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

// Stati reattivi
const email = ref('');
const password = ref('');
const loading = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const loadAll = inject('loadAll');

const login = async () => {
  try {
    loading.value = true;
    showError.value = false;

    const response = await fetch("http://localhost:3000/api/session", {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error('Credenziali non valide');
    }
    const data = await response.json();
    localStorage.setItem('JWT', data.JWT);
    console.log(data.JWT);
    //loadAll();
    await router.push('/');

  }catch (error) {
    showError.value = true;
    errorMessage.value = error.message;
    console.error('Login error:', error);
  }finally {
    loading.value = false;
  }
};

</script>