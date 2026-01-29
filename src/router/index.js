// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useTenantStore } from "@/stores/tenant";
import { resolveTenantSlug } from "@/tenant/resolveTenantSlug";
import { bootstrapTenant } from "@/tenant/bootstrapTenant";

// Pagine
import IndexPage from "@/pages/IndexPage.vue";
import TenantNotConfigured from "@/pages/TenantNotConfigured.vue";

const routes = [
    // alias (se qualche pezzo manda a /home)
    { path: "/home", redirect: { name: "Home" } },

    // ✅ Home pulita (prod). In locale senza dominio configurato → andrà a tenant-not-configured.
    {
        path: "/",
        name: "Home",
        component: IndexPage,
        meta: { tenantRequired: true, canonical: "/" },
    },

    // ✅ Usato (pulito)
    {
        path: "/usato",
        name: "UsatoPage",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },
    {
        path: "/usato/:id",
        name: "UsatoDetail",
        component: () => import("@/pages/UsatoDetailPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },

    // ✅ Usato vetrina (pulito)
    {
        path: "/usato-vetrina",
        name: "UsatoVetrina",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato-vetrina" },
    },

    // ✅ Dev/preview (con slug in path)
    {
        path: "/index/:slug",
        name: "HomeDev",
        component: IndexPage,
        meta: { tenantRequired: true, canonical: "/" },
    },
    {
        path: "/index/:slug/usato",
        name: "UsatoPagePreview",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },
    {
        path: "/index/:slug/usato/:id",
        name: "UsatoDetailPreview",
        component: () => import("@/pages/UsatoDetailPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },
    {
        path: "/index/:slug/usato-vetrina",
        name: "UsatoVetrinaPreview",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato-vetrina" },
    },

    // ✅ pagina di sistema (NON deve dipendere dal tenant)
    {
        path: "/tenant-not-configured",
        name: "TenantNotConfigured",
        component: TenantNotConfigured,
        meta: { tenantRequired: false },
    },
    {
        path: "/privacy",
        redirect: "/",
        meta: { tenantRequired: true },
    },
    {
        path: "/cookie-policy",
        redirect: "/",
        meta: { tenantRequired: true },
    },

    // fallback
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: TenantNotConfigured,
        meta: { tenantRequired: false },
    },

    {
        path: "/index/:slug/contatti",
        name: "Contatti",
        component: () => import("@/pages/ContattiPage.vue"),
        meta: { tenantRequired: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    },
});

router.beforeEach(async (to) => {
    const tenant = useTenantStore();

    const resolved = await resolveTenantSlug(to);

    // se la route richiede tenant ma non ho slug -> errore
    if (to.meta?.tenantRequired && !resolved?.slug) {
        return { name: "TenantNotConfigured", replace: true };
    }

    // set store slug
    if (resolved?.slug && tenant.slug !== resolved.slug) {
        tenant.setTenant(resolved);
    }

    // carica settings UNA volta (dedup interno)
    if (to.meta?.tenantRequired && resolved?.slug) {
        try {
            await bootstrapTenant(to);
        } catch (e) {
            // ✅ NON buttare fuori: lo slug c'è, è solo un problema di fetch/settings
            console.error("[router] bootstrapTenant failed:", e);
            // opzionale: pulisci settings per mostrare loading/errore in App.vue
            tenant.setSettings(null);
            return true;
        }
    }

    // pulizia URL: su dominio (source=domain) non voglio /index/:slug/...
    if (resolved?.source === "domain" && to.path.startsWith("/index/")) {
        const canonical = to.meta?.canonical;
        if (canonical) return { path: canonical, replace: true };
    }

    return true;
});

export default router;
