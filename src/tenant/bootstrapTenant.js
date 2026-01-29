// src/tenant/bootstrapTenant.js
import axios from "axios"
import { useTenantStore } from "@/stores/tenant"
import { resolveTenantSlug } from "@/tenant/resolveTenantSlug"

let inFlight = null
let inFlightSlug = null

let inFlightCompliance = null
let inFlightComplianceSlug = null

let inFlightTeam = null
let inFlightTeamSlug = null

export async function bootstrapTenant(route) {
    const tenant = useTenantStore()

    const resolved = await resolveTenantSlug(route)
    const slug = (resolved?.slug || "").toString().trim()

    if (!slug) throw new Error("slug_missing")

    // ✅ settings già in cache → avvia comunque le fetch "secondarie" (dedup già presente)
    if (tenant.slug === slug && tenant.settings) {
        kickOffComplianceLoad(tenant, slug)
        kickOffTeamLoad(tenant, slug)
        return tenant
    }

    // ✅ dedup bootstrap
    if (inFlight && inFlightSlug === slug) return inFlight

    inFlightSlug = slug
    inFlight = (async () => {
        tenant.setTenant({ slug, source: resolved.source })

        // ✅ SETTINGS: proxy /api (se configurato), fallback full URL
        let data = null
        try {
            const r1 = await axios.get(
                `/api/site-settings-public/${encodeURIComponent(slug)}`,
                { timeout: 15000 },
            )
            data = r1.data
        } catch (e1) {
            const url = `https://api.azcore.it/api/site-settings-public/${encodeURIComponent(slug)}`
            const r2 = await axios.get(url, { timeout: 15000 })
            data = r2.data
        }

        tenant.setSettings(data)
        applyTenantTheme(data)

        // ✅ async, non blocca
        kickOffComplianceLoad(tenant, slug)
        kickOffTeamLoad(tenant, slug)

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

                // ✅ proxy /api, fallback full URL
                try {
                    const r1 = await axios.get(
                        `/api/site-compliance-public/${encodeURIComponent(slug)}`,
                        { timeout: 15000 },
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

    function kickOffTeamLoad(tenant, slug) {
        // ✅ già caricato SOLO se è stato caricato PER QUESTO slug
        if (tenant.slug === slug && tenant.teamLoadedSlug === slug) return

        // dedup
        if (inFlightTeam && inFlightTeamSlug === slug) return

        inFlightTeamSlug = slug
        inFlightTeam = (async () => {
            try {
                let payload = null

                // ✅ proxy /api (ma forza errore su 404) → così parte il fallback
                try {
                    const r1 = await axios.get(
                        `/api/users/team-pubblico/${encodeURIComponent(slug)}`,
                        {
                            timeout: 15000,
                            validateStatus: (s) => s >= 200 && s < 300, // ✅ catch su 404
                        },
                    )
                    payload = r1.data
                } catch (e1) {
                    const url = `https://api.azcore.it/users/team-pubblico/${encodeURIComponent(slug)}`
                    const r2 = await axios.get(url, { timeout: 15000 })
                    payload = r2.data
                }

                const teamArr = Array.isArray(payload?.team) ? payload.team : []
                tenant.setTeam(teamArr, slug)
            } catch (_) {
                tenant.setTeam([], slug)
            } finally {
                inFlightTeam = null
                inFlightTeamSlug = null
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
    try {
        if (typeof document === "undefined") return
        if (!settings) return
    } catch (_) { }

    const font = settings?.font_family
    if (font) {
        document.documentElement.style.setProperty("--dynamic-font", font)
        document.body.classList.add("dynamic-font")
    }
}
