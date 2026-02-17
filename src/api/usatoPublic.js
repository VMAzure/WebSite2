// src/api/usatoPublic.js
import axios from "axios";

const API_BASE =
    (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

const FALLBACK_BASE = "https://api.azcore.it"; // stessa logica di bootstrapTenant

async function get(url, config) {
    try {
        // 1) se API_BASE è valorizzata, usa quella
        if (API_BASE) return (await axios.get(`${API_BASE}${url}`, config)).data;

        // 2) altrimenti prova same-origin (locale = Vite proxy)
        return (await axios.get(url, config)).data;
    } catch (e1) {
        // 3) fallback assoluto (prod)
        return (await axios.get(`${FALLBACK_BASE}${url}`, config)).data;
    }
}

async function post(url, data, config) {
    try {
        if (API_BASE) return (await axios.post(`${API_BASE}${url}`, data, config)).data;
        return (await axios.post(url, data, config)).data;
    } catch (e1) {
        return (await axios.post(`${FALLBACK_BASE}${url}`, data, config)).data;
    }
}

export function fetchUsatoList(slug) {
    return get(`/api/azlease/usato-pubblico/${encodeURIComponent(slug)}`);
}

export function fetchUsatoDetail(slug, idAuto) {
    return get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(slug)}/${encodeURIComponent(idAuto)}`
    );
}

export function fetchUsatoFoto(slug, idAuto) {
    return get(`/api/azlease/usato/${encodeURIComponent(idAuto)}/vetrina`);
}

export function fetchUsatoDescrizione(idAuto) {
    return get(`/api/azlease/usato-pubblico/${encodeURIComponent(idAuto)}/descrizione`);
}

export function inviaContattoUsato({ slug, payload }) {
    return post(`/api/azlease/usato-pubblico/invia-contatto`, payload, {
        params: { _slug: slug },
    });
}

export function fetchUsatoDetailView(slug, idAuto) {
    return get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(slug)}/${encodeURIComponent(idAuto)}/detail-view`
    );
}
