<script setup>
import { UserIcon } from "@heroicons/vue/24/solid";
</script>
<template>
  <div class="flex gap-5">
    <details class="dropdown">
      <summary class="btn m-1">
        <UserIcon class="size-4"></UserIcon>
        Il mio account
      </summary>
      <ul class="menu dropdown-content gap-2">
        <li><a class="btn btn-error text-white w-fit shadow-md">Logout</a></li>
        <li><a class="btn w-fit shadow-md">Area riservata</a></li>
      </ul>
    </details>
  </div>
</template>
