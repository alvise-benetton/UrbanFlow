<template>
    <div class="navbar">
        <div class="navbar-start z-10">

            <IconUser></IconUser>

        </div>
        <div class="navbar-center z-10" >
            <ul class="menu menu-vertical lg:menu-horizontal rounded-box m-3" id="navbar" >
            <li
                v-for="(item, index) in menuItems" 
                :key="index"  
                :class="{'selected text-2xl': selectedIndex === index, 'text-xl': selectedIndex !== index}"
                @click="selectedIndex = index">
                <a>{{ item }}</a>
            </li>
            </ul>
        </div>
        <div class="navbar-end z-10 flex flex">
            <label class="input input-bordered flex items-center gap-2 z-10 bg-gray-500">
                <input type="text" class="grow" placeholder="Search" />
                <div class="cursor-pointer p-2 rounded-md hover:bg-gray-300">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-4 w-4 opacity-70">
                        <path
                        fill-rule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                </div> 
            </label>
            <!-- <div class="flex items-center z-10 menu menu-horizontal rounded-box">

                <a class="mr-3">Eventi</a>
                <a class="">Zone</a>
            </div> -->
            <!-- <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto z-10"/>
            <button class="btn z-10">vai</button> -->
        </div>
    </div>
   
  </template>
  
  <script setup>
  import { ref } from 'vue';
import IconUser from './icons/IconUser.vue';
  
  // Voci del menu
  const menuItems = ["Item 1", "Item 2", "Item 3"];
  
  // indice selezionato
  const selectedIndex = ref(1); // il secondo elemento predefinito
  </script>

<style lang="css" >

    .selected{
        background-color: rgb(255, 255, 255);
        color: rgb(0, 0, 0);
        border-radius: 1cap;   
        transform: 1s;  
        font-weight: bold; 
    }

    #navbar{
        background-color: rgba(93, 93, 93, 0.5);
        font-size: large;
        color:white
        
    }
    /* CSS per tasti zoom  -> da rivedere  */
    .leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar {
        border: 2px solid rgba(0, 0, 0, 0.2);
        background-clip: padding-box;
        border-radius: 10cap;
    }
    .leaflet-control-zoom-in, .leaflet-control-zoom-out {
        font: bold 18px 'Lucida Console', Monaco, monospace;
        text-indent: 1px;
        border-radius: 10cap;
        rotate: 180deg;
    }
    

</style>