// src/tenant/bootstrapTenant.js
import axios from "axios"
import { useTenantStore } from "@/stores/tenant"
import { resolveTenantSlug } from "@/tenant/resolveTenantSlug"

let inFlight = null
let inFlightSlug = null

let inFlightCompliance = null
let inFlightComplianceSlug = null


export async function bootstrapTenant(route) {
    const tenant = useTenantStore()

    const resolved = await resolveTenantSlug(route)
    const slug = (resolved?.slug || "").toString().trim()

    if (!slug) throw new Error("slug_missing")

    // già pronto
    if (tenant.slug === slug && tenant.settings) return tenant

    // dedup
    if (inFlight && inFlightSlug === slug) return inFlight

    inFlightSlug = slug
    inFlight = (async () => {
        tenant.setTenant({ slug, source: resolved.source })

        // ✅ prova prima via proxy locale /api (se configurato), poi fallback al full URL
        let data = null

        try {
            const r1 = await axios.get(
                `/api/site-settings-public/${encodeURIComponent(slug)}`,
                { timeout: 15000 }
            )
            data = r1.data
        } catch (e1) {
            const url = `https://api.azcore.it/api/site-settings-public/${encodeURIComponent(slug)}`
            const r2 = await axios.get(url, { timeout: 15000 })
            data = r2.data
        }

        tenant.setSettings(data)
        applyTenantTheme(data)

        kickOffComplianceLoad(tenant, slug)

        return tenant
    })()

    function kickOffComplianceLoad(tenant, slug) {
        // già caricata per questo slug
        if (tenant.slug === slug && tenant.compliance) return

        // dedup
        if (inFlightCompliance && inFlightComplianceSlug === slug) return

        inFlightComplianceSlug = slug
        inFlightCompliance = (async () => {
            try {
                let data = null

                // ✅ proxy locale /api (se configurato), fallback full URL
                try {
                    const r1 = await axios.get(
                        `/api/site-compliance-public/${encodeURIComponent(slug)}`,
                        { timeout: 15000 }
                    )
                    data = r1.data
                } catch (e1) {
                    const url = `https://api.azcore.it/api/site-compliance-public/${encodeURIComponent(slug)}`
                    const r2 = await axios.get(url, { timeout: 15000 })
                    data = r2.data
                }

                tenant.setCompliance(data)
            } catch (_) {
                tenant.setCompliance(null)
            } finally {
                inFlightCompliance = null
                inFlightComplianceSlug = null
            }
        })()
    }


    try {
        return await inFlight
    } finally {
        inFlight = null
        inFlightSlug = null
    }
}

function applyTenantTheme(settings) {
    // se avevi già una tua applyTenantTheme altrove, qui non tocchiamo nulla.
    // Non deve crashare mai.
    try {
        if (typeof document === "undefined") return
        if (!settings) return
        // opzionale: metti qui solo cose SAFE (css vars) se ti servono
    } catch (_) { }
    const font = settings?.font_family
    if (font) {
        document.documentElement.style.setProperty("--dynamic-font", font)
        document.body.classList.add("dynamic-font")
    }

}
