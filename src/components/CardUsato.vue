<template>
  <router-link
    class="card"
    :style="{ fontFamily: settings.font_family }"
    :to="`/index/${slug}/usato/${item.id_auto}`"
  >
    <!-- IMMAGINE 5:4 -->
    <div class="image-wrapper">
<img
  :src="buildImgSrc(item.cover_url, 800)"
  @error="onImgError"
  alt="Foto auto"
  class="main-img"
  width="800"
  height="640"
  :loading="priority ? 'eager' : 'lazy'"
  :fetchpriority="priority ? 'high' : 'auto'"
  decoding="async"
/>

      <!-- PREZZO (badge sull’immagine) -->
      <div class="price-badge">
        {{ (item.prezzo_vendita ?? 0).toLocaleString("it-IT") }} €
      </div>
    </div>

    <!-- INFO -->
    <div class="info">
      <h3 class="title">{{ item.marca }} {{ item.allestimento }}</h3>

      <div class="meta">
        <span>{{ item.anno_immatricolazione }}</span>
        <span class="sep">·</span>
        <span>{{ (item.km_certificati ?? 0).toLocaleString("it-IT") }} km</span>
      </div>

      <div class="cta-inline">Dettagli →</div>
    </div>
  </router-link>
</template>

<script setup>
    /**
     * ⚠️ COMPONENTE CRITICO — CARD USATO
     * - Rapporto immagini 5:4 OBBLIGATORIO
     * - Non fare fetch qui dentro
     * - Layout stabile (no CLS)
     */
    const props = defineProps({
        slug: { type: String, required: true },
        item: { type: Object, required: true },
        settings: { type: Object, required: true },
        priority: { type: Boolean, default: false },
    });

    // ✅ placeholder robusto anche se l'app non è servita da "/"
    const PLACEHOLDER_IMG = `${import.meta.env.BASE_URL}placeholder-car.png`;

    /**
     * Ritorna una src "sicura" senza rompere:
     * 1) se cover_url manca => placeholder
     * 2) se cover_url è supabase public => tenta transformer render/image
     * 3) altrimenti usa url originale
     */
    function buildImgSrc(url, width = 800) {
        const raw = (url || "").toString().trim();
        if (!raw) return PLACEHOLDER_IMG;

        const transformed = optimizeSupabase(raw, width);
        return transformed || raw || PLACEHOLDER_IMG;
    }

    function optimizeSupabase(url, width = 800) {
        if (!url) return "";

        try {
            const u = new URL(url);

            // ✅ se NON è supabase storage public, non toccare
            if (!u.pathname.includes("/storage/v1/object/public/")) return url;

            // ✅ se è già "render/image", non ritrasformare
            if (u.pathname.includes("/storage/v1/render/image/public/")) return url;

            // ✅ prova transformer (se supportato)
            u.pathname = u.pathname.replace(
                "/storage/v1/object/public/",
                "/storage/v1/render/image/public/",
            );

            u.searchParams.set("width", String(width));
            u.searchParams.set("quality", "70");
            u.searchParams.set("format", "webp");

            return u.toString();
        } catch {
            return url;
        }
    }

    function onImgError(e) {
        const img = e.target;

        // ✅ step 1: se stiamo usando URL "render/image", riprova con l'originale (object/public)
        if (img?.src && img.src.includes("/storage/v1/render/image/public/") && props.item?.cover_url) {
            const raw = String(props.item.cover_url).trim();
            if (raw && raw.includes("/storage/v1/object/public/")) {
                img.src = raw; // retry senza transformer
                return;
            }
        }

        // ✅ step 2: placeholder (una sola volta)
        if (img.dataset.fallbackApplied === "1") return;
        img.dataset.fallbackApplied = "1";
        img.onerror = null;
        img.src = PLACEHOLDER_IMG;
    }
</script>

<style scoped="">
/* ======================================================
CARD USATO — BLINDATA (design system compliant)
====================================================== */

.card {
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  text-decoration: none;
  color: inherit;

  border-radius: 0;
  border: 0.06rem solid rgba(0, 0, 0, 0.1);
  box-shadow: none;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}

.card:hover {
  transform: translateY(-0.12rem);
  border-color: rgba(0, 0, 0, 0.22);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 4;
  overflow: hidden;
  background: #f2f2f2;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Badge prezzo sull’immagine */
.price-badge {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;

  padding: 0.45rem 0.6rem;
  font-weight: 800;
  font-size: 1rem;
  line-height: 1;

  background: rgba(0, 0, 0, 0.65);
  color: #fff;
}

.info {
  padding: 0.9rem 0.95rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.title {
  font-size: clamp(1.05rem, 1.35vw, 1.2rem);
  font-weight: 750;
  line-height: 1.18;
  margin: 0;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  font-size: 0.92rem;
  opacity: 0.72;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sep {
  opacity: 0.5;
}

/* CTA leggera (non barra) */
.cta-inline {
  margin-top: 0.35rem;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--tenant-accent, #111);
}

/* Mobile tap feedback */
@media (max-width: 48rem) {
  .card:active {
    transform: scale(0.99);
  }
}
</style>
