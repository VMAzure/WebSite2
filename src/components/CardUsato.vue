<template>
  <router-link
    class="card"
    :style="{ fontFamily: settings?.font_family || 'inherit' }"
    :to="`/index/${slug}/usato/${item.id_auto}`"
  >
    <!-- IMMAGINE 5:4 -->
    <div class="image-wrapper">
      <img
        :src="imgSrc"
        :srcset="imgSrcset || undefined"
        :sizes="imgSizes || undefined"
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
    import { computed } from "vue";

    /**
     * ⚠️ COMPONENTE CRITICO — CARD USATO
     * - Rapporto immagini 5:4 OBBLIGATORIO
     * - Non fare fetch qui dentro
     * - Layout stabile (width/height + aspect-ratio)
     */
    const props = defineProps({
        slug: { type: String, required: true },
        item: { type: Object, required: true },
        settings: { type: Object, required: true },
        priority: { type: Boolean, default: false }, // ✅ solo 1 card sopra la fold
    });

    // ✅ placeholder robusto anche se l'app non è su "/"
    const PLACEHOLDER_IMG = `${import.meta.env.BASE_URL}placeholder-car.png`;

    const rawCover = computed(() => String(props.item?.cover_url || "").trim());

    /**
     * Trasformazione Supabase "best effort":
     * - se non è public supabase -> restituisce url originale
     * - se è già render/image -> restituisce url originale
     * - se fallisce parse -> url originale
     */
    function optimizeSupabase(url, width = 800) {
        if (!url) return "";

        try {
            const u = new URL(url);

            // solo supabase public
            if (!u.pathname.includes("/storage/v1/object/public/")) return url;

            // se già render/image, non ritoccare
            if (u.pathname.includes("/storage/v1/render/image/public/")) return url;

            // prova transformer
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

    /**
     * Src principale:
     * - se cover manca -> placeholder
     * - altrimenti prova optimizeSupabase (ma se non cambia nulla va bene)
     */
    const imgSrc = computed(() => {
        if (!rawCover.value) return PLACEHOLDER_IMG;
        return optimizeSupabase(rawCover.value, 800) || rawCover.value || PLACEHOLDER_IMG;
    });

    /**
     * Responsive images (migliora Lighthouse, non rompe):
     * - se non ho cover, niente srcset
     */
    const imgSrcset = computed(() => {
        if (!rawCover.value) return "";
        const u480 = optimizeSupabase(rawCover.value, 480) || rawCover.value;
        const u800 = optimizeSupabase(rawCover.value, 800) || rawCover.value;
        const u1200 = optimizeSupabase(rawCover.value, 1200) || rawCover.value;
        // evita duplicati brutti se optimize non applica
        return `${u480} 480w, ${u800} 800w, ${u1200} 1200w`;
    });

    const imgSizes = computed(() => {
        // card in grid: mobile quasi full width, desktop multiplo
        return "(max-width: 48rem) 92vw, (max-width: 80rem) 45vw, 30vw";
    });

    function onImgError(e) {
        const img = e.target;

        // ✅ step 1: se stavi usando render/image, riprova con URL originale (object/public)
        const current = String(img?.currentSrc || img?.src || "");
        const raw = rawCover.value;

        if (
            raw &&
            current.includes("/storage/v1/render/image/public/") &&
            raw.includes("/storage/v1/object/public/") &&
            img.dataset.triedRaw !== "1"
        ) {
            img.dataset.triedRaw = "1";
            img.srcset = ""; // evita che il browser riprenda srcset rotto
            img.src = raw;
            return;
        }

        // ✅ step 2: placeholder (una sola volta)
        if (img.dataset.fallbackApplied === "1") return;
        img.dataset.fallbackApplied = "1";
        img.onerror = null;
        img.srcset = "";
        img.src = PLACEHOLDER_IMG;
    }
</script>

<style scoped>
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

  transition: transform 0.18s ease, border-color 0.18s ease;
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
   min-height: calc(1.18em * 2); /* riserva 2 righe */
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

.cta-inline {
  margin-top: 0.35rem;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--tenant-accent, #111);
}

@media (max-width: 48rem) {
  .card:active {
    transform: scale(0.99);
  }
}
</style>