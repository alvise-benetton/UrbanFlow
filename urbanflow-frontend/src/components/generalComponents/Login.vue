<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 class="text-2xl font-bold text-center text-gray-800">Accedi</h2>
        <p class="text-center text-gray-500 mb-6">Inserisci le tue credenziali</p>
  
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
          >
            Accedi
          </button>
        </div>
  
        <p class="text-sm text-center text-gray-500 mt-4">
          Non hai un account? <a href="#" class="text-blue-500 hover:underline">Registrati</a>
          <br>
          login test: email:test@test.it, pwd:test
        </p>
        
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      login() {

        const response = fetch("http://localhost:3000/api/session",{
            method:"POST",
            body: JSON.stringify({"email":this.email, "password":this.password}),
            headers: { "Content-Type": "application/json" }
        }).then((resp) => {
        if (!resp.ok) {
            // Se la risposta non è ok (status 200-299), gestisci l'errore
            throw new Error('Errore durante il login');
        }
        return resp.json();
        })
        .then((data) => {
            console.log(data);
            localStorage.setItem('JWT', data.JWT);
            this.$router.push('/');
        })
        .catch((error) => {
            alert(error.message); // Mostra il messaggio di errore
            console.error(error); // Log dell'errore per il debug
        });

       /*  if (this.username === 'admin' && this.password === 'password') {
          
        } else {
          alert('Credenziali errate!');
        } */
      }
    }
  };
  </script>
  