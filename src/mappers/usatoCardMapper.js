// src/mappers/usatoCardMapper.js

function toNumber(value, fallback = 0) {
    const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."))
    return Number.isFinite(n) ? n : fallback
}

function toStringSafe(v) {
    return String(v ?? "").trim()
}

export function mapToCardUsatoDto(item) {
    const id_auto = item?.id_auto ?? item?.id ?? item?.IdAuto
    if (!id_auto) return null

    const marca = toStringSafe(item?.marca ?? item?.brand ?? item?.Marca)
    const allestimento = toStringSafe(item?.allestimento ?? item?.model ?? item?.Allestimento)

    const anno_immatricolazione = toNumber(item?.anno_immatricolazione ?? item?.anno ?? item?.Anno)
    const km_certificati = toNumber(item?.km_certificati ?? item?.km ?? item?.Km)
    const prezzo_vendita = toNumber(item?.prezzo_vendita ?? item?.prezzo ?? item?.Prezzo)

    const cover_url =
        toStringSafe(item?.cover_url ?? item?.coverUrl ?? item?.immagine_copertina) || null

    return {
        id_auto,
        marca,
        allestimento,
        anno_immatricolazione,
        km_certificati,
        prezzo_vendita,
        cover_url,
    }
}

export function mapListToCardUsatoDto(list) {
    const arr = Array.isArray(list) ? list : []
    return arr.map(mapToCardUsatoDto).filter(Boolean)
}
