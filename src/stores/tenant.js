import { defineStore } from "pinia"

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        slug: null,
        settings: null,
        resolved: false,
        loading: false,
        error: null
    }),

    actions: {
        setSlug(slug) {
            this.slug = slug
        },

        reset() {
            this.slug = null
            this.settings = null
            this.resolved = false
            this.loading = false
            this.error = null
        },

        // QUESTA È LA CHIAMATA AL TUO BACKEND
        async loadPublicSettings(slug) {
            this.loading = true
            this.error = null
            this.resolved = false

            try {
                const response = await fetch(
                    `https://api.azcore.it/api/site-settings-public/${slug}`
                )

                if (!response.ok) {
                    throw new Error("Errore API")
                }

                const data = await response.json()

                this.settings = data
                this.resolved = true
                return data
            } catch (err) {
                this.error = err.message
                this.settings = null
                this.resolved = false
            } finally {
                this.loading = false
            }
        }
    }
})
