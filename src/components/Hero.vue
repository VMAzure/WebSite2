<!-- src/components/Hero.vue -->
<script setup>
    import { computed } from "vue";

    const props = defineProps({
        settings: Object,
    });

    // ✅ così in template puoi usare "settings.xxx" senza errori
    const settings = computed(() => props.settings || {});

    const safeUrl = (u) => {
        try {
            return encodeURI(String(u || "").trim());
        } catch {
            return "";
        }
    };

    const isSupabasePublicUrl = (raw) => {
        try {
            const u = new URL(String(raw || "").trim());
            return u.pathname.includes("/storage/v1/object/public/");
        } catch {
            return false;
        }
    };

    const supabaseImg = (url, { w, q = 70, fmt = "webp" } = {}) => {
        const raw = String(url || "").trim();
        if (!raw) return "";

        // ✅ se NON è supabase public -> ritorna l'url pulito e basta
        if (!isSupabasePublicUrl(raw)) return safeUrl(raw);

        try {
            const u = new URL(raw);

            u.pathname = u.pathname.replace(
                "/storage/v1/object/public/",
                "/storage/v1/render/image/public/",
            );

            if (w) u.searchParams.set("width", String(w));
            u.searchParams.set("quality", String(q));
            u.searchParams.set("format", String(fmt));

            return u.toString();
        } catch {
            return safeUrl(raw);
        }
    };

    const hasVideo = computed(() => {
        const url = String(settings.value?.hero_video_url || "").trim();
        return url.length > 0;
    });

    const posterUrl = computed(() => {
        const p = String(settings.value?.hero_video_poster || "").trim();
        return p.length > 0 ? p : "";
    });

    const heroImageUrl = computed(() => {
        const img = String(settings.value?.hero_image_url || "").trim();
        return img.length > 0 ? img : "";
    });

    // ✅ LCP candidate: poster > hero_image
    const lcpImageUrl = computed(() => posterUrl.value || heroImageUrl.value);

    const srcset = computed(() => {
        const base = lcpImageUrl.value;
        if (!base) return "";

        // ✅ srcset SOLO per supabase, altrimenti sarebbero URL uguali ripetuti
        if (!isSupabasePublicUrl(base)) return "";

        const candidates = [320, 480, 768, 1024, 1280];
        return candidates
            .map((w) => `${supabaseImg(base, { w, q: 70, fmt: "webp" })} ${w}w`)
            .join(", ");
    });
</script>

<template>
  <section class="hero hero-full">
    <!-- MEDIA -->
    <div class="hero-media">
      <!-- ✅ LCP: IMG sempre (poster o hero image) -->
      <img
        v-if="lcpImageUrl"
        class="hero-img"
        :src="supabaseImg(lcpImageUrl, { w: 960, q: 70, fmt: 'webp' })"
        :srcset="srcset || undefined"
        sizes="100vw"
        width="1920"
        height="1080"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />

      <!-- ✅ Video: decorazione, NON deve bloccare LCP -->
      <video
        v-if="hasVideo"
        class="hero-video"
        :src="safeUrl(settings.hero_video_url)"
        :poster="posterUrl ? safeUrl(posterUrl) : undefined"
        autoplay
        muted
        loop
        playsinline
        preload="none"
      />
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
  width: 100%;
  display: block;
  overflow: hidden;
}

/* HERO */
.hero {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  height: clamp(62vh, 78vh, 92vh);
  min-height: clamp(24rem, 52vw, 44rem);
}

/* ✅ mobile viewport units stabili (riduce CLS da address bar) */
@supports (height: 1svh) {
  .hero {
    height: clamp(62svh, 78svh, 92svh);
  }
}
@supports (height: 1dvh) {
  .hero {
    height: clamp(62dvh, 78dvh, 92dvh);
  }
}

/* MEDIA LAYER */
.hero-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* ✅ IMG: copre come background-image, ma ottimizzabile per LCP */
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* VIDEO */
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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