<!-- src/components/Navbar.vue -->
<template>
  <!-- ✅ Spacer in-flow: riserva spazio quando la navbar diventa fixed (zero CLS) -->
  <nav
    ref="navEl"
    :class="[
      'navbar',
      {
        'navbar-overlay': isHome && !isFixed,
        'navbar-fixed': isFixed,
        'navbar-open': open, // ✅ quando menu è aperto
      },
    ]"
    class="navbar-full"
    :style="{
      '--bg-solid': settings.secondary_color,
      '--accent': settings.tertiary_color,
      '--hover-color': settings.tertiary_color,
    }"
  >
    <!-- ===== MOBILE HEADER ===== -->
    <div class="mobile-header">
      <!-- ✅ BRAND: appare solo quando la navbar è fixed (scroll) -->
     <router-link
  class="navbrand"
  :class="{ 'navbrand-hidden': !isFixed }"
  :to="isPathTenant ? `/${effectiveSlug}` : `/`"
  aria-label="Home"
>
  <img
    v-if="settings?.logo_web"
    :src="settings.logo_web"
    class="navbrandLogo"
    alt="logo"
    width="160"
    height="26"
    decoding="async"
  />
  <span v-else class="navbrandText">
    {{ settings?.company_name || settings?.meta_title || effectiveSlug || "Home" }}
  </span>
</router-link>

      <button class="hamburger" @click="open = !open" aria-label="Apri menu">
        <i class="fa-solid" :class="open ? 'fa-xmark' : 'fa-bars'"></i>
      </button>
    </div>

    <!-- ===== MENU ===== -->
    <ul :class="{ open: open }">
      <li class="mobile-item first-item">
        <router-link class="nav-link" :to="isPathTenant ? `/${effectiveSlug}` : `/`">
          Home
        </router-link>
      </li>

      <li v-for="(srv, i) in menuItems" :key="i" class="mobile-item">
        <router-link
          v-if="!isExternal(srv.link)"
          class="nav-link"
          :to="srv._forceAbsolute ? srv.link : toTenantPath(srv.link)"
        >
          {{ srv.title }}
        </router-link>

        <a
          v-else
          class="nav-link"
          :href="srv.link"
          target="_blank"
          rel="noopener"
        >
          {{ srv.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
    import { useRoute } from "vue-router";

    const props = defineProps({
        slug: String,
        settings: Object,
    });

    const route = useRoute();

    const slugFromRoute = computed(() => String(route.params?.slug || "").trim());
    const effectiveSlug = computed(() => String(props.slug || slugFromRoute.value || "").trim());

    // source: se sei su /index/:slug o /:slug/... sei path-based
    const isPathTenant = computed(() => {
        const p = String(route.path || "").toLowerCase();
        const s = effectiveSlug.value.toLowerCase();
        if (!s) return false;
        if (p.startsWith(`/index/${s}`)) return true;
        if (p === `/${s}` || p.startsWith(`/${s}/`)) return true;
        return false;
    });

    const isHome = computed(() => {
        const p = String(route.path || "").toLowerCase();
        const s = effectiveSlug.value.toLowerCase();

        if (p === "/") return true;
        if (s && (p === `/${s}` || p === `/${s}/`)) return true;
        if (s && (p === `/index/${s}` || p === `/index/${s}/`)) return true;
        return false;
    });

    const open = ref(false);
    const isFixed = ref(false);

    watch(
        () => route.fullPath,
        () => {
            open.value = false; // ✅ chiude il menu dopo qualsiasi navigazione
        }
    );

    const onScroll = () => {
        isFixed.value = window.scrollY > 80;
    };

    /* ✅ FIX overlap: quando navbar diventa fixed, aggiungo padding-top al body */
    const navEl = ref(null);
    const navH = ref(0);

    const applyBodyOffset = async () => {
        await nextTick();
        const el = navEl.value;
        if (!el) return;

        // se è overlay HOME non deve spingere nulla
        if (isHome.value && !isFixed.value) {
            document.body.style.paddingTop = "";
            return;
        }

        // se è fixed, compensa l'altezza
        if (isFixed.value) {
            const h = Math.ceil(el.getBoundingClientRect().height || 0);
            document.body.style.paddingTop = h > 0 ? `${h}px` : "";
            return;
        }

        // non fixed fuori home: torna normale
        document.body.style.paddingTop = "";
    };

    let ro = null;

    onMounted(() => {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        applyBodyOffset();

        // aggiorna offset se cambia altezza (font/responsive/menu)
        if ("ResizeObserver" in window) {
            ro = new ResizeObserver(() => applyBodyOffset());
            if (navEl.value) ro.observe(navEl.value);
        } else {
            window.addEventListener("resize", applyBodyOffset, { passive: true });
        }
    });

    onUnmounted(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", applyBodyOffset);
        if (ro) ro.disconnect();
        document.body.style.paddingTop = "";
    });

    watch([isFixed, isHome, open], () => applyBodyOffset());

    const usatoVetrinaPath = computed(() => toTenantPath("/usato-vetrina"));

    const menuItems = computed(() => {
        const visibility = props.settings?.servizi_visibili || {};
        const details = props.settings?.servizi_dettaglio || {};

        return Object.keys(visibility)
            .filter((k) => visibility[k])
            .map((k) => {
                const title = String(details[k]?.title || k).trim();
                const link = String(details[k]?.link || "#").trim();

                const t = title.toLowerCase();
                if (t.includes("vendita")) {
                    return { title, link: usatoVetrinaPath.value, _forceAbsolute: true };
                }

                return { title, link };
            });
    });

    const isExternal = (link) => /^https?:\/\//i.test(link);

    function toTenantPath(p) {
        const path = p.startsWith("/") ? p : `/${p}`;
        // se sono path-tenant, prefisso sempre /:slug davanti
        if (isPathTenant.value && effectiveSlug.value) {
            return `/${effectiveSlug.value}${path === "/" ? "" : path}`;
        }
        // domain tenant: path pulito
        return path;
    }
</script>

<style scoped>
/* ============================================
  BASE
============================================ */
.navbar-full {
  width: 100vw;
  margin: 0;
  padding: 0;
}

.navbar {
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 3000;
  transition: all 0.25s ease;

  /* default: SOLIDA (fuori home) */
  background: var(--bg-solid);
  background-color: var(--bg-solid);
  border-bottom: 0.2rem solid var(--accent);
}

/* ============================================
  HOME — OVERLAY VERO (hero sotto)
============================================ */
.navbar-overlay {
  position: absolute;
  left: 0;
  right: 0;

  /* ✅ TopBar gestisce --topbar-h (e quando sparisce diventa 0px) */
  top: var(--topbar-h, clamp(3.4rem, 6vw, 5.4rem));

  background: transparent !important;
  background-color: transparent !important;
  border-bottom: 0 !important;
}

/* ✅ in overlay: trasparente SOLO la barra (header), NON il menu aperto */
.navbar-overlay .mobile-header {
  background: transparent !important;
  background-color: transparent !important;
}

/* ✅ FIX: se il menu è aperto, anche in HOME overlay la barra deve diventare leggibile */
.navbar-overlay.navbar-open {
  background: rgba(0, 0, 0, 0.88) !important;
  background-color: rgba(0, 0, 0, 0.88) !important;
  backdrop-filter: blur(0.6rem);
  -webkit-backdrop-filter: blur(0.6rem);
  border-bottom: 0.2rem solid var(--accent) !important;
}

.navbar-overlay.navbar-open .mobile-header {
  background: rgba(0, 0, 0, 0.88) !important;
  background-color: rgba(0, 0, 0, 0.88) !important;
}

/* testo sopra hero */
.navbar-overlay .nav-link {
  color: #fff;
  text-shadow: 0 0.3rem 1rem rgba(0, 0, 0, 0.8);
}

/* ============================================
  SCROLL — NAVBAR SOLIDA (fixed)
============================================ */
.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  background: rgba(0, 0, 0, 0.88) !important;
  background-color: rgba(0, 0, 0, 0.88) !important;
  backdrop-filter: blur(0.6rem);
  -webkit-backdrop-filter: blur(0.6rem);
  border-bottom: 0.2rem solid var(--accent);
}

/* ============================================
  MENU (base)
============================================ */
ul {
  list-style: none;
  margin: 0;
  padding: 0;

  display: none;
  flex-direction: column;
  text-align: center;
}

/* base */
ul.open {
  display: flex;
  background: rgba(0, 0, 0, 0.94);
  background-color: rgba(0, 0, 0, 0.94);
  opacity: 1;
  backdrop-filter: blur(0.6rem);
  -webkit-backdrop-filter: blur(0.6rem);
}

.mobile-item {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.first-item {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.mobile-item:last-child {
  border-bottom: none;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  display: block;
  font-weight: 500;
}

/* ============================================
  MOBILE HEADER
============================================ */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.8rem, 4vw, 1.2rem);
  gap: 0.75rem;
}

.hamburger {
  font-size: clamp(1.6rem, 4vw, 2rem);
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}

/* ✅ BRAND (solo quando isFixed) */
.navbrand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  min-width: 0;
}

.navbrandLogo {
  height: 1.6rem;
  max-width: 10rem;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 0.25rem 0.9rem rgba(0, 0, 0, 0.35));
}

.navbrandText {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.55);
}

/* =========================================================
  ✅ FIX MENU MOBILE (QUELLO CHE TI MANCA):
  - pannello OPEN completamente OPACO
  - NESSUN blur sul pannello (il blur lo rende “lavato”)
  - testo link forzato pieno e senza ombre
========================================================= */
@media (max-width: 63.99rem) {
  .navbar > ul {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 3200;
  }

  /* ✅ pannello open: opaco + niente blur */
  .navbar.navbar-open > ul.open,
  .navbar-overlay.navbar-open > ul.open,
  .navbar-fixed.navbar-open > ul.open {
    background: rgba(0, 0, 0, 0.98) !important;
    background-color: rgba(0, 0, 0, 0.98) !important;

    opacity: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;

    backdrop-filter: none !important;          /* 🔥 questo è il punto */
    -webkit-backdrop-filter: none !important;  /* 🔥 questo è il punto */
  }

  /* ✅ testo: pieno e leggibile */
  .navbar.navbar-open > ul.open .nav-link,
  .navbar-overlay.navbar-open > ul.open .nav-link,
  .navbar-fixed.navbar-open > ul.open .nav-link {
    color: #fff !important;
    opacity: 1 !important;
    text-shadow: none !important;
    font-weight: 700 !important;
    filter: none !important;
    -webkit-filter: none !important;
  }

  /* ✅ separatori un filo più visibili */
  .navbar.navbar-open > ul.open .mobile-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.25) !important;
  }

  /* ✅ feedback tap */
  .navbar.navbar-open > ul.open .nav-link:active,
  .navbar.navbar-open > ul.open .nav-link:hover {
    color: var(--accent) !important;
  }
}

/* ============================================
  DESKTOP
============================================ */
@media (min-width: 64rem) {
  .mobile-header {
    display: none;
  }

  ul {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    padding: 1.4rem 0;

    position: static;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .mobile-item,
  .first-item {
    border: 0 !important;
    padding: 0 !important;
  }

  .nav-link {
    font-size: clamp(1rem, 1.2vw, 1.2rem);
    padding: 0.2rem 0;
    position: relative;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    bottom: -0.4rem;
    left: 50%;
    width: 0;
    height: 0.15rem;
    background: var(--hover-color);
    transform: translateX(-50%);
    transition: width 0.25s ease;
  }

  .nav-link:hover::after {
    width: 65%;
  }
}
</style>    