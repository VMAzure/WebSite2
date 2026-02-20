// src/api/usatoPublic.js
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");

/**
 * Wrapper deterministico:
 * - se VITE_API_BASE_URL è presente -> usa sempre quello
 * - altrimenti -> same-origin (utile in dev con Vite proxy)
 * - niente fallback multi-host (evita divergenze tra ambienti)
 *
 * Importante: le rotte API sono tutte sotto /api/...
 */

function enc(v) {
    return encodeURIComponent(String(v ?? "").trim());
}

async function get(url, config) {
    const fullUrl = API_BASE ? `${API_BASE}${url}` : url;
    return (await axios.get(fullUrl, config)).data;
}

async function post(url, data, config) {
    const fullUrl = API_BASE ? `${API_BASE}${url}` : url;
    return (await axios.post(fullUrl, data, config)).data;
}

// =========================
// USATO PUBBLICO (prefix /api)
// =========================

export function fetchUsatoList(slug) {
    return get(`/api/azlease/usato-pubblico/${enc(slug)}`);
}

export function fetchUsatoDetail(slug, idAuto) {
    return get(`/api/azlease/usato-pubblico/${enc(slug)}/${enc(idAuto)}`);
}

export function fetchUsatoFoto(slug, idAuto) {
    // slug non serve in questa rotta (firma invariata per compatibilità)
    return get(`/api/azlease/usato/${enc(idAuto)}/vetrina`);
}

export function fetchUsatoDescrizione(idAuto) {
    return get(`/api/azlease/usato-pubblico/${enc(idAuto)}/descrizione`);
}

export function inviaContattoUsato({ slug, payload }) {
    return post(`/api/azlease/usato-pubblico/invia-contatto`, payload, {
        params: { _slug: slug },
    });
}

export function inviaContattoGenerico({ slug, payload }) {
    return post(`/api/azlease/usato-pubblico/invia-contatto-generico`, payload, {
        params: { _slug: slug },
    });
}

export function fetchUsatoDetailView(slug, idAuto) {
    return get(`/api/azlease/usato-pubblico/${enc(slug)}/${enc(idAuto)}/detail-view`);
}

// =========================
// NBT (CATEGORIE) (prefix /api)
// =========================

/**
 * Prima chiamavi (e andava in 404):
 *   /nbt/:slug/categorie
 *
 * Ora coerente con base-path API:
 *   /api/nbt/:slug/categorie
 */
export function fetchNbtCategorie(slug) {
    return get(`/api/nbt/${enc(slug)}/categorie`);
}

export { get, post };