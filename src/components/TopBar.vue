<!-- src/components/TopBar.vue -->
<script setup>
    import { computed, ref, onMounted, onUnmounted } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const props = defineProps({
        settings: Object,
        slug: String,
    });

    useTenantStore(); // lo lasciamo perché lo avevi (non cambia nulla)
    const route = useRoute();

    const isDev = computed(() => import.meta.env.DEV);

    /* ✅ HOME robusto (come Navbar) */
    const isHome = computed(() => {
        const p = String(route.path || "").toLowerCase();
        const s = String(props.slug || route.params?.slug || "").trim().toLowerCase();

        if (p === "/") return true;
        if (s && (p === `/index/${s}` || p === `/index/${s}/`)) return true;
        if (route.meta && route.meta.canonical === "/") return true;

        return false;
    });

    /* =========================================================
       ✅ ANTI-CLS: settiamo --topbar-h STABILE e SUBITO
       - niente misure DOM (niente nextTick, niente RO)
       - valore diverso tra desktop e mobile
       ========================================================= */
    function setTopbarVarStable() {
        // se la topbar è nascosta, deve essere 0
        if (isHidden.value) {
            document.documentElement.style.setProperty("--topbar-h", "0px");
            return;
        }

        const isMobile = window.matchMedia("(max-width: 900px)").matches;

        // Desktop: una riga (valore molto vicino al tuo clamp precedente)
        // Mobile: due righe (topbar in colonna), valore stabile -> NO shift
        const v = isMobile
            ? "clamp(6.4rem, 10vw, 8.2rem)"
            : "clamp(3.4rem, 6vw, 5.4rem)";

        document.documentElement.style.setProperty("--topbar-h", v);
    }

    /* ✅ stessa soglia della Navbar: quando scatta la TOPBAR sparisce */
    const isHidden = ref(false);
    const onScroll = () => {
        const next = window.scrollY > 80;
        if (next === isHidden.value) return;

        isHidden.value = next;
        setTopbarVarStable();
    };

    onMounted(() => {
        // ✅ set immediato (prima possibile) + listeners
        setTopbarVarStable();
        window.addEventListener("scroll", onScroll, { passive: true });

        // resize NON incide su CLS lighthouse; utile se cambiano breakpoint/orientamento
        window.addEventListener("resize", setTopbarVarStable, { passive: true });
    });

    onUnmounted(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", setTopbarVarStable);
    });
</script>

<template>
  <div
    :class="[
      'topbar',
      {
        'topbar-overlay': isHome && !isHidden,
        'topbar-hidden': isHidden,
      },
    ]"
    :style="{
      backgroundColor:
        isHome && !isHidden ? 'transparent' : settings.primary_color || '#fff',
      '--secondary': settings.secondary_color,
      '--tertiary': settings.tertiary_color,
    }"
  >
    <!-- LEFT -->
    <div class="left">
      <a
        v-if="settings.contact_email"
        :href="`mailto:${settings.contact_email}`"
        class="topbar-link"
      >
        <i class="fa-solid fa-envelope"></i>
        {{ settings.contact_email }}
      </a>

      <a
        v-if="settings.contact_phone"
        :href="`tel:${settings.contact_phone}`"
        class="topbar-link"
      >
        <i class="fa-solid fa-phone"></i>
        {{ settings.contact_phone }}
      </a>
    </div>

    <!-- CENTER LOGO -->
    <div class="center">
      <router-link
        :to="
          (isDev || String(route.path || '').toLowerCase().startsWith('/index/'))
            ? `/index/${slug}`
            : `/`
        "
        class="logo-link"
      >
        <img
          v-if="settings.logo_web"
          :src="settings.logo_web"
          class="logo"
          alt="logo"
          width="160"
          height="52"
          decoding="async"
          loading="eager"
          fetchpriority="high"
        />
      </router-link>
    </div>

    <!-- RIGHT SOCIAL -->
    <div class="right">
      <a
        v-if="settings.facebook_url"
        :href="settings.facebook_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-facebook"></i>
      </a>

      <a
        v-if="settings.instagram_url"
        :href="settings.instagram_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-instagram"></i>
      </a>

      <a
        v-if="settings.tiktok_url"
        :href="settings.tiktok_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-tiktok"></i>
      </a>

      <a
        v-if="settings.youtube_url"
        :href="settings.youtube_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-youtube"></i>
      </a>

      <a
        v-if="settings.linkedin_url"
        :href="settings.linkedin_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-linkedin"></i>
      </a>

      <a
        v-if="settings.x_url"
        :href="settings.x_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-x-twitter"></i>
      </a>

      <a
        v-if="settings.whatsapp_url"
        :href="settings.whatsapp_url"
        target="_blank"
        rel="noopener"
      >
        <i class="fa-brands fa-whatsapp"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: clamp(0.55rem, 1.4vw, 0.95rem) clamp(1rem, 3vw, 1.4rem);
  gap: clamp(0.6rem, 2vw, 1.2rem);
  font-size: clamp(0.85rem, 1.7vw, 1rem);

  box-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 4000;
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

/* ✅ HOME overlay: sopra hero e trasparente VERO */
.topbar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;

  color: #fff;
}

.topbar-overlay .topbar-link,
.topbar-overlay .right i {
  color: #fff !important;
  text-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.55);
}

.topbar-overlay .privacy-link {
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.75) !important;
  text-shadow: 0 0.25rem 0.9rem rgba(0, 0, 0, 0.55);
}

/* ✅ SCROLL: la topbar DEVE SPARIRE */
.topbar-hidden {
  transform: translateY(-110%);
  opacity: 0;
  pointer-events: none;
}

/* LEFT */
.left {
  display: flex;
  gap: clamp(0.6rem, 2vw, 1.3rem);
  align-items: center;
  white-space: nowrap;
}

.topbar-link {
  color: var(--secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: clamp(0.3rem, 1vw, 0.55rem);
  font-weight: 500;
  transition: opacity 0.25s ease;
}
.topbar-link:hover {
  opacity: 0.6;
}

/* CENTER */
.center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-height: clamp(2.5rem, 4.8vw, 3.2rem);
}
.logo-link {
  display: flex;
}
.logo {
  max-height: clamp(2.5rem, 4.8vw, 3.2rem);
  object-fit: contain;
  transition: opacity 0.25s ease;
}
.logo-link:hover .logo {
  opacity: 0.85;
}

/* RIGHT */
.right {
  display: flex;
  gap: clamp(0.6rem, 2vw, 1.1rem);
  align-items: center;
}
.right i {
  font-size: clamp(1.15rem, 3vw, 1.55rem);
  color: var(--secondary);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.right i:hover {
  opacity: 0.55;
  transform: translateY(-0.1rem);
}

/* DESKTOP */
@media (min-width: 901px) {
  .center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    flex: none;
    width: max-content;
    z-index: 5;
  }

  .fa-whatsapp {
    color: green !important;
  }
}

/* MOBILE */
@media (max-width: 900px) {
  .topbar {
    flex-direction: column;
    text-align: center;
    padding: clamp(0.7rem, 3vw, 1.2rem) clamp(1rem, 4vw, 1.6rem);
    gap: clamp(0.35rem, 2vw, 0.7rem);
  }

  .left,
  .right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .logo {
    max-height: clamp(3rem, 8vw, 3.8rem);
  }

  .fa-whatsapp {
    color: green !important;
  }
}
</style>