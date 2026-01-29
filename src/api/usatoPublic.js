// src/api/usatoPublic.js
import axios from "axios"

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
})

export async function fetchUsatoList(slug) {
    const { data } = await http.get(`/api/azlease/usato-pubblico/${encodeURIComponent(slug)}`)
    return data
}

export async function fetchUsatoDetail(slug, idAuto) {
    const { data } = await http.get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(slug)}/${encodeURIComponent(idAuto)}`
    )
    return data
}

export async function fetchUsatoFoto(slug, idAuto) {
    const { data } = await http.get(`/api/azlease/usato/${encodeURIComponent(idAuto)}/vetrina`)
    return data
}

// ✅ NUOVA: descrizione pubblica (NON usa slug)
export async function fetchUsatoDescrizione(idAuto) {
    const { data } = await http.get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(idAuto)}/descrizione`
    )
    return data
}

export async function inviaContattoUsato({ slug, payload }) {
    const { data } = await http.post(`/api/azlease/usato-pubblico/invia-contatto`, payload, {
        params: { _slug: slug },
    })
    return data
}
// ✅ NUOVA: detail + photos + related (una sola orchestrazione)
export async function fetchUsatoDetailView(slug, idAuto) {
    const { data } = await http.get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(slug)}/${encodeURIComponent(idAuto)}/detail-view`
    )
    return data
}

