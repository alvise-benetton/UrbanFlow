import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./components/utility/router";

const app = createApp(App);
app.use(router);
app.mount('#app');
