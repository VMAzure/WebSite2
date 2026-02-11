import axios from "axios";

export async function submitComproAutoLead(slug, payload) {
    if (!slug) throw new Error("slug_missing");

    const url = `/api/azlease/usato-pubblico/invia-contatto-generico`;

    const mapped = {
        nome: payload?.nome || "",
        cognome: payload?.cognome || "", // ✅ REQUIRED dal BE
        telefono: payload?.phone || "",
        email: payload?.email || "",
        targa: payload?.plate || "",
        note: payload?.message || "",
        source: payload?.source || "compro-auto",
    };

    const { data } = await axios.post(url, mapped, {
        params: { _slug: String(slug).trim() }, // ✅ _slug
    });

    return data;
}
