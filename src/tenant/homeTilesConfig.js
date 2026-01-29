// src/tenant/homeTilesConfig.js

const DEFAULT_BODY_TYPES = [
    { key: "suv", label: "SUV", iconUrl: "/img/body/suv.png" },
    { key: "sw", label: "Station wagon", iconUrl: "/img/body/sw.png" },
    { key: "berlina", label: "Berlina", iconUrl: "/img/body/berlina.png" },
    { key: "van", label: "Furgone / Minibus", iconUrl: "/img/body/van.png" },
    { key: "cabrio", label: "Cabriolet", iconUrl: "/img/body/cabrio.png" },
    { key: "coupe", label: "Coupé", iconUrl: "/img/body/coupe.png" },
    { key: "citycar", label: "City car", iconUrl: "/img/body/citycar.png" },
    { key: "pickup", label: "Pickup", iconUrl: "/img/body/pickup.png" },
];

const DEFAULT_BRANDS = [
    { key: "audi", label: "Audi", iconUrl: "/img/brands/audi.png" },
    { key: "bmw", label: "BMW", iconUrl: "/img/brands/bmw.png" },
    {
        key: "mercedes",
        label: "Mercedes-Benz",
        iconUrl: "/img/brands/mercedes.png",
    },
    { key: "vw", label: "Volkswagen", iconUrl: "/img/brands/vw.png" },
    { key: "fiat", label: "Fiat", iconUrl: "/img/brands/fiat.png" },
    { key: "toyota", label: "Toyota", iconUrl: "/img/brands/toyota.png" },
    { key: "ford", label: "Ford", iconUrl: "/img/brands/ford.png" },
    { key: "jeep", label: "Jeep", iconUrl: "/img/brands/jeep.png" },
    { key: "peugeot", label: "Peugeot", iconUrl: "/img/brands/peugeot.png" },
    { key: "renault", label: "Renault", iconUrl: "/img/brands/renault.png" },
    { key: "opel", label: "Opel", iconUrl: "/img/brands/opel.png" },
    { key: "citroen", label: "Citroën", iconUrl: "/img/brands/citroen.png" },
    { key: "nissan", label: "Nissan", iconUrl: "/img/brands/nissan.png" },
    { key: "hyundai", label: "Hyundai", iconUrl: "/img/brands/hyundai.png" },
    { key: "kia", label: "Kia", iconUrl: "/img/brands/kia.png" },
    { key: "tesla", label: "Tesla", iconUrl: "/img/brands/tesla.png" },
    { key: "volvo", label: "Volvo", iconUrl: "/img/brands/volvo.png" },
    { key: "mini", label: "MINI", iconUrl: "/img/brands/mini.png" },
    { key: "alfa", label: "Alfa Romeo", iconUrl: "/img/brands/alfaromeo.png" },
    { key: "dacia", label: "Dacia", iconUrl: "/img/brands/dacia.png" },
];

// Qui gestisci tenant per tenant
const TENANT_TILES = {
    // ✅ esempio tuo
    europacarauto: {
        bodyTypes: DEFAULT_BODY_TYPES,
        brands: [
            // qui puoi metterne QUANTI vuoi (ordine = ordine di visualizzazione)
            ...DEFAULT_BRANDS,
            // aggiunte extra (anche senza icona, non crasha)
            { key: "skoda", label: "Škoda", iconUrl: "/img/brands/skoda.png" },
            { key: "seat", label: "SEAT", iconUrl: "/img/brands/seat.png" },
            { key: "cupra", label: "CUPRA", iconUrl: "/img/brands/cupra.png" },
            { key: "mazda", label: "Mazda", iconUrl: "/img/brands/mazda.png" },
            { key: "honda", label: "Honda", iconUrl: "/img/brands/honda.png" },
            { key: "suzuki", label: "Suzuki", iconUrl: "/img/brands/suzuki.png" },
        ],
    },
};

function normalize(list) {
    const arr = Array.isArray(list) ? list : [];
    return arr
        .filter(Boolean)
        .map((x) => ({
            key: String(x.key || "").trim(),
            label: String(x.label || "").trim(),
            iconUrl: String(x.iconUrl || "").trim(),
        }))
        .filter((x) => x.key && x.label);
}

export function getBodyTypesForSlug(slug) {
    const s = String(slug || "")
        .trim()
        .toLowerCase();
    const fromTenant = TENANT_TILES[s]?.bodyTypes;
    return normalize(
        fromTenant && fromTenant.length ? fromTenant : DEFAULT_BODY_TYPES,
    );
}

export function getBrandsForSlug(slug) {
    const s = String(slug || "")
        .trim()
        .toLowerCase();
    const fromTenant = TENANT_TILES[s]?.brands;
    return normalize(
        fromTenant && fromTenant.length ? fromTenant : DEFAULT_BRANDS,
    );
}
