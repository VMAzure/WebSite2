import { defineStore } from "pinia"

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        slug: null,
        settings: null,
        resolved: false
    }),
    actions: {
        setSlug(slug) {
            this.slug = slug
        },
        setSettings(settings) {
            this.settings = settings
        },
        setResolved(value) {
            this.resolved = value
        },
        reset() {
            this.slug = null
            this.settings = null
            this.resolved = false
        }
    }
})
