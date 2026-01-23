function ensureScript(src, id) {
    if (typeof document === "undefined") return
    if (document.getElementById(id)) return
    const s = document.createElement("script")
    s.src = src
    s.async = true
    s.id = id
    document.body.appendChild(s)
}

export function loadIubendaIfNeeded(compliance) {
    if (typeof window === "undefined") return
    if (!compliance?.enabled) return
    if (compliance?.provider !== "iubenda") return

    const cfg = compliance.config || {}
    const lang = cfg.lang || "it"
    const siteId = cfg.site_id
    const cookiePolicyId = cfg.cookie_policy_id
    const privacyPolicyId = cfg.privacy_policy_id

    if (!siteId || !cookiePolicyId || !privacyPolicyId) return

    // idempotenza per app con stato persistente
    const key = `iubenda:${siteId}:${cookiePolicyId}:${privacyPolicyId}:${lang}`
    if (window.__iubenda_loaded_key === key) return
    window.__iubenda_loaded_key = key

    // config globale (prima dello script)
    window._iub = window._iub || []
    window._iub.csConfiguration = {
        siteId,
        cookiePolicyId,
        privacyPolicyId,
        lang,
    }

    // carica CMP
    ensureScript("https://cdn.iubenda.com/cs/iubenda_cs.js", "iubenda-cs")
}
