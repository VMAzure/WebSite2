<!-- src/App.vue -->
<template>
  <!-- ✅ pagine tenant: chrome sempre -->
  <div v-if="showChrome" class="tenant-shell" :class="{ 'chrome-overlay': true }">
    <div v-if="settings" class="tenant-root">

<!-- ✅ UNDERLAY: hero video/foto — in home e nelle altre pagine -->
<div v-if="showUnderlay" class="chrome-underlay" :class="{ 'chrome-underlay--home': isHome }" aria-hidden="true">
  <!-- Testo hero in home (claim) sopra underlay -->
  <div v-if="isHome && (settings?.claim_hero || settings?.subclaim_hero)" class="chrome-underlay-claim">
    <p v-if="settings?.claim_hero" class="chrome-underlay-claim__main">{{ settings.claim_hero }}</p>
    <p v-if="settings?.subclaim_hero" class="chrome-underlay-claim__sub">{{ settings.subclaim_hero }}</p>
  </div>
  <video
    v-if="underlayHasVideo"
    class="chrome-underlay-video"
    :src="settings.hero_video_url"
    :poster="underlayPoster || undefined"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
  />
  <div v-else class="chrome-underlay-image" :style="underlayStyle"></div>
</div>

  <template v-if="!hideGlobalChrome">
  <Topbar :settings="settings" :slug="slug" />
  <Navbar :settings="settings" :slug="slug" />
</template>

<template v-else>
  <VetrinaNavbar :settings="settings" :slug="slug" />
</template>

<router-view />

<Footer v-if="!hideGlobalChrome" :settings="settings" />
    </div>

    <div v-else class="loading">Caricamento...</div>
  </div>

  <!-- ✅ pagine di sistema (tenant-not-configured, 404) -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
    import { computed, watch, ref, onMounted, onUnmounted } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    import Topbar from "@/components/TopBar.vue";
    import Navbar from "@/components/Navbar.vue";
    import Footer from "@/components/Footer.vue";
    import CatalogHeader from "@/components/CatalogHeader.vue";
    import VetrinaNavbar from "@/components/VetrinaNavbar.vue";

    import { loadIubendaIfNeeded } from "@/compliance/iubenda";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || null);

    // chrome solo dove serve
    const showChrome = computed(() => route.meta?.tenantRequired === true);
    // entry=external: navbar stile noleggio lungo termine (Condividi, Reset filtri, hamburger)
    const hideGlobalChrome = computed(() => {
        const canonical = String(route.meta?.canonical || "").trim();
        const entry = String(route.query?.entry || "").trim().toLowerCase();
        if (entry !== "external") return false;
        return canonical === "/usato-vetrina" || canonical === "/usato";
    });

    // HOME robusto
    const isHome = computed(() => {
        const p = String(route.path || "").toLowerCase();
        const s = String(slug.value || "").trim().toLowerCase();

        if (p === "/") return true;
        if (s && (p === `/index/${s}` || p === `/index/${s}/`)) return true;
        if (route.meta && route.meta.canonical === "/") return true;

        return false;
    });

    // ============================
    // ✅ DESKTOP detection (>= 64rem)
    // ============================
    const isDesktop = ref(false);
    let mql = null;

    function updateIsDesktop() {
        isDesktop.value = !!mql?.matches;
    }

    onMounted(() => {
        if (typeof window !== "undefined" && "matchMedia" in window) {
            mql = window.matchMedia("(min-width: 64rem)");
            updateIsDesktop();

            // addListener fallback per Safari vecchi
            if ("addEventListener" in mql) mql.addEventListener("change", updateIsDesktop);
            else mql.addListener(updateIsDesktop);
        }
    });

    onUnmounted(() => {
        if (mql) {
            if ("removeEventListener" in mql) mql.removeEventListener("change", updateIsDesktop);
            else mql.removeListener(updateIsDesktop);
        }
    });

    // Underlay (hero video/foto): in HOME e nelle altre pagine, così la hero si vede sempre
    const showUnderlay = computed(() => {
        return showChrome.value && !!settings.value && !hideGlobalChrome.value;
    });

    // ✅ video come home (se presente)
    const underlayHasVideo = computed(() => {
        const url = (settings.value?.hero_video_url || "").trim();
        return url.length > 0;
    });

    // ✅ poster (fallback/preview)
    const underlayPoster = computed(() => {
        const p = (settings.value?.hero_video_poster || "").trim();
        return p.length > 0 ? p : "";
    });

    // ✅ fallback immagine se non c’è video
    const underlayStyle = computed(() => {
        const s = settings.value || {};
        const img = (s.hero_image_url || "").trim();
        const poster = (s.hero_video_poster || "").trim();
        const url = img || poster;

        return url ? { backgroundImage: `url("${encodeURI(url)}")` } : {};
    });

    // ✅ iubenda
    watch(
        () => tenant.compliance,
        (c) => loadIubendaIfNeeded(c),
        { immediate: true },
    );
</script>

<style>
.loading {
  padding: 16px;
}

.tenant-root {
  min-height: 100vh;
  background: #fff;
  position: relative;
}

/* ===========================
   1) Overlay SEMPRE (pagine tenant)
   - Rispetta .topbar-fixed / .navbar-fixed
   =========================== */
.chrome-overlay .topbar:not(.topbar-fixed) {
  position: absolute !important;
  top: 0 !important;
  left: 0;
  right: 0;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

.chrome-overlay .navbar:not(.navbar-fixed) {
  position: absolute !important;
  left: 0;
  right: 0;
  top: var(--topbar-h, clamp(3.4rem, 6vw, 5.4rem)) !important;

  background: transparent !important;
  background-color: transparent !important;
  border-bottom: 0 !important;
}

.chrome-overlay .navbar:not(.navbar-fixed) .mobile-header,
.chrome-overlay .navbar:not(.navbar-fixed) ul {
  background: transparent !important;
  background-color: transparent !important;
}

/* testo leggibile sopra underlay */
.chrome-overlay .navbar:not(.navbar-fixed) .nav-link,
.chrome-overlay .topbar:not(.topbar-fixed) .topbar-link,
.chrome-overlay .topbar:not(.topbar-fixed) .right i {
  color: #fff !important;
  text-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.55) !important;
}

.chrome-overlay .topbar:not(.topbar-fixed) .privacy-link {
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.75) !important;
  text-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.55) !important;
}

/* ===========================
   2) Fascia sotto (DESKTOP ONLY via v-if)
   =========================== */
.chrome-underlay {
  width: 100%;
  height: calc(var(--topbar-h, clamp(3.4rem, 6vw, 5.4rem)) + var(--navbar-h, 4.4rem));
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* Home: underlay a tutta altezza come hero (stesso spazio della Hero in IndexPage) */
.chrome-underlay--home {
  height: clamp(62vh, 78vh, 92vh);
  min-height: clamp(24rem, 52vw, 44rem);
}

@media (max-width: 63.99rem) {
  .chrome-underlay {
    height: clamp(10rem, 28vw, 14rem);
  }
  .chrome-underlay--home {
    height: clamp(62vh, 78vh, 92vh);
    min-height: clamp(24rem, 52vw, 44rem);
  }
}

.chrome-underlay-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chrome-underlay-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(1) contrast(1.02);
}

.chrome-underlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.35) 100%
  );
  pointer-events: none;
}

/* Testo hero (claim) in home sopra underlay */
.chrome-underlay-claim {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 clamp(1rem, 4vw, 2rem);
  color: #fff;
  pointer-events: none;
}
.chrome-underlay-claim__main {
  font-size: clamp(2.6rem, 6vw, 4rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.45);
  margin: 0;
}
.chrome-underlay-claim__sub {
  font-size: clamp(1.3rem, 3vw, 2rem);
  font-weight: 400;
  line-height: 1.35;
  text-shadow: 0 0.35rem 1rem rgba(0, 0, 0, 0.35);
  margin: 1rem 0 0;
}
</style>