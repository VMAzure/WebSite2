<script setup>
    import { computed } from "vue";

    const props = defineProps({
        settings: Object,
    });

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
  <section class="hero hero-full">
    <!-- MEDIA -->
    <div class="hero-media">
      <video
        v-if="hasVideo"
        class="hero-video"
        :src="settings.hero_video_url"
        :poster="poster || undefined"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      />
      <div v-else class="hero-image" :style="bgImageStyle"></div>
    </div>

    <!-- Overlay premium -->
    <div class="overlay"></div>

    <!-- Contenuto -->
    <div class="hero-content">
      <p v-if="settings.claim_hero" class="claim">
        {{ settings.claim_hero }}
      </p>

      <p v-if="settings.subclaim_hero" class="subclaim">
        {{ settings.subclaim_hero }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero-full {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  display: block;
  overflow: hidden;
}

/* HERO */
/* HERO */
.hero {
  height: clamp(62vh, 78vh, 92vh); /* 🔥 +7/+6/+7 vh circa */
  min-height: clamp(
    24rem,
    52vw,
    44rem
  ); /* 🔥 un po’ più “alta” anche su desktop */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* MEDIA LAYER */
.hero-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* OVERLAY */
.overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.45) 45%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

/* CONTENUTO */
.hero-content {
  position: relative;
  z-index: 5;
  text-align: center;
  max-width: 85vw;
  padding: 0 clamp(1rem, 4vw, 2rem);
  color: white;
  display: flex;
  flex-direction: column;
}

/* testi (puoi lasciare i tuoi) */
.claim {
  font-size: clamp(2.6rem, 6vw, 4rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.45);
  opacity: 0;
  transform: translateY(1rem);
  animation: fadeUp 0.9s ease forwards;
  margin-bottom: 0;
}

.subclaim {
  font-size: clamp(1.3rem, 3vw, 2rem);
  font-weight: 400;
  line-height: 1.35;
  text-shadow: 0 0.35rem 1rem rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(1.2rem);
  animation: fadeUp 1.2s ease forwards;
  margin-top: 1rem;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
