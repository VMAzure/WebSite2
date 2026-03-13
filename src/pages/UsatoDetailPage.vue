<!-- src/pages/UsatoDetailPage.vue -->
<script setup>
    import { computed, onMounted, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import {
        fetchUsatoDetail,
        fetchUsatoDetailAttivi,
        fetchUsatoFoto,
        fetchUsatoList,
    } from "@/api/usatoPublic";
  

    const route = useRoute();
    const router = useRouter();
    const tenant = useTenantStore();

    const settings = computed(() => tenant.settings || {});
    const slug = computed(() => (route.params.slug || tenant.slug || "").toString().trim());
    const idAuto = computed(() => String(route.params.id || "").trim());

    function firstNonEmpty(...values) {
        for (const v of values) {
            const s = String(v || "").trim();
            if (s) return s;
        }
        return "";
    }

    // Stesse chiavi della Topbar (settings.contact_phone / contact_email) così i contatti sono sempre allineati
    const contactPhone = computed(() => {
        const s = settings.value || {};
        const c = s.contatti || {};
        const sede = s.sede || {};
        const root = carRaw.value || {};

        return firstNonEmpty(
            s.contact_phone,
            s.phone,
            s.telefono,
            s.phone_number,
            s.telefono_principale,
            s.telefono_fisso,
            s.tel,
            s.mobile,
            s.cellulare,
            s.numero_telefono,
            s.contact_phone_number,
            c.telefono,
            c.phone,
            c.mobile,
            c.cellulare,
            sede.telefono,
            sede.phone,
            root.contact_phone,
            root.telefono,
            root.phone,
            root.dealer_phone,
            root.seller_phone
        );
    });

    const contactWhatsapp = computed(() => {
        const s = settings.value || {};
        const c = s.contatti || {};

        return firstNonEmpty(
            s.whatsapp,
            s.whatsapp_phone,
            s.telefono_whatsapp,
            s.numero_whatsapp,
            s.whatsapp_number,
            c.whatsapp,
            c.whatsapp_phone,
            contactPhone.value
        );
    });

    // Stesse chiavi della Topbar (settings.contact_email) così i contatti sono sempre allineati
    const contactEmail = computed(() => {
        const s = settings.value || {};
        const c = s.contatti || {};
        const sede = s.sede || {};
        const root = carRaw.value || {};

        return firstNonEmpty(
            s.contact_email,
            s.email,
            s.mail,
            s.email_contatto,
            s.email_principale,
            s.contact_email_address,
            c.email,
            c.mail,
            sede.email,
            sede.mail,
            root.contact_email,
            root.email,
            root.dealer_email,
            root.seller_email
        );
    });

    function normalizePhoneForHref(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";

        let cleaned = raw.replace(/[^+\d]/g, "");

        if (cleaned.startsWith("00")) {
            cleaned = `+${cleaned.slice(2)}`;
        }

        return cleaned;
    }
    const phoneHref = computed(() => {
        const normalized = normalizePhoneForHref(contactPhone.value);
        return normalized ? `tel:${normalized}` : "";
    });

    const whatsappHref = computed(() => {
        const raw = contactWhatsapp.value || contactPhone.value;
        const normalized = normalizePhoneForHref(raw).replace(/^\+/, "");
        if (!normalized) return "";

        const carLabel = [title.value, yearText.value, priceText.value]
            .filter(Boolean)
            .join(" - ");

        const text = encodeURIComponent(
            carLabel
                ? `Ciao, sono interessato a questa auto: ${carLabel}`
                : "Ciao, sono interessato a questa auto."
        );

        return `https://wa.me/${normalized}?text=${text}`;
    });

    const emailHref = computed(() => {
        const raw = String(contactEmail.value || "").trim();
        if (!raw) return "";

        const subject = encodeURIComponent(
            title.value ? `Richiesta informazioni - ${title.value}` : "Richiesta informazioni auto usata"
        );

        return `mailto:${raw}?subject=${subject}`;
    });

    const hasContactCtas = computed(() => {
        return Boolean(phoneHref.value || whatsappHref.value || emailHref.value);
    });

    const isExternalEntry = computed(() => {
        return String(route.query?.entry || "").trim().toLowerCase() === "external";
    });

    const loading = ref(true);
    const error = ref("");

    // Risposte grezze dal BE
    const carRaw = ref(null); // dettaglio
    const fotoRaw = ref([]); // endpoint foto

    const carExtraRaw = ref(null); // dettagli-attivi (equipaggiamenti + extra)

    // ✅ Per correlati
    const allCarsRaw = ref([]);

    /** =========================
     *  Normalizzazione “SitoA-like”
     *  ========================= */
    const carAuto = computed(() => {
        const c = carRaw.value;
        if (!c) return {};
        return c.auto && typeof c.auto === "object" ? c.auto : c;
    });

    const carDett = computed(() => {
        const c = carRaw.value;
        if (!c) return {};
        return c.dettagli && typeof c.dettagli === "object" ? c.dettagli : {};
    });

    // immagini stile SitoA: [{ foto_url }]
    const immaginiFromDetail = computed(() => {
        const c = carRaw.value;
        return Array.isArray(c?.immagini) ? c.immagini : [];
    });

    /** =========================
     *  Gallery state (5:4)
     *  ========================= */
    const activeIdx = ref(0);

    // deve esistere in /public
    const PLACEHOLDER = "/placeholder-car.png";

    /**
     * IMPORTANTISSIMO:
     * MEDIA_BASE deve essere la base DOVE VIVONO LE IMMAGINI (CDN/Supabase/uploads),
     * NON il backend API.
     */
    const MEDIA_BASE = computed(() =>
        String(settings.value.media_base_url || import.meta.env.VITE_MEDIA_BASE_URL || "")
            .trim()
            .replace(/\/$/, "")
    );

    function resolveUrl(u) {
        const s = String(u || "").trim();
        if (!s) return "";

        if (s.startsWith("http://") || s.startsWith("https://")) return s;
        if (s.startsWith("//")) return `https:${s}`;
        if (s.startsWith("data:")) return s;

        const path = s.startsWith("/") ? s : `/${s}`;
        if (MEDIA_BASE.value) return `${MEDIA_BASE.value}${path}`;
        return path;
    }

    function pickPhotoUrl(p) {
        if (!p) return "";
        if (typeof p === "string") return p;

        const candidates = [
            p.foto_url,
            p.media_url,
            p.url,
            p.src,
            p.image_url,
            p.cover_url,
            p.public_url,
            p.full_url,
            p.path,
            p.href,
            p.link,
            p.original,
            p.publicUrl,
            p.signedUrl,
            p.downloadUrl,
        ];

        for (const c of candidates) {
            if (!c) continue;
            if (typeof c === "string") return c;

            if (typeof c === "object") {
                const nested =
                    c.publicUrl ||
                    c.public_url ||
                    c.url ||
                    c.href ||
                    c.src ||
                    c.signedUrl ||
                    c.signed_url ||
                    c.downloadUrl ||
                    c.download_url ||
                    "";
                if (typeof nested === "string" && nested.trim()) return nested;
            }
        }
        return "";
    }

    const coverImg = computed(() => {
        const a = carAuto.value || {};
        return resolveUrl(a.cover_url || a.cover || "");
    });

    function normalizeFotoPayload(raw) {
        if (Array.isArray(raw)) return raw;
        if (!raw || typeof raw !== "object") return [];
        return raw.items || raw.data || raw.foto || raw.photos || raw.immagini || raw.results || [];
    }

    const photos = computed(() => {
        const fromFotoEndpoint = normalizeFotoPayload(fotoRaw.value);

        const base = [
            ...(Array.isArray(immaginiFromDetail.value) ? immaginiFromDetail.value : []),
            ...(Array.isArray(fromFotoEndpoint) ? fromFotoEndpoint : []),
        ];

        const list = base.map(pickPhotoUrl).map(resolveUrl).filter(Boolean);

        const seen = new Set();
        const out = [];
        for (const u of list) {
            if (seen.has(u)) continue;
            seen.add(u);
            out.push(u);
        }

        if (coverImg.value && !seen.has(coverImg.value)) out.unshift(coverImg.value);

        return out;
    });

    const mainImg = computed(() => photos.value[activeIdx.value] || coverImg.value || PLACEHOLDER);

    function onImgError(e) {
        if (e?.target) e.target.src = PLACEHOLDER;
    }

    function nextImg() {
        if (!photos.value.length) return;
        activeIdx.value = (activeIdx.value + 1) % photos.value.length;
    }
    function prevImg() {
        if (!photos.value.length) return;
        activeIdx.value = (activeIdx.value - 1 + photos.value.length) % photos.value.length;
    }

    /** =========================
     *  Swipe (mobile) su immagine principale
     *  ========================= */
    const swipe = ref({ startX: 0, startY: 0, dx: 0, dy: 0, active: false });

    const SWIPE_MIN_PX = 42;
    const SWIPE_RATIO = 1.15;

    function onTouchStart(e) {
        const t = e?.touches?.[0];
        if (!t) return;
        swipe.value.startX = t.clientX;
        swipe.value.startY = t.clientY;
        swipe.value.dx = 0;
        swipe.value.dy = 0;
        swipe.value.active = true;
    }

    function onTouchMove(e) {
        if (!swipe.value.active) return;
        const t = e?.touches?.[0];
        if (!t) return;

        swipe.value.dx = t.clientX - swipe.value.startX;
        swipe.value.dy = t.clientY - swipe.value.startY;

        const ax = Math.abs(swipe.value.dx);
        const ay = Math.abs(swipe.value.dy);
        if (ax > 8 && ax > ay * SWIPE_RATIO) {
            // @touchmove.prevent nel template blocca lo scroll “sporco”
        }
    }

    function onTouchEnd() {
        if (!swipe.value.active) return;
        swipe.value.active = false;

        const ax = Math.abs(swipe.value.dx);
        const ay = Math.abs(swipe.value.dy);

        if (ax < SWIPE_MIN_PX) return;
        if (ax <= ay * SWIPE_RATIO) return;
        if (photos.value.length <= 1) return;

        if (swipe.value.dx < 0) nextImg();
        else prevImg();
    }

    function onTouchCancel() {
        swipe.value.active = false;
    }

    /** =========================
     *  Testi principali
     *  ========================= */
    const title = computed(() => {
        const c = carAuto.value || {};
        const brand = (c.marca || c.brand || "").toString().trim();
        const model = (c.modello || c.model || c.allestimento || "").toString().trim();
        return [brand, model].filter(Boolean).join(" ");
    });

    const priceText = computed(() => {
        const c = carAuto.value || {};
        const p = c.prezzo_vendita;
        const n = typeof p === "number" ? p : parseInt(String(p || "").replace(/[^\d]/g, ""), 10);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} €`;
    });

    const kmText = computed(() => {
        const c = carAuto.value || {};
        const km = c.km_certificati;
        const n = typeof km === "number" ? km : parseInt(String(km || "").replace(/[^\d]/g, ""), 10);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} km`;
    });

    const yearText = computed(() => {
        const c = carAuto.value || {};
        const y = c.anno_immatricolazione;
        return y ? String(y) : null;
    });

    /** =========================
     *  ✅ DESCRIZIONE ROBUSTA
     *  ========================= */
    const descrizioneText = computed(() => {
        const a = carAuto.value || {};
        const d = carDett.value || {};
        const root = carRaw.value || {};

        const candidates = [
            a.descrizione,
            a.description,
            a.note,
            a.note_vendita,
            a.noteVendita,
            d.descrizione,
            d.description,
            d.note,
            root.descrizione,
            root.description,
            root.note,
        ];

        for (const c of candidates) {
            const s = String(c || "").trim();
            if (s) return s;
        }
        return "";
    });

    const techTab = ref("motore");

    function cleanSpecValue(v) {
        if (v === null || v === undefined) return "";
        const s = String(v).trim();
        if (!s) return "";
        if (["null", "undefined", "n.d.", "nd", "-", "--"].includes(s.toLowerCase())) return "";
        return s;
    }

    function firstSpecValue(...values) {
        for (const v of values) {
            const s = cleanSpecValue(v);
            if (s) return s;
        }
        return "";
    }

    const technicalSpecs = computed(() => {
        const a = carAuto.value || {};
        const d = carDett.value || {};
        const root = carRaw.value || {};

        const motore = [
            {
                key: "alimentazione",
                label: "Alimentazione",
                value: firstSpecValue(d.alimentazione, a.alimentazione, root.alimentazione),
            },
            {
                key: "cambio",
                label: "Cambio",
                value: firstSpecValue(d.cambio, a.cambio, root.cambio),
            },
            {
                key: "trazione",
                label: "Trazione",
                value: firstSpecValue(d.trazione, a.trazione, root.trazione),
            },
            {
                key: "cilindrata",
                label: "Cilindrata",
                value: firstSpecValue(d.cilindrata, a.cilindrata, root.cilindrata),
            },
            {
                key: "potenza",
                label: "Potenza",
                value: firstSpecValue(
                    d.potenza,
                    a.potenza,
                    root.potenza,
                    d.cv,
                    a.cv,
                    root.cv,
                    d.kw,
                    a.kw,
                    root.kw
                ),
            },
            {
                key: "classe_euro",
                label: "Classe Euro",
                value: firstSpecValue(d.classe_euro, a.classe_euro, root.classe_euro),
            },
            {
                key: "accelerazione",
                label: "Accelerazione 0-100",
                value: firstSpecValue(
                    d.accelerazione_0_100,
                    d.accelerazione,
                    a.accelerazione_0_100,
                    a.accelerazione,
                    root.accelerazione_0_100
                ),
            },
            {
                key: "velocita_massima",
                label: "Velocità massima",
                value: firstSpecValue(
                    d.velocita_massima,
                    a.velocita_massima,
                    root.velocita_massima
                ),
            },
        ].filter((x) => x.value);

        const dimensioni = [
            {
                key: "porte",
                label: "Numero porte",
                value: firstSpecValue(d.numero_porte, d.porte, a.numero_porte, a.porte, root.porte),
            },
            {
                key: "posti",
                label: "Numero posti",
                value: firstSpecValue(d.numero_posti, d.posti, a.numero_posti, a.posti, root.posti),
            },
            {
                key: "bagagliaio",
                label: "Bagagliaio",
                value: firstSpecValue(d.capacita_bagagliaio, d.bagagliaio, a.capacita_bagagliaio, a.bagagliaio),
            },
            {
                key: "lunghezza",
                label: "Lunghezza",
                value: firstSpecValue(d.lunghezza, a.lunghezza, root.lunghezza),
            },
            {
                key: "larghezza",
                label: "Larghezza",
                value: firstSpecValue(d.larghezza, a.larghezza, root.larghezza),
            },
            {
                key: "altezza",
                label: "Altezza",
                value: firstSpecValue(d.altezza, a.altezza, root.altezza),
            },
            {
                key: "passo",
                label: "Passo",
                value: firstSpecValue(d.passo, a.passo, root.passo),
            },
            {
                key: "peso",
                label: "Peso",
                value: firstSpecValue(d.peso, a.peso, root.peso, d.massa, a.massa, root.massa),
            },
            {
                key: "portata",
                label: "Portata utile",
                value: firstSpecValue(d.portata, a.portata, root.portata),
            },
            {
                key: "serbatoio",
                label: "Capacità serbatoio",
                value: firstSpecValue(d.capacita_serbatoio, a.capacita_serbatoio, root.capacita_serbatoio),
            },
            {
                key: "colore",
                label: "Colore",
                value: firstSpecValue(a.colore, d.colore, root.colore),
            },
        ].filter((x) => x.value);

        return { motore, dimensioni };
    });

    const activeTechnicalSpecs = computed(() => {
        return techTab.value === "dimensioni"
            ? technicalSpecs.value.dimensioni
            : technicalSpecs.value.motore;
    });

    const hasTechnicalSpecs = computed(() => {
        return (
            technicalSpecs.value.motore.length > 0 ||
            technicalSpecs.value.dimensioni.length > 0
        );
    });


    const equipmentSerieOpen = ref(false);
    const equipmentOptionalOpen = ref(false);

    const equipmentSerieGroupsOpen = ref({});
    const equipmentOptionalGroupsOpen = ref({});

    function normalizeEquipmentItems(raw) {
        if (!raw) return [];

        if (Array.isArray(raw)) {
            return raw
                .map((x) => {
                    if (typeof x === "string") {
                        const label = x.trim();
                        return label
                            ? {
                                label,
                                group: "Altri equipaggiamenti",
                            }
                            : null;
                    }

                    if (x && typeof x === "object") {
                        const label = String(
                            x.descrizione ||
                            x.nome ||
                            x.name ||
                            x.label ||
                            x.description ||
                            x.testo ||
                            x.value ||
                            ""
                        ).trim();

                        if (!label) return null;

                        const group = String(
                            x.macrogruppo ||
                            x.macro_gruppo ||
                            x.categoria ||
                            x.category ||
                            "Altri equipaggiamenti"
                        ).trim();

                        return {
                            label,
                            group: group || "Altri equipaggiamenti",
                        };
                    }

                    return null;
                })
                .filter(Boolean);
        }

        if (typeof raw === "string") {
            return raw
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/li>/gi, "\n")
                .replace(/<li[^>]*>/gi, "")
                .replace(/<[^>]+>/g, "")
                .split(/[\n•;|]+/)
                .map((x) => x.trim())
                .filter(Boolean)
                .map((label) => ({
                    label,
                    group: "Altri equipaggiamenti",
                }));
        }

        if (raw && typeof raw === "object") {
            return normalizeEquipmentItems(
                raw.items ||
                raw.data ||
                raw.lista ||
                raw.list ||
                raw.equipaggiamenti ||
                raw.dotazioni ||
                raw.accessori ||
                raw.optional ||
                raw.accessori_serie ||
                raw.accessori_optional ||
                raw.pacchetti ||
                []
            );
        }

        return [];
    }

    function dedupeEquipmentItems(list) {
        const seen = new Set();

        return list.filter((item) => {
            const key = `${String(item.group || "").trim().toLowerCase()}::${String(item.label || "")
                .trim()
                .toLowerCase()}`;

            if (!item?.label || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function groupEquipmentItems(items) {
        const map = new Map();

        for (const item of items) {
            const groupName =
                String(item.group || "Altri equipaggiamenti").trim() || "Altri equipaggiamenti";

            if (!map.has(groupName)) {
                map.set(groupName, []);
            }

            map.get(groupName).push(item.label);
        }

        return Array.from(map.entries())
            .map(([group, items]) => ({
                group,
                items,
            }))
            .sort((a, b) => a.group.localeCompare(b.group, "it"));
    }

    const equipmentSerieGroups = computed(() => {
        const root = carExtraRaw.value || {};

        const items = dedupeEquipmentItems([
            ...normalizeEquipmentItems(root.accessori_serie),
            ...normalizeEquipmentItems(root.equipaggiamenti),
        ]);

        return groupEquipmentItems(items);
    });

    const equipmentOptionalGroups = computed(() => {
        const root = carExtraRaw.value || {};

        const items = dedupeEquipmentItems([
            ...normalizeEquipmentItems(root.accessori_optional),
            ...normalizeEquipmentItems(root.pacchetti),
        ]);

        return groupEquipmentItems(items);
    });

    const hasEquipmentSerie = computed(() => equipmentSerieGroups.value.length > 0);
    const hasEquipmentOptional = computed(() => equipmentOptionalGroups.value.length > 0);

    const hasEquipment = computed(() => {
        return hasEquipmentSerie.value || hasEquipmentOptional.value;
    });

    function toggleEquipmentSerieGroup(groupName) {
        equipmentSerieGroupsOpen.value = {
            ...equipmentSerieGroupsOpen.value,
            [groupName]: !equipmentSerieGroupsOpen.value[groupName],
        };
    }

    function toggleEquipmentOptionalGroup(groupName) {
        equipmentOptionalGroupsOpen.value = {
            ...equipmentOptionalGroupsOpen.value,
            [groupName]: !equipmentOptionalGroupsOpen.value[groupName],
        };
    }

    function isEquipmentSerieGroupOpen(groupName) {
        return Boolean(equipmentSerieGroupsOpen.value[groupName]);
    }

    function isEquipmentOptionalGroupOpen(groupName) {
        return Boolean(equipmentOptionalGroupsOpen.value[groupName]);
    }
    /** =========================
     *  ✅ RELATED (Potrebbero interessarti anche)
     *  ========================= */
    function normalizeUsatoListPayload(raw) {
        if (Array.isArray(raw)) return raw;
        if (!raw || typeof raw !== "object") return [];

        const lvl1 =
            raw.items ||
            raw.results ||
            raw.cars ||
            raw.auto ||
            raw.usato ||
            raw.list ||
            raw.data ||
            [];

        if (Array.isArray(lvl1)) return lvl1;

        if (lvl1 && typeof lvl1 === "object") {
            const lvl2 =
                lvl1.items ||
                lvl1.results ||
                lvl1.data ||
                lvl1.cars ||
                lvl1.auto ||
                lvl1.usato ||
                lvl1.list ||
                [];
            if (Array.isArray(lvl2)) return lvl2;

            if (lvl2 && typeof lvl2 === "object") {
                const lvl3 = lvl2.items || lvl2.results || lvl2.data || [];
                if (Array.isArray(lvl3)) return lvl3;
            }
        }

        return [];
    }

    function unwrapAuto(x) {
        return x?.auto && typeof x.auto === "object" ? x.auto : x;
    }

    /** ✅ supporto id_auto */
    function getCarId(x) {
        const a = unwrapAuto(x);
        return String(
            a?.id ||
            a?.id_auto ||
            a?.uuid ||
            a?._id ||
            x?.id ||
            x?.id_auto ||
            x?.uuid ||
            x?._id ||
            ""
        ).trim();
    }

    function getCarTitle(x) {
        const a = unwrapAuto(x);
        const brand = String(a?.marca || a?.brand || "").trim();
        const model = String(a?.modello || a?.model || a?.allestimento || "").trim();
        return [brand, model].filter(Boolean).join(" ");
    }

    function getCarImg(x) {
        const a = unwrapAuto(x);
        const u =
            a?.cover_url ||
            a?.cover ||
            a?.foto_url ||
            a?.image_url ||
            a?.img ||
            a?.thumbnail ||
            "";
        return resolveUrl(u) || PLACEHOLDER;
    }

    function getPriceNumber(x) {
        const a = unwrapAuto(x);
        const p = a?.prezzo_vendita;
        const n = typeof p === "number" ? p : parseInt(String(p || "").replace(/[^\d]/g, ""), 10);
        return Number.isFinite(n) ? n : null;
    }

    function getCarPriceText(x) {
        const n = getPriceNumber(x);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} €`;
    }

    function getCarYear(x) {
        const a = unwrapAuto(x);
        const y = a?.anno_immatricolazione;
        return y ? String(y) : null;
    }

    function getCarKmText(x) {
        const a = unwrapAuto(x);
        const km = a?.km_certificati;
        const n = typeof km === "number" ? km : parseInt(String(km || "").replace(/[^\d]/g, ""), 10);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} km`;
    }

    function getCarSegmento(x) {
        const a = unwrapAuto(x);
        return String(a?.segmento || a?.body_type || a?.bodyType || "").trim();
    }

    function getCarBrand(x) {
        const a = unwrapAuto(x);
        return String(a?.marca || a?.brand || "").trim();
    }

    /**
     * ✅ Mostro la sezione quando la lista è arrivata
     */
    const showRelated = computed(
        () => !loading.value && Array.isArray(allCarsRaw.value) && allCarsRaw.value.length > 1
    );

    /**
     * ✅ ORDINE COERENTE:
     * - Priorità 1: stesso segmento (se disponibile)
     * - Priorità 2: prezzo più vicino
     * - Bonus: stessa marca (piccolo)
     * - Filtro anti-outlier: mai roba fuori scala (così X7 non finisce sotto un Juke)
     *
     * Obiettivo: 6 card.
     */
    const relatedCars = computed(() => {
        const list = Array.isArray(allCarsRaw.value) ? allCarsRaw.value : [];
        if (!list.length) return [];

        const currentId = idAuto.value;
        const current = carAuto.value || {};

        const currentPrice = getPriceNumber(current);
        const currentSeg = String(current.segmento || current.body_type || current.bodyType || "").trim();
        const currentBrand = String(current.marca || current.brand || "").trim();

        const base = list
            .filter((x) => {
                const id = getCarId(x);
                return id && id !== currentId;
            })
            .map((x) => ({
                raw: x,
                id: getCarId(x),
                price: getPriceNumber(x),
                seg: getCarSegmento(x),
                brand: getCarBrand(x),
            }))
            .filter((x) => x.id);

        if (!base.length) return [];

        // helper: filtra per ratio prezzo (anti-outlier) e ordina per score
        function pickWithPriceRatio(maxRatio, preferSeg) {
            if (!Number.isFinite(currentPrice) || !currentPrice || currentPrice <= 0) return [];

            const pool = base.filter((x) => Number.isFinite(x.price) && x.price > 0);

            let filtered = pool.filter((x) => {
                const ratio = Math.abs(x.price - currentPrice) / currentPrice;
                if (ratio > maxRatio) return false;
                if (preferSeg && currentSeg) return x.seg && x.seg === currentSeg;
                return true;
            });

            // score: più basso = più vicino
            filtered.sort((a, b) => {
                const ratioA = Math.abs(a.price - currentPrice) / currentPrice;
                const ratioB = Math.abs(b.price - currentPrice) / currentPrice;

                const segA = currentSeg && a.seg === currentSeg ? -0.08 : 0; // piccolo bonus
                const segB = currentSeg && b.seg === currentSeg ? -0.08 : 0;

                const brandA = currentBrand && a.brand === currentBrand ? -0.03 : 0;
                const brandB = currentBrand && b.brand === currentBrand ? -0.03 : 0;

                const scoreA = ratioA + segA + brandA;
                const scoreB = ratioB + segB + brandB;

                return scoreA - scoreB;
            });

            return filtered.map((x) => x.raw);
        }

        // 1) stesso segmento + stretto
        let out = [];
        const pushUnique = (arr) => {
            for (const x of arr) {
                const id = getCarId(x);
                if (!id) continue;
                if (id === currentId) continue;
                if (out.some((y) => getCarId(y) === id)) continue;
                out.push(x);
                if (out.length >= 6) break;
            }
        };

        if (Number.isFinite(currentPrice) && currentPrice > 0) {
            if (currentSeg) pushUnique(pickWithPriceRatio(0.35, true));
            if (out.length < 6 && currentSeg) pushUnique(pickWithPriceRatio(0.60, true));

            // 2) riempio per prezzo vicino (sempre con cap)
            if (out.length < 6) pushUnique(pickWithPriceRatio(0.35, false));
            if (out.length < 6) pushUnique(pickWithPriceRatio(0.60, false));
            if (out.length < 6) pushUnique(pickWithPriceRatio(1.00, false)); // ultimo livello, ma sempre “non fuori scala”
        } else {
            // se manca prezzo corrente: provo segmento, poi fallback “ordine lista” ma max 6
            if (currentSeg) {
                pushUnique(
                    base
                        .filter((x) => x.seg && x.seg === currentSeg)
                        .slice(0, 6)
                        .map((x) => x.raw)
                );
            }
            if (out.length < 6) {
                pushUnique(base.slice(0, 6).map((x) => x.raw));
            }
        }

        return out.slice(0, 6);
    });

    function openRelated(x) {
        const id = getCarId(x);
        if (!id) return;

        router.push({
            name: route.name,
            params: { ...route.params, id },
            query: isExternalEntry.value ? { entry: "external" } : {},
        });
    }

    function goBackToListing() {
        const query = isExternalEntry.value ? { entry: "external" } : {};

        const currentPath = String(route.path || "");
        const currentSlug = slug.value;

        if (currentPath.startsWith("/index/") && currentSlug) {
            router.push({
                path: `/index/${currentSlug}/usato-vetrina`,
                query,
            });
            return;
        }

        if (currentSlug && (currentPath === `/${currentSlug}` || currentPath.startsWith(`/${currentSlug}/`))) {
            router.push({
                path: `/${currentSlug}/usato-vetrina`,
                query,
            });
            return;
        }

        router.push({
            path: "/usato-vetrina",
            query,
        });
    }

    /** =========================
     *  Load (dedup + parallel)
     *  ========================= */
    let inFlight = null;
    let inFlightKey = null;

    async function load() {
        error.value = "";

        const s = slug.value;
        const id = idAuto.value;

        if (!s) {
            router.replace("/tenant-not-configured");
            return;
        }
        if (!id) {
            error.value = "Auto non trovata";
            return;
        }

        const key = `${s}::${id}`;
        if (inFlight && inFlightKey === key) return inFlight;

        loading.value = true;
        inFlightKey = key;

        inFlight = (async () => {
            try {
                activeIdx.value = 0;

                const [c, extra, f, list] = await Promise.all([
                    fetchUsatoDetail(s, id),
                    fetchUsatoDetailAttivi(id).catch(() => null),
                    fetchUsatoFoto(s, id),
                    fetchUsatoList(s).catch(() => null),
                ]);

                carRaw.value = c || null;
                carExtraRaw.value = extra || null;

                console.log("DETAIL RESPONSE", c);
                console.log("DETAIL EXTRA RESPONSE", extra);
                console.log("EXTRA equipaggiamenti", extra?.equipaggiamenti);
                console.log("EXTRA accessori_serie", extra?.accessori_serie);

                fotoRaw.value = f ?? [];

                const normalized = normalizeUsatoListPayload(list);
                allCarsRaw.value = Array.isArray(normalized) ? normalized : [];

            } catch (e) {
                error.value = "Errore nel caricamento dettaglio";
                carRaw.value = null;
                carExtraRaw.value = null;
                fotoRaw.value = [];
                allCarsRaw.value = [];

            } finally {
                loading.value = false;
            }
        })();

        try {
            return await inFlight;
        } finally {
            inFlight = null;
            inFlightKey = null;
        }
    }

    onMounted(load);
    watch([slug, idAuto], load);

    watch(photos, (arr) => {
        if (!arr.length) {
            activeIdx.value = 0;
            return;
        }
        if (activeIdx.value > arr.length - 1) activeIdx.value = 0;
    });
</script>

<template>
<section
  class="page"
  :style="{
    fontFamily: settings.font_family || 'inherit',
    '--tenant-accent': settings.tertiary_color || settings.secondary_color || '#111',
  }"
>
 

  <div class="container">
      <button class="back" type="button" @click="goBackToListing()">← Indietro</button>

      <div v-if="loading" class="skeleton">
        <div class="sk-layout">
          <div class="sk-main">
            <div class="sk-frame"></div>
            <div class="sk-line w60"></div>
            <div class="sk-line w40"></div>
            <div class="sk-line w30"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="state">{{ error }}</div>

      <div v-else class="layout" :class="{ 'layout--stickyBar': hasContactCtas }">
        <div class="main">
          <!-- Titolo: su mobile sopra le immagini, su desktop in colonna destra -->
          <header class="head">
            <div class="headMain">
              <h1 class="h1">{{ title }}</h1>
              <div class="sub">
                <span v-if="yearText">{{ yearText }}</span>
                <span v-if="yearText && kmText" class="sep">·</span>
                <span v-if="kmText">{{ kmText }}</span>
              </div>
              <div v-if="priceText" class="price">{{ priceText }}</div>
            </div>
            <div v-if="hasContactCtas" class="headActions">
              <a
                v-if="phoneHref"
                :href="phoneHref"
                class="headCtaIcon"
                aria-label="Chiama ora"
                title="Chiama ora"
              >
                <i class="fas fa-phone" aria-hidden="true"></i>
              </a>
              <a
                v-if="whatsappHref"
                :href="whatsappHref"
                class="headCtaIcon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <i class="fab fa-whatsapp" aria-hidden="true"></i>
              </a>
              <a
                v-if="emailHref"
                :href="emailHref"
                class="headCtaIcon"
                aria-label="Email"
                title="Email"
              >
                <i class="fas fa-envelope" aria-hidden="true"></i>
              </a>
            </div>
          </header>

          <!-- COLONNA SINISTRA: FOTO -->
          <div class="gallery">
            <div
              class="frame"
              @touchstart="onTouchStart"
              @touchmove.prevent="onTouchMove"
              @touchend="onTouchEnd"
              @touchcancel="onTouchCancel"
            >
              <img
                :src="mainImg"
                alt="Foto auto"
                class="frame-img"
                loading="eager"
                decoding="async"
                fetchpriority="high"
                @error="onImgError"
              />

              <button
                v-if="photos.length > 1"
                class="nav-arrow left"
                type="button"
                @click="prevImg"
                aria-label="Foto precedente"
              >
                ‹
              </button>

              <button
                v-if="photos.length > 1"
                class="nav-arrow right"
                type="button"
                @click="nextImg"
                aria-label="Foto successiva"
              >
                ›
              </button>
            </div>

            <div v-if="photos.length > 1" class="thumbs" aria-label="Galleria immagini">
              <button
                v-for="(u, i) in photos"
                :key="`${u}-${i}`"
                class="thumb"
                :class="{ active: i === activeIdx }"
                type="button"
                @click="activeIdx = i"
                :aria-label="`Apri foto ${i + 1}`"
              >
                <img :src="u" alt="" loading="lazy" decoding="async" @error="onImgError" />
              </button>
            </div>
                          <section v-if="hasEquipment" class="equipmentGroup">
 <section v-if="hasEquipment" class="equipmentGroup">
  <section v-if="hasEquipmentSerie" class="equipment">
    <button
      type="button"
      class="equipmentToggle"
      :class="{ open: equipmentSerieOpen }"
      @click="equipmentSerieOpen = !equipmentSerieOpen"
      :aria-expanded="equipmentSerieOpen ? 'true' : 'false'"
    >
      <span>Equipaggiamenti di serie</span>
      <span class="equipmentChevron" aria-hidden="true">
        {{ equipmentSerieOpen ? "−" : "+" }}
      </span>
    </button>

    <div v-if="equipmentSerieOpen" class="equipmentPanel">
      <div
        v-for="group in equipmentSerieGroups"
        :key="`serie-group-${group.group}`"
        class="equipmentSubgroup"
      >
        <button
          type="button"
          class="equipmentSubToggle"
          :class="{ open: isEquipmentSerieGroupOpen(group.group) }"
          @click="toggleEquipmentSerieGroup(group.group)"
          :aria-expanded="isEquipmentSerieGroupOpen(group.group) ? 'true' : 'false'"
        >
          <span>{{ group.group }}</span>
          <span class="equipmentChevron" aria-hidden="true">
            {{ isEquipmentSerieGroupOpen(group.group) ? "−" : "+" }}
          </span>
        </button>

        <ul
          v-if="isEquipmentSerieGroupOpen(group.group)"
          class="equipmentList"
        >
          <li
            v-for="(item, index) in group.items"
            :key="`serie-${group.group}-${item}-${index}`"
            class="equipmentItem"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section v-if="hasEquipmentOptional" class="equipment">
    <button
      type="button"
      class="equipmentToggle"
      :class="{ open: equipmentOptionalOpen }"
      @click="equipmentOptionalOpen = !equipmentOptionalOpen"
      :aria-expanded="equipmentOptionalOpen ? 'true' : 'false'"
    >
      <span>Optional aggiuntivi</span>
      <span class="equipmentChevron" aria-hidden="true">
        {{ equipmentOptionalOpen ? "−" : "+" }}
      </span>
    </button>

    <div v-if="equipmentOptionalOpen" class="equipmentPanel">
      <div
        v-for="group in equipmentOptionalGroups"
        :key="`optional-group-${group.group}`"
        class="equipmentSubgroup"
      >
        <button
          type="button"
          class="equipmentSubToggle"
          :class="{ open: isEquipmentOptionalGroupOpen(group.group) }"
          @click="toggleEquipmentOptionalGroup(group.group)"
          :aria-expanded="isEquipmentOptionalGroupOpen(group.group) ? 'true' : 'false'"
        >
          <span>{{ group.group }}</span>
          <span class="equipmentChevron" aria-hidden="true">
            {{ isEquipmentOptionalGroupOpen(group.group) ? "−" : "+" }}
          </span>
        </button>

        <ul
          v-if="isEquipmentOptionalGroupOpen(group.group)"
          class="equipmentList"
        >
          <li
            v-for="(item, index) in group.items"
            :key="`optional-${group.group}-${item}-${index}`"
            class="equipmentItem"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</section>

  <section v-if="hasEquipmentOptional" class="equipment">
    <button
      type="button"
      class="equipmentToggle"
      :class="{ open: equipmentOptionalOpen }"
      @click="equipmentOptionalOpen = !equipmentOptionalOpen"
      :aria-expanded="equipmentOptionalOpen ? 'true' : 'false'"
    >
      <span>Optional aggiuntivi</span>
      <span class="equipmentChevron" aria-hidden="true">
        {{ equipmentOptionalOpen ? "−" : "+" }}
      </span>
    </button>

    <div v-if="equipmentOptionalOpen" class="equipmentPanel">
      <ul class="equipmentList">
        <li
          v-for="(item, index) in equipmentOptionalList"
          :key="`optional-${item}-${index}`"
          class="equipmentItem"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</section>
          </div>

          <!-- COLONNA DESTRA: DATI -->
          <div class="details">
            <section v-if="hasTechnicalSpecs" class="detailTech">
              <div class="detailTechTabs">
                <button
                  type="button"
                  class="detailTechTab"
                  :class="{ active: techTab === 'motore' }"
                  @click="techTab = 'motore'"
                >
                  Motore e prestazioni
                </button>

                <button
                  type="button"
                  class="detailTechTab"
                  :class="{ active: techTab === 'dimensioni' }"
                  @click="techTab = 'dimensioni'"
                >
                  Dimensioni e peso
                </button>
              </div>

              <div class="detailTechTable">
                <div
                  v-for="row in activeTechnicalSpecs"
                  :key="row.key"
                  class="detailTechRow"
                >
                  <span class="detailTechKey">{{ row.label }}</span>
                  <span class="detailTechValue">{{ row.value }}</span>
                </div>
              </div>
            </section>

            <div v-if="descrizioneText" class="desc">
              <h2 class="h2">Descrizione</h2>
              <p class="p">{{ descrizioneText }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra contatti sticky in basso (solo mobile) -->
      <div v-if="hasContactCtas" class="contactBar" aria-label="Contatti">
        <a
          v-if="phoneHref"
          :href="phoneHref"
          class="contactBar__btn contactBar__btn--phone"
          aria-label="Chiama"
          title="Chiama"
        >
          <i class="fas fa-phone" aria-hidden="true"></i>
          <span>Chiama</span>
        </a>
        <a
          v-if="whatsappHref"
          :href="whatsappHref"
          class="contactBar__btn contactBar__btn--wa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <i class="fab fa-whatsapp" aria-hidden="true"></i>
          <span>WhatsApp</span>
        </a>
        <a
          v-if="emailHref"
          :href="emailHref"
          class="contactBar__btn contactBar__btn--email"
          aria-label="Email"
          title="Email"
        >
          <i class="fas fa-envelope" aria-hidden="true"></i>
          <span>Email</span>
        </a>
      </div>

      <!-- ✅ SOTTO A TUTTO (prima del footer) -->
      <section v-if="showRelated" class="related">
        <h2 class="relatedTitle">Potrebbero interessarti anche</h2>

        <div v-if="relatedCars.length" class="relatedGrid">
          <button
            v-for="x in relatedCars"
            :key="getCarId(x)"
            type="button"
            class="relatedCard"
            @click="openRelated(x)"
          >
           <div class="relatedMedia">
  <img
    :src="getCarImg(x)"
    alt=""
    loading="lazy"
    decoding="async"
    @error="onImgError"
  />

  <div
    v-if="getCarPriceText(x)"
    class="relatedPriceTag"
  >
    {{ getCarPriceText(x) }}
  </div>
</div>


            <div class="relatedBody">
              <div class="relatedName">{{ getCarTitle(x) || "Auto" }}</div>

              <div class="relatedMetaLine">
                <span v-if="getCarYear(x)">{{ getCarYear(x) }}</span>
                <span v-if="getCarYear(x) && getCarKmText(x)" class="dot">·</span>
                <span v-if="getCarKmText(x)">{{ getCarKmText(x) }}</span>
              </div>

              <div class="relatedCta">Dettagli →</div>
            </div>
          </button>
        </div>

        <div v-else class="relatedEmpty">Nessun suggerimento disponibile.</div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.page {
  padding: clamp(1rem, 3vw, 2rem);
}
.container {
  max-width: 96rem;
  margin: 0 auto;
}

/* back */
.back {
  border: 0;
  background: transparent;
  padding: 0;
  font-weight: 800;
  cursor: pointer;
}
.state {
  margin-top: 0.9rem;
}

/* layout esterno: una colonna */
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2.2vw, 2rem);
  margin-top: 1rem;
}

/* main: 1 colonna mobile, 2 colonne desktop */
.main {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2.2vw, 2rem);
  align-items: start;
}

@media (min-width: 60rem) {
  .main {
    grid-template-columns: minmax(0, 42rem) minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }
  .head {
    grid-column: 2;
    grid-row: 1;
  }
  .gallery {
    grid-column: 1;
    grid-row: 1 / -1;
    max-width: 42rem;
  }
  .details {
    grid-column: 2;
    grid-row: 2;
  }
}

/* gallery 5:4 */
.frame {
  width: 100%;
  aspect-ratio: 5 / 4;
  background: #f2f2f2;
  overflow: hidden;
  position: relative;

  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.frame-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  opacity: 1;
  filter: none;
  transform: none;
  mix-blend-mode: normal;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: clamp(1.8rem, 4vw, 3rem);
  width: clamp(2rem, 4vw, 3rem);
  height: clamp(2.6rem, 5vw, 3.4rem);
  border: none;
  cursor: pointer;
  transition: 0.25s;
}
.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.65);
}
.nav-arrow.left {
  left: 1vw;
}
.nav-arrow.right {
  right: 1vw;
}

.thumbs {
  margin-top: 0.75rem;
  display: flex;
  overflow: auto;
  padding-bottom: 0.25rem;

  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  gap: 0.6rem;
  padding: 0.25rem 0.25rem 0.5rem;
  box-sizing: border-box;
}
.thumb {
  flex: 0 0 auto;
  width: 5.25rem;
  aspect-ratio: 5 / 4;
  border: 0.06rem solid rgba(0, 0, 0, 0.14);
  padding: 0;
  background: #fff;
  cursor: pointer;
  position: relative;
  border-radius: 0.4rem;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.85;
  transition: 0.2s;
}

.thumb.active {
  border-color: rgba(0, 0, 0, 0.35);
}

.thumb.active::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 0.22rem solid var(--tenant-accent, #111);
}

.equipmentGroup {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.equipment {
  margin-top: 0;
  background: #fff;
}

.equipmentToggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 0.95rem 1rem;
  border: 0.06rem solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: #111;
  cursor: pointer;

  font-size: 1rem;
  font-weight: 900;
  text-align: left;
}

.equipmentToggle.open {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.equipmentChevron {
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 900;
  color: var(--tenant-accent, #111);
}

.equipmentPanel {
  border-left: 0.06rem solid rgba(0, 0, 0, 0.1);
  border-right: 0.06rem solid rgba(0, 0, 0, 0.1);
  border-bottom: 0.06rem solid rgba(0, 0, 0, 0.1);
  background: #fff;
}

.equipmentList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.equipmentItem {
  padding: 0.8rem 1rem;
  border-top: 0.06rem solid rgba(0, 0, 0, 0.08);
  line-height: 1.4;
}

.equipmentSubgroup {
  border-top: 0.06rem solid rgba(0, 0, 0, 0.08);
}

.equipmentSubgroup:first-child {
  border-top: 0;
}

.equipmentSubToggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 0.9rem 1rem;
  border: 0;
  background: #fff;
  color: #111;
  cursor: pointer;

  font-size: 0.98rem;
  font-weight: 900;
  text-align: left;
}

.equipmentSubToggle.open {
  background: #f5f5f5;
}

.detailTech {
  margin-top: 1rem;
  border: 0;
  border-radius: 0;
  background: #fff;
  overflow: hidden;
}

.detailTechTabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0 0 0.9rem 0;
  border-bottom: 0.06rem solid rgba(0, 0, 0, 0.08);
}

.detailTechTab {
  min-width: 0;
  border: 0.06rem solid rgba(0, 0, 0, 0.08);
  background: #f3f3f3;
  color: #222;
  padding: 0.85rem 1rem;
  font-weight: 800;
  font-size: 0.96rem;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.detailTechTab.active {
  background: var(--tenant-accent);
  color: #fff;
  border-color: var(--tenant-accent);
  box-shadow: inset 0 -0.18rem 0 0 rgba(0,0,0,0.2);
}

.detailTechTable {
  padding: 0.75rem;
}

.detailTechRow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
  padding: 0.7rem 0.75rem;
  border-top: 0.06rem solid rgba(0, 0, 0, 0.08);
}

.detailTechKey {
  font-weight: 700;
  opacity: 0.8;
}

.detailTechValue {
  text-align: right;
  font-weight: 400;
  opacity: 0.9;
}

@media (max-width: 42rem) {
  .detailTechRow {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .detailTechValue {
    text-align: left;
  }
}

/* head */
.head {
  margin-top: 0.2rem;
}
.h1 {
  margin: 0;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  line-height: 1.1;
}
.sub {
  margin-top: 0.4rem;
  opacity: 0.75;
  font-weight: 650;
}
.sep {
  margin: 0 0.35rem;
  opacity: 0.6;
}
.price {
  margin-top: 0.7rem;
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
  font-weight: 900;
}

.head {
  margin-top: 0.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.headMain {
  min-width: 0;
}

.headActions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.headCtaIcon {
  width: 3.6rem;
  height: 3.6rem;
  flex: 0 0 3.6rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(180deg, #f7f7f7 0%, #ececec 100%);
  color: var(--tenant-accent, #111);
  text-decoration: none;

  border: 0.06rem solid rgba(0, 0, 0, 0.08);
  border-radius: 0.9rem;
  box-shadow: 0 0.35rem 0.85rem rgba(0, 0, 0, 0.08);
  box-sizing: border-box;

  transition: transform 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.headCtaIcon i {
  font-size: 1.5rem;
  line-height: 1;
}

.headCtaIcon:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-0.04rem);
}

.headCtaIcon:active {
  transform: translateY(0);
}

/* Barra contatti sticky in basso: solo mobile */
.contactBar {
  display: none;
}

@media (max-width: 63.99rem) {
  .headActions {
    display: none;
  }

  .contactBar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 5000;
    padding: 0.6rem 0.75rem;
    padding-bottom: max(0.6rem, env(safe-area-inset-bottom));
    gap: 0.75rem;
    background: #fff;
    border-top: 0.06rem solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 -0.25rem 1rem rgba(0, 0, 0, 0.08);
  }

  .contactBar__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    border: none;
    border-radius: 0.75rem;
    min-height: 2.75rem;
    transition: opacity 0.2s, transform 0.15s;
  }

  .contactBar__btn:active {
    transform: scale(0.98);
  }

  .contactBar__btn--phone {
    background: var(--tenant-accent, #1a1a1a);
  }

  .contactBar__btn--wa {
    background: #25d366;
  }

  .contactBar__btn--email {
    background: #555;
  }

  .layout--stickyBar {
    padding-bottom: 4.5rem;
  }
}

@media (min-width: 64rem) {
  .head {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .headActions {
    justify-content: flex-end;
  }
}

/* specs */


/* desc */
.desc {
  margin-top: 1.2rem;
}
.h2 {
  margin: 0 0 0.6rem;
  font-size: 1.05rem;
  font-weight: 900;
}
.p {
  margin: 0;
  opacity: 0.85;
  line-height: 1.45;
}

/* skeleton */
.skeleton {
  margin-top: 1rem;
}
.sk-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2.2vw, 2rem);
}
.sk-frame {
  width: 100%;
  aspect-ratio: 5 / 4;
  background: #f1f1f1;
}
.sk-line {
  height: 0.9rem;
  background: #f1f1f1;
  margin-top: 0.8rem;
}
.sk-line.w60 {
  width: 60%;
}
.sk-line.w40 {
  width: 40%;
}
.sk-line.w30 {
  width: 30%;
}

/* ✅ evita overflow orizzontale sull’intera pagina */
.page,
.container,
.layout,
.main,
.gallery {
  max-width: 100%;
  overflow-x: hidden;
}

/* ✅ su grid/flex: permette il restringimento reale (fix overflow con grid) */
.main,
.gallery,
.details {
  min-width: 0;
}

/* =========================
   ✅ RELATED (stile "vendita" + più piccole, fino a 6)
   ========================= */
.related {
  margin-top: clamp(1.5rem, 3vw, 2.25rem);
}
.relatedTitle {
  margin: 0 0 0.9rem;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 900;
}

.relatedGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

@media (min-width: 40rem) {
  .relatedGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .relatedGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 80rem) {
  .relatedGrid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.relatedCard {
  border: 0.06rem solid rgba(0, 0, 0, 0.14);   /* ✅ bordo card */
  background: #fff;                            /* ✅ fondo bianco */
  text-align: left;
  cursor: pointer;
  padding: 0;                                  /* media attaccata al bordo */
  overflow: hidden;                            /* ✅ il bordo “chiude” tutto */
  display: flex;
  flex-direction: column;
}

.relatedMedia {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 4;
  background: #f2f2f2;
  overflow: hidden;
  border-radius: 0;
}

.relatedMedia img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.relatedPriceTag {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;

  background: #5f5f5f;   /* stesso grigio vendita */
  color: #fff;

  font-weight: 900;
  font-size: 1rem;

  padding: 0.35rem 0.6rem;
  border-radius: 0;      /* 90° */
}

.relatedBody {
  padding: 0.75rem 0.85rem 0.9rem; /* ✅ respiro: top / sides / bottom */
}

.relatedName {
  font-weight: 900;
  line-height: 1.15;
  font-size: 0.98rem;
  margin: 0;  
}

.relatedMetaLine {
  margin-top: 0.3rem;
  opacity: 0.8;
  font-weight: 750;
  font-size: 0.9rem;
}

.dot {
  margin: 0 0.35rem;
  opacity: 0.7;
}

.relatedCta {
  margin-top: 0.45rem;
  font-weight: 900;
  font-size: 0.95rem;
}

.relatedEmpty {
  opacity: 0.75;
  font-weight: 700;
  padding: 0.5rem 0;
}
</style>
