import { defineStore } from "pinia"

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        slug: null,
        source: null, // "path" (per ora)

        settings: null,
        loading: false,
        error: null,
    }),

    actions: {
        setTenant(slug, source = "path") {
            this.slug = slug
            this.source = source
        },

        setSlug(slug) {
            this.setTenant(slug, "path")
        },

        async resolveTenantByHost() {

            // 🔒 Se lo slug è già settato (es: da /:slug), non risolvere da dominio
            if (this.slug) {
                return String(this.slug)
            }

            this.loading = true
            this.error = null

            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL
                if (!API_BASE) {
                    throw new Error("Missing VITE_API_BASE_URL (Railway Variables).")
                }

                const host = window.location.host

                const res = await fetch(
                    `${API_BASE}/api/tenant/resolve?host=${encodeURIComponent(host)}`
                )

                if (!res.ok) {
                    // 404 = dominio non mappato (non è un errore per l’utente)
                    if (res.status === 404) return null
                    throw new Error(`Tenant resolve failed: HTTP ${res.status}`)
                }


                const contentType = res.headers.get("content-type") || ""
                if (!contentType.includes("application/json")) {
                    const text = await res.text()
                    throw new Error(
                        `Resolve response is not JSON (status ${res.status}). Got: ${contentType}. First chars: ${text.slice(0, 40)}`
                    )
                }

                const data = await res.json()

                // 👉 QUI: se il tuo backend usa un nome campo diverso, cambiamo questa riga
                const slug = data?.slug

                if (!slug) throw new Error("Tenant resolve returned no slug")

                this.setTenant(String(slug), "domain")
                return String(slug)

            } catch (e) {
                // 🔒 Non toccare slug/source: potrebbero essere già corretti (es: /scuderia76)
                this.error = e?.message || String(e)
                return null
            } finally {

                this.loading = false
            }
        },


        async loadPublicSettings(slug) {
            this.loading = true
            this.error = null

            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL

                if (!API_BASE) {
                    throw new Error("Missing VITE_API_BASE_URL (Railway Variables).")
                }

                const res = await fetch(
                    `${API_BASE}/api/site-settings-public/${encodeURIComponent(slug)}`
                )


                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const contentType = res.headers.get("content-type") || ""
                if (!contentType.includes("application/json")) {
                    const text = await res.text()
                    throw new Error(
                        `Response is not JSON (status ${res.status}). Got: ${contentType}. First chars: ${text.slice(0, 40)}`
                    )
                }

                this.settings = await res.json()

            } catch (e) {
                this.settings = null
                this.error = e?.message || String(e)
            } finally {
                this.loading = false
            }
        },

        reset() {
            this.slug = null
            this.source = null
            this.settings = null
            this.loading = false
            this.error = null
        },
    },
})
