import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./components/utility/router";

console.log(import.meta.env);
const app = createApp(App);
app.use(router);
app.mount('#app');