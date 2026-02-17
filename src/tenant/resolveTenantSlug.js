// src/tenant/resolveTenantSlug.js

const DOMAIN_TENANT_MAP = {
    "europacarauto.it": "europacarauto",
    "www.europacarauto.it": "europacarauto",
    // "scuderia76.it": "scuderia76",
    // "www.scuderia76.it": "scuderia76",
    // ...
};

// rotte che NON sono slug (per evitare false detection su dominio)
const RESERVED_FIRST_SEGMENTS = new Set([
    "index",
    "tenant-not-configured",
    "privacy",
    "cookie-policy",
    "home",
    "usato",
    "usato-vetrina",
    "contatti",
    "nbt",
    "compro",
]);

function pickSlugFromPath(pathname) {
    const p = String(pathname || "/").split("?")[0];

    // /index/:slug/...
    const mIndex = p.match(/^\/index\/([^\/?#]+)(?:\/|$)/i);
    if (mIndex?.[1]) return decodeURIComponent(mIndex[1]).trim();

    // /:slug/...
    const mFirst = p.match(/^\/([^\/?#]+)(?:\/|$)/i);
    if (mFirst?.[1]) {
        const cand = decodeURIComponent(mFirst[1]).trim();
        if (cand && !RESERVED_FIRST_SEGMENTS.has(cand.toLowerCase())) return cand;
    }

    return "";
}

export async function resolveTenantSlug(route) {
    // 1) params slug (quando la rotta lo espone)
    const paramSlug =
        typeof route?.params?.slug === "string" ? route.params.slug.trim() : "";
    if (paramSlug) return { slug: paramSlug, source: "path" };

    // 2) pathname (Railway/shared-host e preview)
    if (typeof window !== "undefined") {
        const fromPath = pickSlugFromPath(window.location.pathname);
        if (fromPath) return { slug: fromPath, source: "path" };
    }

    // 3) domain slug (prod custom domains)
    if (typeof window !== "undefined") {
        const host = (window.location.hostname || "").toLowerCase();
        const hostNoWww = host.replace(/^www\./, "");
        const domainSlug = DOMAIN_TENANT_MAP[host] || DOMAIN_TENANT_MAP[hostNoWww];
        if (domainSlug) return { slug: domainSlug, source: "domain" };
    }

    // 4) niente slug
    return { slug: "", source: "none" };
}
