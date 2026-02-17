// src/api/servicesPublic.js
import { inviaContattoGenerico } from "@/api/usatoPublic";

export async function submitComproAutoLead(slug, payload) {
    if (!slug) throw new Error("slug_missing");

    // mappo i campi Compro -> payload backend (inviaContattoGenerico)
    const mapped = {
        nome: payload?.nome || "",
        cognome: payload?.cognome || "",
        telefono: payload?.phone || "",
        email: payload?.email || "",
        messaggio: payload?.message || "",
        destinatario_email: payload?.destinatario_email, // opzionale
        source: payload?.source || "compro-auto",
        // se vuoi tenere questi campi, puoi metterli nel messaggio:
        // targa: payload?.plate || "",
        // note: payload?.message || "",
    };

    return inviaContattoGenerico({
        slug: String(slug).trim(),
        payload: mapped,
    });
}
