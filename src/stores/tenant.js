import { defineStore } from "pinia";

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        slug: null,
        tenant: null,
        source: null,

        settings: null,
        compliance: null,

        team: [],
        teamLoadedSlug: null,
    }),

    actions: {
        setTenant(payload) {
            this.slug = payload?.slug || this.slug;
            this.source = payload?.source || this.source;
        },

        setSettings(settings) {
            this.settings = settings || null;
        },

        setCompliance(compliance) {
            this.compliance = compliance || null;
        },

        setTeam(team, slug) {
            this.team = Array.isArray(team) ? team : [];
            this.teamLoadedSlug = slug || this.slug || null;
        },
    },
});
