<!-- src/pages/UsatoDetailPage.vue -->
<script setup>
    import { computed, onMounted, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import { fetchUsatoDetail, fetchUsatoFoto } from "@/api/usatoPublic";

    const route = useRoute();
    const router = useRouter();
    const tenant = useTenantStore();

    const settings = computed(() => tenant.settings || {});
    const slug = computed(() =>
        (route.params.slug || tenant.slug || "").toString().trim(),
    );
    const idAuto = computed(() => String(route.params.id || "").trim());

    const loading = ref(true);
    const error = ref("");

    // Risposte grezze dal BE
    const carRaw = ref(null); // dettaglio
    const fotoRaw = ref([]); // endpoint foto

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
        String(
            settings.value.media_base_url || import.meta.env.VITE_MEDIA_BASE_URL || "",
        )
            .trim()
            .replace(/\/$/, ""),
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
        return (
            raw.items ||
            raw.data ||
            raw.foto ||
            raw.photos ||
            raw.immagini ||
            raw.results ||
            []
        );
    }

    const photos = computed(() => {
        const fromFotoEndpoint = normalizeFotoPayload(fotoRaw.value);

        const base = [
            ...(Array.isArray(immaginiFromDetail.value)
                ? immaginiFromDetail.value
                : []),
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

    const mainImg = computed(() => {
        return photos.value[activeIdx.value] || coverImg.value || PLACEHOLDER;
    });

    function onImgError(e) {
        e.target.src = PLACEHOLDER;
    }

    function nextImg() {
        if (!photos.value.length) return;
        activeIdx.value = (activeIdx.value + 1) % photos.value.length;
    }
    function prevImg() {
        if (!photos.value.length) return;
        activeIdx.value =
            (activeIdx.value - 1 + photos.value.length) % photos.value.length;
    }

    /** =========================
     *  Swipe (mobile) su immagine principale
     *  ========================= */
    const swipe = ref({
        startX: 0,
        startY: 0,
        dx: 0,
        dy: 0,
        active: false,
    });

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
        const model = (c.modello || c.model || c.allestimento || "")
            .toString()
            .trim();
        return [brand, model].filter(Boolean).join(" ");
    });

    const priceText = computed(() => {
        const c = carAuto.value || {};
        const p = c.prezzo_vendita;
        const n =
            typeof p === "number"
                ? p
                : parseInt(String(p || "").replace(/[^\d]/g, ""), 10);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} €`;
    });

    const kmText = computed(() => {
        const c = carAuto.value || {};
        const km = c.km_certificati;
        const n =
            typeof km === "number"
                ? km
                : parseInt(String(km || "").replace(/[^\d]/g, ""), 10);
        if (!Number.isFinite(n)) return null;
        return `${n.toLocaleString("it-IT")} km`;
    });

    const yearText = computed(() => {
        const c = carAuto.value || {};
        const y = c.anno_immatricolazione;
        return y ? String(y) : null;
    });

    /** =========================
     *  ✅ DESCRIZIONE ROBUSTA (non dipende dallo slug, dipende dai dati)
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

                const [c, f] = await Promise.all([
                    fetchUsatoDetail(s, id),
                    fetchUsatoFoto(s, id),
                ]);

                carRaw.value = c || null;
                fotoRaw.value = f ?? [];
            } catch (e) {
                error.value = "Errore nel caricamento dettaglio";
                carRaw.value = null;
                fotoRaw.value = [];
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
      '--tenant-accent': settings.secondary_color || '#111',
    }"
  >
    <div class="container">
      <button class="back" type="button" @click="$router.back()">
        ← Indietro
      </button>

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

      <div v-else class="layout">
        <div class="main">
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

            <div
              v-if="photos.length > 1"
              class="thumbs"
              aria-label="Galleria immagini"
            >
              <button
                v-for="(u, i) in photos"
                :key="`${u}-${i}`"
                class="thumb"
                :class="{ active: i === activeIdx }"
                type="button"
                @click="activeIdx = i"
                :aria-label="`Apri foto ${i + 1}`"
              >
                <img
                  :src="u"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  @error="onImgError"
                />
              </button>
            </div>
          </div>

          <!-- COLONNA DESTRA: DATI -->
          <div class="details">
            <header class="head">
              <h1 class="h1">{{ title }}</h1>

              <div class="sub">
                <span v-if="yearText">{{ yearText }}</span>
                <span v-if="yearText && kmText" class="sep">·</span>
                <span v-if="kmText">{{ kmText }}</span>
              </div>

              <div v-if="priceText" class="price">{{ priceText }}</div>
            </header>

            <div class="specs">
              <div class="spec" v-if="carDett?.alimentazione">
                <span class="k">Alimentazione</span
                ><span class="v">{{ carDett.alimentazione }}</span>
              </div>
              <div class="spec" v-if="carDett?.cambio">
                <span class="k">Cambio</span
                ><span class="v">{{ carDett.cambio }}</span>
              </div>
              <div class="spec" v-if="carDett?.trazione">
                <span class="k">Trazione</span
                ><span class="v">{{ carDett.trazione }}</span>
              </div>
              <div class="spec" v-if="carDett?.classe_euro">
                <span class="k">Euro</span
                ><span class="v">{{ carDett.classe_euro }}</span>
              </div>
              <div class="spec" v-if="carDett?.potenza">
                <span class="k">Potenza</span
                ><span class="v">{{ carDett.potenza }}</span>
              </div>
              <div class="spec" v-if="carDett?.cilindrata">
                <span class="k">Cilindrata</span
                ><span class="v">{{ carDett.cilindrata }}</span>
              </div>
              <div class="spec" v-if="carAuto?.colore">
                <span class="k">Colore</span
                ><span class="v">{{ carAuto.colore }}</span>
              </div>
            </div>

            <!-- ✅ prima era carAuto?.descrizione -->
            <div v-if="descrizioneText" class="desc">
              <h2 class="h2">Descrizione</h2>
              <p class="p">{{ descrizioneText }}</p>
            </div>
          </div>
        </div>
      </div>
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
  }
  .gallery {
    max-width: 42rem;
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
  gap: 0.5rem;
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

/* specs */
.specs {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem 1rem;
}
.spec {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 0.06rem solid rgba(0, 0, 0, 0.1);
}
.k {
  opacity: 0.7;
  font-weight: 750;
}
.v {
  font-weight: 750;
}

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
</style>
