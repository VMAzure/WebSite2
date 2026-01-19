import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    preview: {
        port: 8080,
        strictPort: true
    },

    cacheDir: ".vite-cache" // ✅ fuori da node_modules, evita EPERM su Windows
})
