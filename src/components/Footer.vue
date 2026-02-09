<template>
  <footer class="footer" :style="{ fontFamily: settings?.font_family || 'inherit' }">
    <div class="divider" :style="{ backgroundColor: settings?.tertiary_color || '#0f8a3a' }"></div>

    <div class="wrapper">
      <div class="grid">
        <!-- LOGO / BRAND -->
        <div class="col brand">
          <img v-if="settings?.logo_web" :src="settings.logo_web" class="logo" alt="Logo" />
          <div v-else class="brandName">{{ settings?.meta_title || settings?.company_name || "" }}</div>

          <p v-if="settings?.meta_description" class="brandDesc">
            {{ settings.meta_description }}
          </p>
        </div>

        <!-- SEDE / CONTATTI -->
        <div class="col info">
          <h3 class="h">Sede</h3>

          <ul class="list">
            <li v-if="settings?.contact_address" class="row">
              <span class="icon"><i class="fa-solid fa-location-dot"></i></span>
              <span class="text">{{ settings.contact_address }}</span>
            </li>

            <li v-if="settings?.contact_phone" class="row">
              <span class="icon"><i class="fa-solid fa-phone"></i></span>
              <a class="link" :href="`tel:${settings.contact_phone}`">{{ settings.contact_phone }}</a>
            </li>

            <li v-if="settings?.contact_email" class="row">
              <span class="icon"><i class="fa-solid fa-envelope"></i></span>
              <a class="link" :href="`mailto:${settings.contact_email}`">{{ settings.contact_email }}</a>
            </li>
          </ul>

          <a
            v-if="settings?.contact_address"
            class="mapsLink"
            :href="mapsHref"
            target="_blank"
            rel="noopener"
            aria-label="Indicazioni"
          >
            <i class="fa-solid fa-diamond-turn-right"></i>
            <span>Indicazioni</span>
          </a>
        </div>

        <!-- LEGAL -->
        <div class="col legal">
          <h3 class="h">Legal</h3>

          <div class="legalLinks" v-if="showLegalLinks">
            <a v-if="privacyLink" :href="privacyLink" target="_blank" rel="noopener">Privacy</a>
            <a v-if="cookieLink" :href="cookieLink" target="_blank" rel="noopener">Cookie Policy</a>

            <button v-if="showPrefs" class="prefsLink" @click="openCookieBanner">
              Preferenze cookie
            </button>
          </div>

          <p v-else class="muted">Nessun link legale configurato.</p>
        </div>

        <!-- SOCIAL -->
        <div class="col social">
          <h3 class="h">Seguici</h3>

          <div class="socialRow">
            <a v-if="settings?.facebook_url" :href="settings.facebook_url" target="_blank" rel="noopener" aria-label="Facebook">
              <i class="fa-brands fa-facebook"></i>
            </a>
            <a v-if="settings?.instagram_url" :href="settings.instagram_url" target="_blank" rel="noopener" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a v-if="settings?.tiktok_url" :href="settings.tiktok_url" target="_blank" rel="noopener" aria-label="TikTok">
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a v-if="settings?.youtube_url" :href="settings.youtube_url" target="_blank" rel="noopener" aria-label="YouTube">
              <i class="fa-brands fa-youtube"></i>
            </a>
            <a v-if="settings?.linkedin_url" :href="settings.linkedin_url" target="_blank" rel="noopener" aria-label="LinkedIn">
              <i class="fa-brands fa-linkedin"></i>
            </a>
            <a v-if="settings?.x_url" :href="settings.x_url" target="_blank" rel="noopener" aria-label="X">
              <i class="fa-brands fa-x-twitter"></i>
            </a>
            <a v-if="settings?.whatsapp_url" :href="settings.whatsapp_url" target="_blank" rel="noopener" aria-label="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- ORARI -->
    <div v-if="showOpeningHours && openingHours.length >= 2" class="wrapper">
      <div class="hours-panel">
        <div class="hours-grid">
          <div class="hours-box">
            <h3 class="hours-title">{{ openingHours?.[0]?.title }}</h3>
            <div v-for="(row, i) in openingHours[0]?.rows || []" :key="'s-' + i" class="hours-line">
              <span class="h-day">{{ row.day }}:</span>
              <span class="h-am">{{ (row.time.split('/')[0] || '').trim() }}</span>
              <span class="h-pm">{{ (row.time.split('/')[1] || '').trim() }}</span>
            </div>
          </div>

          <div class="hours-box">
            <h3 class="hours-title">{{ openingHours[1]?.title }}</h3>
            <div v-for="(row, i) in openingHours[1]?.rows || []" :key="'v-' + i" class="hours-line">
              <span class="h-day">{{ row.day }}:</span>
              <span class="h-am">{{ (row.time.split('/')[0] || '').trim() }}</span>
              <span class="h-pm">{{ (row.time.split('/')[1] || '').trim() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="bottomBar">
      <div class="wrapper bottomInner">
        <div class="bottomLeft">
          <span class="dotSep" v-if="privacyLink || cookieLink || showPrefs">
            <a v-if="privacyLink" :href="privacyLink" target="_blank" rel="noopener">Privacy</a>
            <span v-if="privacyLink && cookieLink" class="dot">·</span>
            <a v-if="cookieLink" :href="cookieLink" target="_blank" rel="noopener">Cookie</a>
            <span v-if="(privacyLink || cookieLink) && showPrefs" class="dot">·</span>
            <button v-if="showPrefs" class="prefsLinkInline" @click="openCookieBanner">Preferenze</button>
          </span>
        </div>

        <div class="bottomRight">
          <span>{{ settings?.footer_text || "" }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
    import { computed, onMounted } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const props = defineProps({ settings: Object });

    const route = useRoute();
    const tenant = useTenantStore();
    const slug = computed(() => route.params.slug || tenant.slug);

    const compliance = computed(() => tenant.compliance || null);

    const iubendaCfg = computed(() => {
        const c = compliance.value;
        if (!c?.enabled) return null;
        if (c?.provider !== "iubenda") return null;
        const cfg = c?.config || {};
        const privacyId = cfg.privacy_policy_id;
        const cookieId = cfg.cookie_policy_id;
        if (!privacyId && !cookieId) return null;
        return { lang: cfg.lang || "it", privacyId: privacyId || null, cookieId: cookieId || null };
    });

    const privacyLink = computed(() => {
        const cfg = iubendaCfg.value;
        if (!cfg?.privacyId) return null;
        return `https://www.iubenda.com/privacy-policy/${cfg.privacyId}`;
    });

    const cookieLink = computed(() => {
        const cfg = iubendaCfg.value;
        if (cfg?.cookieId) return `https://www.iubenda.com/privacy-policy/${cfg.cookieId}/cookie-policy`;
        if (cfg?.privacyId) return `https://www.iubenda.com/privacy-policy/${cfg.privacyId}/cookie-policy`;
        return null;
    });

    const showPrefs = computed(() => !!iubendaCfg.value);
    const showLegalLinks = computed(() => !!privacyLink.value || !!cookieLink.value || !!showPrefs.value);

    const openCookieBanner = () => {
        if (!iubendaCfg.value) return;
        if (typeof window === "undefined") return;

        try {
            const el =
                document.querySelector("button.iubenda-cs-preferences-link") ||
                document.querySelector(".iubenda-cs-preferences-link") ||
                document.querySelector("[class*='iubenda-cs-preferences-link']");

            if (el && typeof el.click === "function") {
                el.click();
                return;
            }

            const api = window._iub?.cs?.api;
            if (api && typeof api.openPreferences === "function") {
                api.openPreferences();
                return;
            }

            window.dispatchEvent(new Event("cookie-banner-open"));
        } catch (e) {
            console.warn("[Footer] openCookieBanner failed:", e);
        }
    };

    const openingHours = computed(() => {
        const raw = props.settings?.opening_hours;
        return Array.isArray(raw) ? raw : [];
    });

    const showOpeningHours = computed(() => {
        if (typeof window === "undefined") return false;
        const p = String(window.location.pathname || "").toLowerCase();
        const s = String(slug.value || "").toLowerCase();
        return (s && p.includes(`/index/${s}`)) || p.includes(`/${s}`);
    });

    const mapsHref = computed(() => {
        const addr = props.settings?.contact_address;
        if (!addr) return "#";
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    });

    onMounted(() => { });
</script>

<style scoped>
.footer {
  width: 100%;
  background: #f7f7f7;
}

.divider {
  width: 100%;
  height: 0.25rem;
}

.wrapper {
  width: 100%;
  max-width: 96rem;
  margin: 0 auto;
  padding-left: max(1rem, 1.5vw);
  padding-right: max(1rem, 1.5vw);
  box-sizing: border-box;
}

.grid {
  padding: clamp(1.4rem, 3.5vw, 2.2rem) 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.2rem, 3vw, 2rem);
  text-align: left;              /* ✅ allineamento base */
  align-items: start;            /* ✅ stessa baseline */
}

.col {
  min-width: 0;
}

/* BRAND */
.logo {
  max-height: clamp(2.4rem, 5vw, 3.2rem);
  display: block;
  object-fit: contain;
}

.brandName {
  font-weight: 900;
  font-size: 1.1rem;
}

.brandDesc {
  margin: 0.65rem 0 0;
  max-width: 52ch;
  opacity: 0.8;
  line-height: 1.55;
  font-size: 0.95rem;
}

/* HEADERS */
.h {
  margin: 0 0 0.85rem;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

/* CONTACT LIST (icone pulite, NO cerchio) */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.row {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 0.7rem;
  align-items: start;
}

.icon {
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon i {
  font-size: 1rem;
  color: var(--accent, #0f8a3a);
  opacity: 0.95;
  line-height: 1;
}

.text {
  line-height: 1.5;
  opacity: 0.92;
}

.link {
  line-height: 1.5;
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
  width: fit-content;
}

.link:hover {
  opacity: 0.7;
}

/* INDICAZIONI (link testuale, no pill) */
.mapsLink {
  margin-top: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: inherit;
  text-decoration: underline;
  font-weight: 700;
  opacity: 0.92;
}

.mapsLink i {
  color: var(--accent, #0f8a3a);
}

.mapsLink:hover {
  opacity: 0.7;
}

/* LEGAL */
.legalLinks {
  display: grid;
  gap: 0.55rem;
}

.legalLinks a {
  color: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.prefsLink {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  opacity: 0.9;
  text-align: left;
}

.prefsLink:hover,
.legalLinks a:hover {
  opacity: 0.7;
}

.muted {
  opacity: 0.65;
  margin: 0;
}

/* SOCIAL (NO cerchi) */
.socialRow {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.socialRow a {
  color: #222;
  text-decoration: none;
  transition: 0.2s ease;
  line-height: 1;
}

.socialRow a:hover {
  opacity: 0.65;
  transform: translateY(-1px);
}

.socialRow i {
  font-size: 1.55rem;
}

.fa-whatsapp {
  color: #18a957 !important;
}

/* HOURS */
.hours-panel {
  padding: 0 0 clamp(1.2rem, 3vw, 1.6rem);
}

.hours-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.4rem, 3vw, 2.2rem);
}

.hours-title {
  margin: 0 0 0.7rem;
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  font-weight: 900;
  line-height: 1.15;
}

.hours-line {
  display: grid;
  grid-template-columns: 5.8rem 1fr 1fr;
  column-gap: 1.1rem;
  align-items: baseline;
  margin: 0.28rem 0;
  font-size: clamp(0.82rem, 1.6vw, 0.95rem);
}

.h-am,
.h-pm {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.h-pm:empty {
  display: none;
}

/* BOTTOM BAR */
.bottomBar {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #efefef;
  padding: 0.75rem 0;
}

.bottomInner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  text-align: center;
  font-size: 0.9rem;
}

.dot {
  opacity: 0.6;
  margin: 0 0.35rem;
}

.prefsLinkInline {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.prefsLinkInline:hover {
  opacity: 0.7;
}

/* DESKTOP */
@media (min-width: 64rem) {
  .grid {
    grid-template-columns: 1.2fr 1.2fr 0.9fr 0.7fr;
  }

  .hours-grid {
    grid-template-columns: 1fr 1fr;
  }

  .bottomInner {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
}
</style>
