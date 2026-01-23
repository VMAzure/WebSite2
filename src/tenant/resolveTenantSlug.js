// src/tenant/resolveTenantSlug.js

const DOMAIN_TENANT_MAP = {
    "europacarauto.it": "europacarauto",
    "www.europacarauto.it": "europacarauto",
    // "scuderia76.it": "scuderia76",
    // "www.scuderia76.it": "scuderia76",
    // "gamma-auto.it": "gamma-auto",
    // "www.gamma-auto.it": "gamma-auto",
}

export async function resolveTenantSlug(route) {
    // 1) path slug (dev/preview)
    const pathSlug =
        typeof route?.params?.slug === "string" ? route.params.slug.trim() : ""
    if (pathSlug) return { slug: pathSlug, source: "path" }

    // 2) domain slug (prod)
    if (typeof window !== "undefined") {
        const host = (window.location.hostname || "").toLowerCase()
        const hostNoWww = host.replace(/^www\./, "")
        const domainSlug = DOMAIN_TENANT_MAP[host] || DOMAIN_TENANT_MAP[hostNoWww]
        if (domainSlug) return { slug: domainSlug, source: "domain" }
    }

    // 3) niente slug
    return { slug: "", source: "none" }
}
