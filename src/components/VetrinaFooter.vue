<!-- Footer per entry=external: stile "Realizzato con ❤️ da nlt.rent" -->
<template>
  <footer class="vetrina-footer">
    <div class="vetrina-footer__inner">
      <div class="vetrina-footer__line" aria-hidden="true"></div>
      <span class="vetrina-footer__text">
        Realizzato con <span class="vetrina-footer__heart" aria-hidden="true">❤️</span> da
        <a
          href="https://nlt.rent"
          target="_blank"
          rel="noopener"
          class="vetrina-footer__brand"
          :style="{ color: tertiaryColor }"
        >
          nlt.rent
        </a>
      </span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ settings: Object });

const tertiaryColor = computed(() => {
  const c = props.settings?.tertiary_color;
  return (typeof c === "string" && c.trim()) ? c.trim() : "#1a9d4d";
});
</script>

<style scoped>
.vetrina-footer {
  width: 100%;
  background: #2d2d2d;
  color: #9a9a9a;
  font-size: 0.9rem;
  margin-top: auto;
}

.vetrina-footer__inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
  padding: 0.6rem max(1rem, 2vw);
  max-width: 96rem;
  margin: 0 auto;
  box-sizing: border-box;
}

.vetrina-footer__line {
  width: 0.15rem;
  height: 1.75rem;
  background: #fff;
  flex-shrink: 0;
  opacity: 0.9;
}

.vetrina-footer__text {
  margin-left: auto;
  color: #8a8a8a;
}

.vetrina-footer__heart {
  color: #e74c3c;
  font-style: normal;
}

.vetrina-footer__brand {
  font-weight: 700;
  text-decoration: none;
}

.vetrina-footer__brand:hover {
  opacity: 0.9;
  text-decoration: underline;
}

/* Su mobile: spazio sotto così il footer non viene coperto dalla barra sticky contatti */
@media (max-width: 63.99rem) {
  .vetrina-footer {
    padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
