import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "./style.css";
import "leaflet/dist/leaflet.css";

// ❌ TOGLI import globale che porta CSS+woff2 nel critical path
// import "@fortawesome/fontawesome-free/css/all.min.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

// ✅ carica FontAwesome “dopo” il primo render
const loadFA = () => import("@fortawesome/fontawesome-free/css/all.min.css");
if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => loadFA());
} else {
    setTimeout(() => loadFA(), 1200);
}