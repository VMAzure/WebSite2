// src/mappers/brandsMapper.js

function toStringSafe(v) {
    return String(v ?? "").trim();
}
function toNumberSafe(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Output per BrandCarousel:
 * [{ key, label, iconUrl }]
 */
export function mapBrandsCountToCarouselItems(payload) {
    const arr = Array.isArray(payload?.brands) ? payload.brands : [];

    const normalized = arr
        .map((b) => {
            const key = toStringSafe(b?.brand_slug);
            const label = toStringSafe(b?.brand_nome);
            const iconUrl = toStringSafe(b?.brand_logo);
            const disponibili = toNumberSafe(b?.disponibili);

            return { key, label, iconUrl, disponibili };
        })
        .filter((x) => x.key && x.label)
        .filter((x) => x.disponibili > 0) // ✅ solo brand con auto disponibili
        .sort((a, b) => b.disponibili - a.disponibili)
        .slice(0, 20)
        .map(({ key, label, iconUrl }) => ({ key, label, iconUrl }));

    return normalized;
}
