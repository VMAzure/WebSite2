import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
import "./style.css"

function isGenericHost(hostname) {
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".up.railway.app")
    )
}

function getSlugFromPath(pathname) {
    const seg = pathname.split("/").filter(Boolean)[0]
    return seg || null
}

/**
 * STEP 1:
 * - Railway/localhost => slug dal path: /:slug/...
 * - Custom domain     => slug dal BE: GET /api/tenant/resolve (host-based)
 *
 * Per ora salviamo il risultato in window.__TENANT_SLUG__
 * (Step 2 lo mettiamo nel tenant store)
 */
async function resolveTenantSlug() {
    const { hostname, pathname } = window.location

    if (isGenericHost(hostname)) {
        const slug = getSlugFromPath(pathname)

        // ✅ SU RAILWAY PREVIEW USIAMO SOLO LO SLUG DA PATH
        if (!slug || slug.includes(".") || slug.includes("website2")) {
            return null
        }

        return slug
    }


    const res = await fetch("/api/tenant/resolve")
    if (!res.ok) {
        throw new Error("GET /api/tenant/resolve failed")
    }

    const data = await res.json()
    if (!data || !data.slug) {
        throw new Error("Tenant resolve returned no slug")
    }

    return data.slug
}

async function bootstrap() {
    window.__TENANT_SLUG__ = await resolveTenantSlug()

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount("#app")
}

bootstrap().catch((err) => {
    console.error("Bootstrap error:", err)
})
