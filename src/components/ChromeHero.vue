<!-- src/components/ChromeHero.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  settings: Object,
});

/* stessa logica della Hero */
const hasVideo = computed(() => {
  const url = props.settings?.hero_video_url;
  return typeof url === "string" && url.trim().length > 0;
});

const poster = computed(() => {
  const p = props.settings?.hero_video_poster;
  return typeof p === "string" && p.trim().length > 0 ? p.trim() : "";
});

const bgImageStyle = computed(() => {
  const img = props.settings?.hero_image_url;
  return img
    ? { backgroundImage: `url('${encodeURI(img)}')` }
    : { backgroundImage: "none" };
});
</script>

<template>
  <!-- HERO STRUTTURALE (senza testi) -->
  <section class="chrome-hero" aria-hidden="true">
    <!-- MEDIA -->
    <div class="chrome-hero-media">
      <video
        v-if="hasVideo"
        class="chrome-hero-video"
        :src="settings.hero_video_url"
        :poster="poster || undefined"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      />
      <div
        v-else
        class="chrome-hero-image"
        :style="bgImageStyle"
      ></div>
    </div>

    <!-- overlay leggero (solo per leggibilità navbar/topbar) -->
    <div class="chrome-hero-overlay"></div>
  </section>
</template>

<style scoped>
/* ===== HERO BASE ===== */
.chrome-hero {
  width: 100%;
  height: clamp(42vh, 58vh, 70vh); /* leggermente meno della Home */
  position: relative;
  overflow: hidden;
}

/* MEDIA */
.chrome-hero-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.chrome-hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chrome-hero-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* OVERLAY */
.chrome-hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.45) 100%
  );
}
</style>
