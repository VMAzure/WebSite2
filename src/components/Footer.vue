<template>
  <footer class="footer" :style="{ fontFamily: settings.font_family }">
    <!-- LINEA SUPERIORE COLORATA -->
    <div
      class="divider"
      :style="{ backgroundColor: settings.tertiary_color }"
    ></div>

    <!-- CONTENUTO -->
    <div class="wrapper">
      <div class="content">
        <!-- LOGO -->
        <div class="col logo-col">
          <img
            v-if="settings.logo_web"
            :src="settings.logo_web"
            class="logo"
            alt="Logo"
          />
        </div>

        <!-- INFO -->
        <div class="col info-col">
          <h3>Sede</h3>

          <p v-if="settings.contact_address">{{ settings.contact_address }}</p>

          <p v-if="settings.contact_phone">
            Telefono: <strong>{{ settings.contact_phone }}</strong>
          </p>

          <p v-if="settings.contact_email">
            Email: <strong>{{ settings.contact_email }}</strong>
          </p>

          <div class="legal-links" v-if="showLegalLinks">
            <a
              v-if="privacyLink"
              :href="privacyLink"
              target="_blank"
              rel="noopener"
              >Privacy</a
            >

            <span v-if="privacyLink && cookieLink" class="dot">·</span>
            <a
              v-if="cookieLink"
              :href="cookieLink"
              target="_blank"
              rel="noopener"
              >Cookie Policy</a
            >

            <span v-if="(privacyLink || cookieLink) && showPrefs" class="dot"
              >·</span
            >
            <button
              v-if="showPrefs"
              class="prefs-link"
              @click="openCookieBanner"
            >
              Preferenze cookie
            </button>
          </div>
        </div>

        <!-- MAPPA -->
        <div
          class="col map-col footer-map"
          v-if="settings.contact_address && canShowMap"
        >
          <div :id="mapId" class="map-frame"></div>
        </div>

        <div
          class="col map-col footer-map"
          v-else-if="settings.contact_address"
        >
          <div
            class="map-frame map-placeholder"
            role="button"
            tabindex="0"
            @click="openCookieBanner"
            @keydown.enter.prevent="openCookieBanner"
            @keydown.space.prevent="openCookieBanner"
          >
            Per visualizzare la mappa devi accettare i cookie.
            <span class="map-cta">Apri preferenze</span>
          </div>
        </div>

        <!-- SOCIAL -->
        <div class="col social-col">
          <a
            v-if="settings.facebook_url"
            :href="settings.facebook_url"
            target="_blank"
          >
            <i class="fa-brands fa-facebook"></i>
          </a>
          <a
            v-if="settings.instagram_url"
            :href="settings.instagram_url"
            target="_blank"
          >
            <i class="fa-brands fa-instagram"></i>
          </a>
          <a
            v-if="settings.tiktok_url"
            :href="settings.tiktok_url"
            target="_blank"
          >
            <i class="fa-brands fa-tiktok"></i>
          </a>
          <a
            v-if="settings.youtube_url"
            :href="settings.youtube_url"
            target="_blank"
          >
            <i class="fa-brands fa-youtube"></i>
          </a>
          <a
            v-if="settings.linkedin_url"
            :href="settings.linkedin_url"
            target="_blank"
          >
            <i class="fa-brands fa-linkedin"></i>
          </a>
          <a v-if="settings.x_url" :href="settings.x_url" target="_blank">
            <i class="fa-brands fa-x-twitter"></i>
          </a>
          <a
            v-if="settings.whatsapp_url"
            :href="settings.whatsapp_url"
            target="_blank"
          >
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- ORARI (sezione separata, NON schiaccia il footer) -->
    <div v-if="showOpeningHours && openingHours.length >= 2" class="wrapper">
      <div class="hours-panel">
        <div class="hours-grid">
          <div class="hours-box">
            <h3 class="hours-title">{{ openingHours?.[0]?.title }}</h3>
            <div
              v-for="(row, i) in openingHours[0]?.rows || []"
              :key="'s-' + i"
              class="hours-line"
            >
              <span class="h-day">{{ row.day }}:</span>
              <span class="h-am">{{
                (row.time.split("/")[0] || "").trim()
              }}</span>
              <span class="h-pm">{{
                (row.time.split("/")[1] || "").trim()
              }}</span>
            </div>
          </div>

          <div class="hours-box">
            <h3 class="hours-title">{{ openingHours[1]?.title }}</h3>
            <div
              v-for="(row, i) in openingHours[1]?.rows || []"
              :key="'v-' + i"
              class="hours-line"
            >
              <span class="h-day">{{ row.day }}:</span>
              <span class="h-am">{{
                (row.time.split("/")[0] || "").trim()
              }}</span>
              <span class="h-pm">{{
                (row.time.split("/")[1] || "").trim()
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COPYRIGHT -->
    <div class="copyright">
      <p>{{ settings.footer_text }}</p>
    </div>
  </footer>
</template>

<script setup="">
    import { onMounted, onUnmounted, computed, ref, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const props = defineProps({
        settings: Object,
    });

    const route = useRoute();
    const tenant = useTenantStore();
    const slug = computed(() => route.params.slug || tenant.slug);

    // ✅ compliance dal tenant store (caricata via bootstrapTenant)
    const compliance = computed(() => tenant.compliance || null);

    const iubendaCfg = computed(() => {
        const c = compliance.value;
        if (!c?.enabled) return null;
        if (c?.provider !== "iubenda") return null;
        const cfg = c?.config || {};

        const privacyId = cfg.privacy_policy_id;
        const cookieId = cfg.cookie_policy_id;

        if (!privacyId && !cookieId) return null;

        return {
            lang: cfg.lang || "it",
            privacyId: privacyId || null,
            cookieId: cookieId || null,
        };
    });

    // ✅ link reali Iubenda (solo se esistono gli id)
    const privacyLink = computed(() => {
        const cfg = iubendaCfg.value;
        if (!cfg?.privacyId) return null;
        return `https://www.iubenda.com/privacy-policy/${cfg.privacyId}`;
    });

    const cookieLink = computed(() => {
        const cfg = iubendaCfg.value;
        if (!cfg?.privacyId) return null;
        return `https://www.iubenda.com/privacy-policy/${cfg.privacyId}/cookie-policy`;
    });

    // ✅ mostra blocco solo se c’è qualcosa di valido da mostrare
    const showPrefs = computed(() => !!iubendaCfg.value); // preferenze solo se CMP attiva
    const showLegalLinks = computed(
        () => !!privacyLink.value || !!cookieLink.value || !!showPrefs.value,
    );

    // consenso reattivo
    // consenso reattivo (safe anche se slug parte vuoto)
    const consent = ref(null);

    const refreshConsent = async () => {
        if (typeof window === "undefined") return;

        try {
            // 1) compat: tua funzione custom (se esiste)
            if (typeof window.getConsent === "function") {
                consent.value = window.getConsent(slug.value);
                return;
            }

            const api = window._iub?.cs?.api;
            if (!api) {
                consent.value = null;
                return;
            }

            // 2) prova a ottenere preferenze/consenso (sync o async)
            let prefs = null;

            if (typeof api.getPreferences === "function") prefs = api.getPreferences();
            else if (typeof api.getConsent === "function") prefs = api.getConsent();

            if (prefs && typeof prefs.then === "function") {
                prefs = await prefs;
            }

            // 3) estrazione “elastica” dei purposes
            const purposes =
                prefs?.purposes ||
                prefs?.preferences?.purposes ||
                prefs?.consent?.purposes ||
                null;

            const hasAnyPurposeTrue =
                purposes && typeof purposes === "object"
                    ? Object.values(purposes).some((v) => v === true)
                    : false;

            const hasConsentFlag =
                prefs?.consent === true ||
                prefs?.consent_given === true ||
                prefs?.consentGiven === true;

            consent.value = {
                third_party: Boolean(hasConsentFlag || hasAnyPurposeTrue),
            };
        } catch (e) {
            console.warn("[Footer] refreshConsent error:", e);
            consent.value = null;
        }
    };

    const openingHours = computed(() => {
        const raw = props.settings?.opening_hours;
        return Array.isArray(raw) ? raw : [];
    });

    const openCookieBanner = () => {
        if (!iubendaCfg.value) return;
        if (typeof window === "undefined") return;

        try {
            // 1) fallback più affidabile: click sul bottone che Iubenda inietta
            const el =
                document.querySelector("button.iubenda-cs-preferences-link") ||
                document.querySelector(".iubenda-cs-preferences-link") ||
                document.querySelector("[class*='iubenda-cs-preferences-link']");

            if (el && typeof el.click === "function") {
                el.click();
                // dopo l'apertura, riprova a leggere consenso
                setTimeout(refreshConsent, 300);
                setTimeout(refreshConsent, 1200);
                return;
            }

            // 2) API Iubenda (se disponibile)
            const api = window._iub?.cs?.api;
            if (api && typeof api.openPreferences === "function") {
                api.openPreferences();
                setTimeout(refreshConsent, 300);
                setTimeout(refreshConsent, 1200);
                return;
            }

            // 3) ultimo fallback: evento custom (se lo gestisci altrove)
            window.dispatchEvent(new Event("cookie-banner-open"));
        } catch (e) {
            console.warn("[Footer] openCookieBanner failed:", e);
        }
    };

    watch(slug, refreshConsent, { immediate: true });

    onMounted(() => {
        window.addEventListener("cookie-consent-changed", refreshConsent);

        // ✅ Iubenda carica async: riprova un paio di volte
        refreshConsent();
        setTimeout(refreshConsent, 300);
        setTimeout(refreshConsent, 1200);
    });

    onUnmounted(() => {
        window.removeEventListener("cookie-consent-changed", refreshConsent);
    });

    // ✅ questa è la variabile che decide se la mappa può esistere
    const canShowMap = computed(() => !!consent.value?.third_party);

    const showOpeningHours = computed(() => {
        if (typeof window === "undefined") return false;

        const p = String(window.location.pathname || "").toLowerCase();
        const s = String(slug.value || "").toLowerCase();

        return (s && p.includes(`/index/${s}`)) || p.includes(`/${s}`);
    });

    // ID mappa univoco (evita conflitti quando cambi slug)
    const mapId = computed(
        () => `dealer-map-${props.settings?.google_place_id || "default"}`,
    );

    // ✅ icona marker: prende SEMPRE avatar_url dallo slug (fallback su logo_web)
    const markerUrl = computed(() => {
        return props.settings?.avatar_url || props.settings?.logo_web || "";
    });

    // 🔧 crea icona dealer (per ora size fisso, lo rendiamo “zoom-aware” nello step 2)
    const makeDealerIcon = (size = 44) => {
        if (typeof L === "undefined") return null;
        return L.divIcon({
            className: "dealer-marker-wrapper",
            html: `
      <div class="dealer-marker-inner" style="width:${size}px;height:${size}px">
        <img src="${markerUrl.value}" alt="Dealer marker" />
      </div>
    `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2], // centrato
            popupAnchor: [0, -size / 2],
        });
    };

    // 🔍 dimensione marker in base allo zoom
    const sizeByZoom = (z) => {
        if (z >= 16) return 100; // massimo (leggibile)
        if (z === 15) return 64;
        if (z === 14) return 60;
        if (z === 13) return 56;
        if (z === 12) return 50;
        return 48; // molto zoom-out: piccolo per vedere strade
    };
    // evita di reinizializzare la mappa più volte
    const mapInstance = ref(null);
    const markerInstance = ref(null);
    let currentSize = 0;

    let LeafletMod = null;

    const loadLeaflet = async () => {
        if (LeafletMod) return LeafletMod;
        const mod = await import("leaflet");
        LeafletMod = mod.default || mod;
        return LeafletMod;
    };

    const initMap = async () => {
        if (typeof window === "undefined") return;

        const L = await loadLeaflet();
        if (!L) {
            console.warn("[Footer] Leaflet import failed, skip map");
            return;
        }

        if (!props.settings?.contact_address) return;
        if (!canShowMap.value) return;
        if (mapInstance.value) return;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            props.settings.contact_address,
        )}`;

        const r = await fetch(url);
        const json = await r.json();
        if (!json || !json[0]) return;

        const { lat, lon } = json[0];
        const mapElement = document.getElementById(mapId.value);
        if (!mapElement) return;

        mapElement.innerHTML = "";

        const map = L.map(mapId.value, { zoomControl: true }).setView([lat, lon], 16);
        mapInstance.value = map;

        currentSize = sizeByZoom(map.getZoom());

        const icon = makeDealerIcon(currentSize);
        const marker = L.marker([lat, lon], icon ? { icon } : {})
            .addTo(map)
            .bindPopup(props.settings.contact_address);

        markerInstance.value = marker;

        map.on("zoomend", () => {
            const z = map.getZoom();
            const newSize = sizeByZoom(z);
            if (newSize === currentSize) return;
            currentSize = newSize;
            const newIcon = makeDealerIcon(currentSize);
            if (newIcon) marker.setIcon(newIcon);
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap",
        }).addTo(map);
    };

    // quando diventa true (accetti cookie), parte la mappa
    watch(
        canShowMap,
        (ok) => {
            if (ok) initMap();
        },
        { immediate: true },
    );
</script>

<style scoped="">
/* ================================================
	FOOTER PREMIUM
	================================================ */
.footer {
  width: 100%;
  background-color: #f7f7f7;
  padding-bottom: 0.6rem;
}


.divider {
  width: 100%;
  height: 0.25rem;
}

/* WRAPPER */
.wrapper {
  width: 100%;
  max-width: 96rem;                 /* ✅ allineato alle pagine wide */
  margin: 0 auto;

  /* ✅ filo di bordo SEMPRE (come abbiamo fatto sulle sezioni) */
  padding-left: max(1rem, 1.5vw);
  padding-right: max(1rem, 1.5vw);

  box-sizing: border-box;
}


.content {
  width: 100%;
  padding: clamp(1.6rem, 4vw, 2.2rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1.6rem, 4vw, 2.2rem);
  text-align: center;
}

.col {
  width: 100%;
}

/* LOGO */
.logo {
  max-height: clamp(2.4rem, 5vw, 3.2rem);
  margin: 0 auto;
  display: block;
  object-fit: contain;
}

/* INFO */
.info-col h3 {
  margin-bottom: 0.4rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 700;
}

.info-col p {
  margin: 0.25rem 0;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
}

.maps-link {
  margin-top: 0.4rem;
  display: inline-block;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  color: var(--secondary, #0077cc);
  transition: 0.2s;
}
.maps-link:hover {
  opacity: 0.7;
}

/* MAPPA */
.map-frame {
  width: 100%;
  height: 15rem;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 0.05rem solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.12);
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  padding: clamp(0.9rem, 2vw, 1.4rem);
  font-family: inherit; /* prende settings.font_family dal footer */
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  font-weight: 400;
  opacity: 0.85;

  cursor: pointer; /* perché sarà cliccabile */
  user-select: none;
}
.map-placeholder:hover {
  opacity: 1;
}
.map-cta {
  margin-left: 0.35rem;
  text-decoration: underline;
  font-weight: 400;
}

/* SOCIAL */
.social-col {
  display: flex;
  justify-content: center;
  gap: clamp(0.8rem, 2vw, 1.4rem);
}

.social-col a {
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  color: var(--secondary, #222);
  transition: 0.25s ease;
}
.social-col a:hover {
  opacity: 0.55;
  transform: translateY(-0.1rem);
}

/* COPYRIGHT */
.copyright {
  text-align: center;
  padding: 0.7rem 0 0.5rem;
  font-size: clamp(0.75rem, 1.6vw, 0.9rem);
  border-top: 0.05rem solid #ddd;
  background-color: #efefef;
}

/* DESKTOP */
@media (min-width: 64rem) {
  .content {
    flex-direction: row;
    justify-content: flex-start; /* ✅ niente buchi casuali */
    gap: clamp(1.2rem, 2vw, 2rem); /* ✅ spacing controllato */
    text-align: left;
  }

  .col {
    flex: 1;
  }

  .logo {
    margin: 0;
  }

  .social-col {
    justify-content: flex-end;
  }

  .map-frame {
    height: 17rem;
  }
}
/* ===== ORARI: sezione separata sotto il footer ===== */
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
  font-weight: 800;
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

@media (min-width: 64rem) {
  .hours-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* (opzionale ma utile) evitare che le colonne del footer si schiaccino */
@media (min-width: 64rem) {
  .logo-col {
    flex: 0.9;
  }
  .info-col {
    flex: 1.2;
  }
  .map-col {
    flex: 1.4;
  }
  .social-col {
    flex: 0.6;
  }
}

:deep(.dealer-marker-inner) {
  width: 55px;
  height: 55px;
  background: transparent;
  border-radius: 0.45rem;
  padding: 0.25rem;
  box-shadow: 0 0.3rem 0.6rem rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fa-whatsapp {
  color: green !important;
}

:deep(.dealer-marker-inner img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.legal-links {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.45rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-size: clamp(0.85rem, 1.6vw, 0.95rem);
  opacity: 0.9;
}

@media (min-width: 64rem) {
  .legal-links {
    justify-content: flex-start;
  }
}

.legal-links a {
  color: inherit;
  text-decoration: underline;
  font-weight: 400;
}

.dot {
  opacity: 0.6;
}

.prefs-link {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  font-weight: 400;
  opacity: 0.95;
}
.prefs-link:hover {
  opacity: 1;
}

/* Leaflet deve stare sopra il canvas della mappa (ma sotto la navbar) */
:deep(.footer-map .leaflet-container) {
  position: relative;
  z-index: 1;
}

:deep(.footer-map .leaflet-control-container) {
  z-index: 2;
}
</style>
