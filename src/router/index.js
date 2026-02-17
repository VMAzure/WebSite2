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

    // ✅ Railway/shared-host canonical: /:slug/...
    {
        path: "/:slug",
        name: "HomeScoped",
        component: IndexPage,
        meta: { tenantRequired: true, canonical: "/" },
    },
    {
        path: "/:slug/usato",
        name: "UsatoScoped",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },
    {
        path: "/:slug/usato/:id",
        name: "UsatoDetailScoped",
        component: () => import("@/pages/UsatoDetailPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato" },
    },
    {
        path: "/:slug/usato-vetrina",
        name: "UsatoVetrinaScoped",
        component: () => import("@/pages/UsatoPage.vue"),
        meta: { tenantRequired: true, canonical: "/usato-vetrina" },
    },
    {
        path: "/:slug/contatti",
        name: "ContattiScoped",
        component: () => import("@/pages/ContattiPage.vue"),
        meta: { tenantRequired: true, canonical: "/contatti" },
    },
    {
        path: "/:slug/nbt",
        name: "NbtScoped",
        component: () => import("@/pages/NbtPage.vue"),
        meta: { tenantRequired: true, canonical: "/nbt" },
    },
    {
        path: "/:slug/compro",
        name: "ComproScoped",
        component: () => import("@/pages/ComproAutoPage.vue"),
        meta: { tenantRequired: true, canonical: "/compro" },
    },


    // ✅ Home pulita (prod). In locale senza dominio configurato → tenant-not-configured
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

    // ✅ Contatti (pulito)
    {
        path: "/contatti",
        name: "Contatti",
        component: () => import("@/pages/ContattiPage.vue"),
        meta: { tenantRequired: true, canonical: "/contatti" },
    },

    // ✅ NBT (pulito)
    {
        path: "/nbt",
        name: "NbtPage",
        component: () => import("@/pages/NbtPage.vue"),
        meta: { tenantRequired: true, canonical: "/nbt" },
    },

    // ✅ PROD (domain-based): /compro
    {
        path: "/compro",
        name: "ComproAuto",
        component: () => import("@/pages/ComproAutoPage.vue"),
        meta: { tenantRequired: true, canonical: "/compro" },
    },

    // ✅ DEV/LOCAL (slug-based): /index/:slug/compro
    {
        path: "/index/:slug/compro",
        name: "ComproAutoDev",
        component: () => import("@/pages/ComproAutoPage.vue"),
        meta: { tenantRequired: true, canonical: "/compro" },
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

    // ✅ Contatti preview/dev
    {
        path: "/index/:slug/contatti",
        name: "ContattiPreview",
        component: () => import("@/pages/ContattiPage.vue"),
        meta: { tenantRequired: true, canonical: "/contatti" },
    },

    // ✅ NBT preview/dev
    {
        path: "/index/:slug/nbt",
        name: "NbtPagePreview",
        component: () => import("@/pages/NbtPage.vue"),
        meta: { tenantRequired: true, canonical: "/nbt" },
    },

    // alias legacy /nbt -> canonical
    {
        path: "/nbt",
        redirect: { name: "NoleggioNBT" },
        meta: { tenantRequired: true },
    },
    {
        path: "/index/:slug/nbt",
        redirect: { name: "NoleggioNBTPreview" },
        meta: { tenantRequired: true },
    },

    // ✅ pagine di sistema (NON devono dipendere dal tenant)
    {
        path: "/tenant-not-configured",
        name: "TenantNotConfigured",
        component: TenantNotConfigured,
        meta: { tenantRequired: false },
    },

    // stub (non vogliamo url “legali” standalone qui)
    { path: "/privacy", redirect: "/", meta: { tenantRequired: true } },
    { path: "/cookie-policy", redirect: "/", meta: { tenantRequired: true } },

    // ✅ fallback (DEVE essere l’ultima)
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: TenantNotConfigured,
        meta: { tenantRequired: false },
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

    // ✅ canonicalize preview URLs: /index/:slug/... -> /:slug/...
    if (resolved?.source === "path" && to.path.startsWith("/index/")) {
        const slug = resolved.slug;

        // calcolo destinazione canonica usando meta.canonical
        const canonical = to.meta?.canonical || "/";
        // canonical è tipo "/", "/usato", "/nbt" ecc.
        return {
            path: `/${slug}${canonical === "/" ? "" : canonical}`,
            replace: true,
        };
    }


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
            console.error("[router] bootstrapTenant failed:", e);
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
