import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "./style.css"
import "leaflet/dist/leaflet.css"
import '@fortawesome/fontawesome-free/css/all.min.css'

createApp(App)
    .use(createPinia())
    .use(router)
    .mount("#app")
