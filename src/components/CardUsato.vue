<template>
  <router-link
    class="card"
    :style="{ fontFamily: settings.font_family }"
    :to="`/index/${slug}/usato/${item.id_auto}`"
  >
    <!-- IMMAGINE 5:4 -->
    <div class="image-wrapper">
      <img
  :src="item.cover_url || PLACEHOLDER_IMG"
  @error="onImgError"
  alt="Foto auto"
  class="main-img"
  width="800"
 height ="640"
  loading="lazy"
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
     * - Spacing e layout seguono il design system
     */
    defineProps({
        slug: { type: String, required: true },
        item: { type: Object, required: true },
        settings: { type: Object, required: true },

        // ✅ nuova prop: solo 1 card sopra la fold
        priority: { type: Boolean, default: false },
    });

    const PLACEHOLDER_IMG = "/placeholder-car.png";

    function onImgError(e) {
        const img = e.target;

        // ✅ evita loop infinito
        if (img.dataset.fallbackApplied === "1") return;
        img.dataset.fallbackApplied = "1";

        // ✅ stacca l’handler, così anche se il placeholder fallisce non rientra qui
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
