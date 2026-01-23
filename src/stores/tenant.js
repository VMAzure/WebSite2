import { defineStore } from "pinia"

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        slug: null,
        tenant: null,
        source: null,

        // ✅ già usato in App.vue (computed)
        settings: null,

        // ✅ nuovo: cookie/privacy/cmp per lo slug
        compliance: null,
    }),

    actions: {
        setTenant(payload) {
            this.slug = payload?.slug || this.slug
            this.source = payload?.source || this.source
        },

        setSettings(settings) {
            this.settings = settings || null
        },

        // ✅ nuovo
        setCompliance(compliance) {
            this.compliance = compliance || null
        },
    },
})
