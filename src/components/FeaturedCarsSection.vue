<template>
  <section v-if="topUsato.length" class="highlight-section">
    <div class="header">
      <h2 class="title" :style="{ color: settings.secondary_color }">
        Auto in evidenza
      </h2>

      <div class="nav-buttons">
        <button
          type="button"
          class="nav-btn"
          @click="scrollLeft"
          aria-label="Scorri a sinistra"
        >
          ‹
        </button>
        <button
          type="button"
          class="nav-btn"
          @click="scrollRight"
          aria-label="Scorri a destra"
        >
          ›
        </button>
      </div>
    </div>

    <div ref="scrollEl" class="horizontal-scroll">
     <div
  v-for="item in topUsato"
  :key="item.id_auto"
  class="card-slot"
  data-featured-card
>
  <CardUsato :slug="slug" :item="item" :settings="settings" />
</div>

    </div>
  </section>
</template>

<script setup>
    import { computed, ref } from "vue";
    import CardUsato from "@/components/CardUsato.vue";

    const props = defineProps({
        topUsato: { type: Array, default: () => [] },
        settings: { type: Object, default: () => ({}) },
        slug: { type: [String, null], default: null },
    });

    const items = computed(() =>
        Array.isArray(props.topUsato) ? props.topUsato : [],
    );

    // ✅ SOLO PER I BOTTONI SCROLL
    const scrollEl = ref(null);

    function scrollLeft() {
        const el = scrollEl.value;
        if (!el) return;

        const card = el.querySelector("[data-featured-card]");
        const gap = 16; // deve matchare il gap CSS (vedi punto 3)
        const step = card ? card.getBoundingClientRect().width + gap : 480;

        el.scrollBy({ left: -step, behavior: "smooth" });
    }

    function scrollRight() {
        const el = scrollEl.value;
        if (!el) return;

        const card = el.querySelector("[data-featured-card]");
        const gap = 16;
        const step = card ? card.getBoundingClientRect().width + gap : 480;

        el.scrollBy({ left: step, behavior: "smooth" });
    }
    </script>

<style scoped>
.highlight-section {
  /* titolo più vicino alla sezione sopra */
  margin-top: clamp(0.75rem, 2vw, 1.5rem);

  /* padding coerente col design system */
  padding: var(--u-2) var(--u-5) var(--u-4);
  margin-bottom: clamp(1.5rem, 5vw, 3rem); /* 👈 stacco dal footer */
}

.title {
  font-size: clamp(1rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.5;

  /* ✅ questo evita che venga “coperto” */
  margin: 0 0 var(--u-3) 0;
  padding-left: clamp(0.5rem, 1vw, 0.5rem);
  /* niente translate: è quello che ti stava creando overlap */
  transform: none;

  /* sempre sopra alle card */
  position: relative;
  z-index: 2;
}

.horizontal-scroll {
  display: flex;
  flex-direction: row;

  /* ✅ gap fisso e pulito */
  gap: var(--u-3);

  overflow-x: auto;
  scroll-behavior: smooth;

  /* ✅ spazio sotto e sopra per “respirare” */
  padding-bottom: var(--u-1);

  /* IMPORTANTISSIMO: non deve “salire” sotto al titolo */
  position: relative;
  z-index: 1;
}

.card-slot {
  flex: 0 0 auto;
  width: clamp(18rem, 26vw, 22rem);

  /* ✅ tutte stessa altezza visiva */
  display: flex;
}

.horizontal-scroll::-webkit-scrollbar {
  height: clamp(0.3rem, 0.8vw, 0.6rem);
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 0;
}

.card-spacing {
  min-width: clamp(18rem, 26vw, 22rem);
  flex: 0 0 auto;

  /* allineamento */
  display: flex;
}

.card-spacing :deep(.card) {
  min-height: 24rem; /* regola finché ti torna uguale */
}

.card-wrap {
  flex: 0 0 auto;
  width: clamp(18rem, 26vw, 22rem);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* stesso padding della sezione, così titolo e frecce stanno “in griglia” */
  padding-left: var(--u-2);
  padding-right: var(--u-2);

  padding-right: clamp(0.75rem, 3vw, 1.5rem);

  margin-bottom: var(--u-3);
}

.nav-buttons {
  display: flex;
  gap: var(--u-2);
}

.nav-btn {
  width: clamp(2.1rem, 4.6vw, 2.6rem);
  height: clamp(2.1rem, 4.6vw, 2.6rem);

  border-radius: 999rem; /* ✅ rotondi come marche */
  border: 0.06rem solid rgba(0, 0, 0, 0.14);
  background: #fff;

  cursor: pointer;
  display: grid;
  place-items: center;

  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  line-height: 1;
}


.nav-btn:hover {
  opacity: 0.75;
}

.nav-btn:active {
  transform: scale(0.98);
}

@media (max-width: 48rem) {
  .nav-buttons {
    position: relative;
    top: clamp(-0.6rem, -2vw, -1.1rem); /* 👈 SOLO bottoni più su */
  }
}
</style>
