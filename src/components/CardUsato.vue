<template>
  <div class="card" :style="{ fontFamily: settings.font_family }">

    <!-- IMMAGINE 5:4 -->
    <router-link
      class="image-wrapper aspect-5-4"
      :to="`/index/${slug}/usato/${item.id_auto}`"
    >
      <img
        :src="item.cover_url || PLACEHOLDER_IMG"
        @error="onImgError"
        alt="Foto auto"
        class="main-img img-cover"
      />
    </router-link>

    <!-- INFO -->
    <div class="info">
      <div class="text-block">
        <h3 class="title">
          {{ item.marca }} {{ item.allestimento }}
        </h3>

        <div class="details">
  <span>{{ item.anno_immatricolazione }}</span>
  <span class="dot">•</span>
  <span>{{ item.km_certificati.toLocaleString('it-IT') }} km</span>
  <span class="dot">•</span>
  <span>{{ item.prezzo_vendita.toLocaleString('it-IT') }} €</span>
</div>
      </div>

      <router-link
        class="cta"
        :style="{ backgroundColor: settings.tertiary_color }"
        :to="`/index/${slug}/usato/${item.id_auto}`"
      >
        Dettagli
      </router-link>
    </div>

  </div>
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
        item: { type: Object, required: true }, // CardUsatoDto
        settings: { type: Object, required: true },
    })

    const PLACEHOLDER_IMG = "/placeholder-car.png"

    function onImgError(e) {
        e.target.src = PLACEHOLDER_IMG
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

  /* stacco visivo */
  border-radius: 0;
  border: 0.1rem solid rgba(0,0,0,0.06);

  /* ombra più "soft" */
  box-shadow:
    0 0.4rem 1.2rem rgba(0,0,0,0.06),
    0 0.1rem 0.4rem rgba(0,0,0,0.04);

  transition:
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.card:hover {
  transform: translateY(-0.15rem);
  box-shadow:
    0 0.8rem 2.2rem rgba(0,0,0,0.10),
    0 0.2rem 0.8rem rgba(0,0,0,0.06);
}


/* =======================
IMMAGINE
======================= */
.image-wrapper {
  width: 100%;
  aspect-ratio: 5 / 4;
  overflow: hidden;

  /* cornice interna tipo "foto su card" */
  padding: var(--u-3);
  box-sizing: border-box;
  background: rgba(0,0,0,0.02);
}

.image-wrapper .main-img {
  width: 100%;
  height: 100%;
  aspect-ratio: 5 / 4;
  object-fit: cover;
  display: block;

  border-radius: 0;
}


/* =======================
INFO
======================= */
.info {
  padding: var(--u-4);
  display: flex;
  flex-direction: column;
  gap: var(--u-3);

  height: clamp(10.5rem, 20vw, 13.5rem);
}


.text-block {
  flex: 1;
  overflow: hidden;
}

.title {
  font-size: clamp(1.15rem, 1.35vw, 1.45rem);
  font-weight: 700;
  line-height: 1.18;
  margin: 0;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details {
  font-size: clamp(0.9rem, 1.05vw, 1rem);
  color: rgba(0,0,0,0.72);
  margin-top: var(--u-2);

  display: flex;
  gap: var(--u-3);
  align-items: center;
  flex-wrap: wrap;
}




/* =======================
CTA
======================= */
.cta {
  width: 100%;
  height: clamp(2.6rem, 6vw, 3.2rem);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-top: auto;

  color: #fff;
  font-weight: 700;
  font-size: var(--fs-sm);
  text-decoration: none;

  border-radius: 0;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.cta:hover {
  opacity: 0.92;
  transform: translateY(-0.05rem);
}



.cta:hover {
  opacity: 0.85;
}

/* =======================
MOBILE UX — CARD TAPPABILE
======================= */
@media (max-width: 48rem) {
  .card:active {
    transform: scale(0.99);
    box-shadow:
      0 0.3rem 1rem rgba(0,0,0,0.08),
      0 0.1rem 0.4rem rgba(0,0,0,0.05);
  }
}

.dot {
  opacity: 0.35;
}

</style>
