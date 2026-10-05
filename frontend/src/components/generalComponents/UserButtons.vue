<script setup>
import { UserIcon } from "@heroicons/vue/24/solid";
import router, { authFetch } from "../utility/router";
import { inject } from "vue";

const API_URL = import.meta.env.VITE_API_URL;

async function logout(){

  //router.go('/login');

  await authFetch(`${API_URL}/api/session`,{
    method:"DELETE",
    headers:{"x-access-token":localStorage.getItem("JWT")}
  }).then((resp)=>{
    if(!resp.ok){
      throw new Error("Errore durante il logut");
    }
    router.push('/login');
    localStorage.removeItem("JWT");
  });

}

</script>
<template>
  <div class="flex gap-5">
    <details class="dropdown">
      <summary class="btn m-1">
        <UserIcon class="size-4"></UserIcon>
        Il mio account
      </summary>
      <ul class="menu dropdown-content gap-2">
        <li><button class="btn btn-error text-white w-fit shadow-md" @click="logout">Logout</button></li>
        <li><router-link to="/AreaRiservata/info" class="btn w-fit shadow-md">Area riservata</router-link></li>
      </ul>
    </details>
  </div>
</template>
