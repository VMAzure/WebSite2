// src/api/brandsPublic.js
import axios from "axios"

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
})

export async function fetchBrandsCount(slug) {
    const { data } = await http.get(`/api/azlease/brands-count/${encodeURIComponent(slug)}`)
    return data
}
