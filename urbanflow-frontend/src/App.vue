<template>
  <div id="app">
    <router-view></router-view> <!-- Qui verranno caricate le pagine -->
  </div>
</template>

<script>
import {useCameraDataStore} from "@/stores/cameraDataStore"

export default {

  setup(){

    const cs = useCameraDataStore();
    cs.updateCameraData();

    const sec = 1000;

    //setInterval(cs.updateCameraData, 10 * sec);

    

  }

}

</script>