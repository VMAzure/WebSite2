<!-- src/App.vue -->
<template>
  <!-- ✅ pagine tenant: chrome sempre -->
  <div v-if="showChrome" class="tenant-shell" :class="{ 'chrome-overlay': true }">
    <div v-if="settings" class="tenant-root">
      <!-- ✅ SOTTOFONDO SOLO PER PAGINE NON-HOME:
           una fascia alta quanto (topbar + navbar), NON una hero
           ✅ autoplay video se esiste, altrimenti immagine/poster -->
      <div v-if="showUnderlay" class="chrome-underlay" aria-hidden="true">
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

      <Topbar :settings="settings" :slug="slug" />
      <Navbar :settings="settings" :slug="slug" />

      <router-view />

      <Footer :settings="settings" />
    </div>

    <div v-else class="loading">Caricamento...</div>
  </div>

  <!-- ✅ pagine di sistema (tenant-not-configured, 404) -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
    import { computed, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    import Topbar from "@/components/TopBar.vue";
    import Navbar from "@/components/Navbar.vue";
    import Footer from "@/components/Footer.vue";

    import { loadIubendaIfNeeded } from "@/compliance/iubenda";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || null);

    // chrome solo dove serve
    const showChrome = computed(() => route.meta?.tenantRequired === true);

    // HOME robusto (come avevamo fatto in Navbar/Topbar)
    const isHome = computed(() => {
        const p = String(route.path || "").toLowerCase();
        const s = String(slug.value || "").trim().toLowerCase();

        if (p === "/") return true;
        if (s && (p === `/index/${s}` || p === `/index/${s}/`)) return true;
        if (route.meta && route.meta.canonical === "/") return true;

        return false;
    });

    // ✅ la fascia sotto serve solo nelle pagine interne
    const showUnderlay = computed(() => showChrome.value && !!settings.value && !isHome.value);

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

    // ✅ fallback immagine se non c’è video (oppure se vuoi forzare senza video)
    const underlayStyle = computed(() => {
        const s = settings.value || {};
        const img = (s.hero_image_url || "").trim();
        const poster = (s.hero_video_poster || "").trim();
        const url = img || poster;

        return url ? { backgroundImage: `url("${encodeURI(url)}")` } : {};
    });

    // ✅ quando arriva la compliance (fetch non bloccante), carica iubenda una volta
    watch(
        () => tenant.compliance,
        (c) => loadIubendaIfNeeded(c),
        { immediate: true }
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
   - Non tocchiamo i componenti: lo forziamo da App
   - Ma rispettiamo .topbar-fixed / .navbar-fixed
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

  /* sotto la topbar (se --topbar-h non c’è, fallback) */
  top: var(--topbar-h, clamp(3.4rem, 6vw, 5.4rem)) !important;

  background: transparent !important;
  background-color: transparent !important;
  border-bottom: 0 !important;
}

/* IMPORTANTISSIMO: niente sfondi “solidi” sui figli quando overlay */
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
   2) Fascia sotto (NON hero)
   - altezza = topbar + navbar (navbar fallback)
   - ✅ video autoplay come home
   =========================== */
.chrome-underlay {
  width: 100%;
  height: calc(var(--topbar-h, clamp(3.4rem, 6vw, 5.4rem)) + var(--navbar-h, 4.4rem));
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* video layer */
.chrome-underlay-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* fallback immagine */
.chrome-underlay-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* look “premium” senza invadere la pagina */
  filter: saturate(0.9) contrast(0.95);
}

/* overlay scuro sopra (per leggibilità) */
.chrome-underlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.55) 100%
  );
  pointer-events: none;
}
</style>
