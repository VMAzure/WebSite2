import axios from "axios"

export async function fetchSiteCompliancePublic(slug) {
    if (!slug) throw new Error("slug_missing")
    const { data } = await axios.get(`/api/site-compliance-public/${slug}`)
    return data
}
