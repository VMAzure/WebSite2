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
            // ✅ TEAM: la rotta reale NON ha /api davanti
            "/api/users/team-pubblico": {
                target: "https://api.azcore.it",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ""), // /api/users/... -> /users/...
            },

            "/api/nbt": {
                target: "https://api.azcore.it",
                changeOrigin: true,
                secure: false,
            },

            // ✅ tutto il resto continua come prima
            "/api": {
                target: "https://coreapi-production-ca29.up.railway.app",
                changeOrigin: true,
                secure: false,
            },
        },
    },

    // ✅ AGGIUNTA: split CSS + vendor chunk
    build: {
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["vue", "vue-router", "pinia"],
                },
            },
        },
    },

    cacheDir: ".vite-cache",
})