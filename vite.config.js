import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },

    preview: {
        port: 8080,
        strictPort: true,
    },

    server: {
        host: true,
        port: 5173,
        strictPort: true,

        // ✅ aggiungi questo
        allowedHosts: ["europacarauto.local"],

        proxy: {
            "/api": {
                target: "https://coreapi-production-ca29.up.railway.app",
                changeOrigin: true,
                secure: false,
            },
        },
    },

    cacheDir: ".vite-cache",
})
