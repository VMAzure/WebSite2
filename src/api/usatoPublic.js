import axios from "axios"

// Se hai già axios configurato altrove, usa quello.
// Altrimenti: baseURL vuoto => usa proxy Vite / stesso dominio in prod.
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
    const { data } = await http.get(
        `/api/azlease/usato-pubblico/${encodeURIComponent(slug)}/${encodeURIComponent(idAuto)}/foto`
    )
    return data
}

export async function inviaContattoUsato({ slug, payload }) {
    const { data } = await http.post(
        `/api/azlease/usato-pubblico/invia-contatto`,
        payload,
        { params: { _slug: slug } }
    )
    return data
}
