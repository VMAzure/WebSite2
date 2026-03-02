// src/compliance/iubenda.js

function ensureScript(src, id) {
    if (typeof document === "undefined") return;
    if (document.getElementById(id)) return;

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.id = id;
    s.crossOrigin = "anonymous";
    document.body.appendChild(s);
}

// Esegue fn quando:
// 1) la pagina ha finito il load
// 2) il browser è in idle (o dopo timeout)
// → evita che il CMP diventi LCP su mobile
function runAfterLoadAndIdle(fn) {
    if (typeof window === "undefined") return;

    const runIdle = () => {
        // requestIdleCallback se disponibile, altrimenti fallback
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(
                () => fn(),
                { timeout: 2500 }, // max attesa: 2.5s, poi lo facciamo partire
            );
        } else {
            setTimeout(fn, 1200);
        }
    };

    // se load già avvenuto, vai subito in idle
    if (document.readyState === "complete") {
        runIdle();
        return;
    }

    // altrimenti aspetta load, poi idle
    window.addEventListener(
        "load",
        () => runIdle(),
        { once: true, passive: true },
    );
}

export function loadIubendaIfNeeded(compliance) {
    if (typeof window === "undefined") return;
    if (!compliance?.enabled) return;
    if (compliance?.provider !== "iubenda") return;

    const cfg = compliance.config || {};
    const lang = cfg.lang || "it";
    const siteId = cfg.site_id;
    const cookiePolicyId = cfg.cookie_policy_id;
    const privacyPolicyId = cfg.privacy_policy_id;

    if (!siteId || !cookiePolicyId || !privacyPolicyId) return;

    // idempotenza per app con stato persistente
    const key = `iubenda:${siteId}:${cookiePolicyId}:${privacyPolicyId}:${lang}`;
    if (window.__iubenda_loaded_key === key) return;
    window.__iubenda_loaded_key = key;

    // config globale (prima dello script)
    window._iub = window._iub || [];
    window._iub.csConfiguration = {
        siteId,
        cookiePolicyId,
        privacyPolicyId,
        lang,
    };

    // ✅ DEFER: NON caricare subito → dopo load + idle
    runAfterLoadAndIdle(() => {
        ensureScript("https://cdn.iubenda.com/cs/iubenda_cs.js", "iubenda-cs");
    });
}