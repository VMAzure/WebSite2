<!-- src/pages/NbtPage.vue -->
<template>
  <section
    class="nbt"
    :style="{
      fontFamily: settings?.font_family || 'inherit',
      '--accent': settings?.tertiary_color || '#0f8a3a',
    }"
  >
    <header class="head">
      <h2 class="title">Noleggio da 1 a 30 giorni</h2>
    </header>

    <!-- =========================
         UX SOPRA (SOLO come funziona)
         ========================= -->
    <section
      v-if="hasNbtUx && nbtUx?.howItWorks?.length"
      class="nbtUx nbtUxTop"
      aria-label="Come funziona il noleggio breve termine"
    >
      <div class="uxBox">
        <div class="uxBlock">
          <h3 class="uxTitle">Come funziona</h3>

          <div class="uxSteps">
            <div v-for="(s, i) in nbtUx.howItWorks" :key="i" class="uxStep">
              <div class="uxStepN">{{ i + 1 }}</div>
              <div class="uxStepTxt">
                <div class="uxStepT">{{ s.title }}</div>
                <div v-if="s.text" class="uxStepD">{{ s.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="state">Caricamento…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else>
      <div v-if="!items.length" class="state">Nessuna disponibilità al momento.</div>

      <!-- CARD CATEGORIE (con retro tariffe) -->
      <div v-else class="grid">
        <article
          v-for="it in items"
          :key="it.id || it.key || it.name || JSON.stringify(it)"
          class="card"
        >
          <div class="cardFlip" :class="{ flipped: activeDetailsKey === cardKey(it) }">
            <div class="cardInner">
              <!-- FRONT -->
              <div class="cardFace cardFront cardFacePad" aria-hidden="false">
                <img
                  v-if="it.nbt_cat_img"
                  class="cardImg"
                  :src="it.nbt_cat_img"
                  :alt="it.nbt_cat || 'NBT'"
                />

                <div class="cardBody">
                  <div class="cardTop">
                    <h3 class="cardTitle">{{ it.nbt_cat || it.title || it.name || "Opzione" }}</h3>

                    <button
                      class="detailsBtn"
                      type="button"
                      @click="toggleDetails(it)"
                      :aria-expanded="activeDetailsKey === cardKey(it)"
                    >
                      Dettagli
                    </button>
                  </div>

                  <p v-if="it.descrizione || it.subtitle || it.description" class="cardDesc">
                    {{ it.descrizione || it.subtitle || it.description }}
                  </p>

                  <div class="cardActions">
                    <button class="btn" type="button" @click="openRequest(it)">Calcola Canone</button>
                  </div>
                </div>
              </div>

              <!-- BACK (tariffe) -->
              <div class="cardFace cardBack cardFacePad" aria-hidden="false">
                <div class="cardBody">
                  <div class="cardTop">
                    <h3 class="cardTitle">{{ it.nbt_cat || "Categoria" }}</h3>

                    <button class="detailsBtn" type="button" @click="toggleDetails(it)">
                      Indietro
                    </button>
                  </div>

                  <div class="tariffeHead">
                    <div class="tariffeFranchigia" v-if="it.franchigia != null">
                      Franchigia:
                      <strong :style="{ color: settings?.tertiary_color || '#0f8a3a' }">
                        € {{ eurInt(it.franchigia) }}
                      </strong>
                    </div>
                  </div>

                  <div class="tariffeGrid">
                    <div class="r">
                      <div class="k">Giorno</div>
                      <div class="v">€ {{ eurInt(it.costo_d) }}</div>
                      <div class="s">/ {{ Number(it.km_d || 0) }} km</div>
                    </div>

                    <div class="r">
                      <div class="k">Settimana</div>
                      <div class="v">€ {{ eurInt(it.costo_w) }}</div>
                      <div class="s">/ {{ Number(it.km_w || 0) }} km</div>
                    </div>

                    <div class="r">
                      <div class="k">Mese</div>
                      <div class="v">€ {{ eurInt(it.costo_m) }}</div>
                      <div class="s">/ {{ Number(it.km_m || 0) }} km</div>
                    </div>
                  </div>

                  <div class="cardActions">
                    <button class="btn" type="button" @click="openRequest(it)">Calcola Canone</button>

                    <button class="btn" type="button" @click="openContactFromCard(it)">
                      Contattaci!
                    </button>
                  </div>
                </div>
              </div>
              <!-- /BACK -->
            </div>
          </div>
        </article>
      </div>

      <!-- =========================
           SOTTO LE CARD:
           - SINISTRA: "Cosa è incluso" + CTA sotto
           - DESTRA: MAPPA
           ========================= -->
      <section
        v-if="hasNbtUx && (nbtUx?.included?.length || nbtUx?.cta)"
        class="nbtUx nbtUxBottom"
        aria-label="Informazioni e richiesta"
      >
        <div class="uxBox">
          <div class="uxBottomGrid">
            <!-- COLONNA SINISTRA -->
            <div class="uxLeftCol">
              <div v-if="nbtUx?.included?.length" class="uxBlock">
                <h3 class="uxTitle">Cosa è incluso</h3>
                <ul class="uxList">
                  <li v-for="(x, i) in nbtUx.included" :key="i">{{ x }}</li>
                </ul>
              </div>

              <div v-if="nbtUx?.cta" class="ctaLeft">
                <h3 class="uxTitle">{{ nbtUx.cta.title }}</h3>
                <p v-if="nbtUx.cta.text" class="uxDesc">{{ nbtUx.cta.text }}</p>

                <div class="uxCtaActions">
                  <!-- ✅ tolto bottone Indicazioni -->

                  <button class="btn" type="button" @click="openContactFromCta">
                    {{ nbtUx.cta.buttonLabel || "Invia Richiesta" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- COLONNA DESTRA: SOLO MAPPA -->
            <div class="uxRightCol">
              <div class="ctaMap" aria-label="Mappa sede">
                <iframe
                  v-if="mapSrc"
                  class="ctaMapFrame"
                  :src="mapSrc"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Mappa"
                />
                <div v-else class="ctaMapEmpty">
                  Mappa non configurata: aggiungi <strong>map_embed_url</strong> oppure
                  <strong>contact_address</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL CONTATTO -->
      <div v-if="isContactOpen" class="backdrop" @click.self="closeContact">
        <div class="modal" role="dialog" aria-modal="true">
          <header class="modalHead">
            <div class="modalTitle">Invia richiesta</div>
            <button class="x" type="button" aria-label="Chiudi" @click="closeContact">✕</button>
          </header>

          <div class="modalBody">
            <div class="row">
              <label class="field">
                <span>Nome</span>
                <input v-model.trim="contact.nome" type="text" autocomplete="given-name" />
              </label>

              <label class="field">
                <span>Cognome</span>
                <input v-model.trim="contact.cognome" type="text" autocomplete="family-name" />
              </label>
            </div>

            <div class="row">
              <label class="field">
                <span>Email</span>
                <input
                  v-model.trim="contact.email"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                />
              </label>

              <label class="field">
                <span>Telefono</span>
                <input
                  v-model.trim="contact.telefono"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                />
              </label>
            </div>

            <label class="field">
              <span>Messaggio</span>
              <textarea v-model.trim="contact.messaggio" rows="4"></textarea>
            </label>

            <div class="modalActions">
              <button
                class="btn"
                type="button"
                @click="submitContact"
                :disabled="contactLoading || !isContactValid"
              >
                {{ contactLoading ? "Invio…" : "Invia richiesta" }}
              </button>
            </div>

            <div v-if="contactError" class="err">{{ contactError }}</div>
            <div v-if="contactOk" class="ok">{{ contactOk }}</div>
          </div>
        </div>
      </div>
      <!-- /MODAL CONTATTO -->
    </div>

    <!-- MODAL RICHIESTA NOLEGGIO -->
    <div v-if="isOpen" class="backdrop" @click.self="closeRequest">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modalHead">
          <div class="modalTitle">{{ selected?.nbt_cat || "Richiesta noleggio" }}</div>
          <button class="x" type="button" aria-label="Chiudi" @click="closeRequest">✕</button>
        </header>

        <div class="modalBody">
          <div class="row">
            <label class="field">
              <span>Data inizio</span>
              <input v-model="form.startDate" type="date" />
            </label>

            <label class="field">
              <span>Data fine</span>
              <input v-model="form.endDate" type="date" />
            </label>
          </div>

          <div v-if="calcResult" class="hint">
            <div><strong>Noleggio selezionato</strong></div>
            <div>
              {{ calcResult.days }} giorni con {{ calcResult.kmIncluded }} km totali inclusi
              <span v-if="calcResult.label === 'settimana'"> (tariffa settimanale)</span>
              <span v-else-if="calcResult.label === 'mese'"> (tariffa mensile)</span>
            </div>
          </div>

          <label class="field">
            <span>Km extra</span>
            <input v-model.number="form.extraKm" type="number" min="0" />
          </label>

          <label class="check">
            <input v-model="form.additionalDrivers" type="checkbox" />
            Servono altri conducenti autorizzati
          </label>

          <label class="check">
            <input v-model="form.cancelFranchise" type="checkbox" />
            Voglio annullare la franchigia
          </label>

          <div v-if="selected?.franchigia != null" class="hint">
            Franchigia danni: <strong>€ {{ eurInt(selected.franchigia) }}</strong>
          </div>

          <div class="modalActions">
            <button class="btn" type="button" @click="calcTotal" :disabled="calcLoading">
              {{ calcLoading ? "Calcolo…" : "Calcola Totale" }}
            </button>
          </div>

          <div v-if="calcError" class="err">{{ calcError }}</div>

          <div v-if="calcResult" class="ok">
            <div>Periodo selezionato: <strong>{{ calcResult.days }}</strong> giorni</div>
            <div>Tariffa base: <strong>€ {{ calcResult.base.toFixed(2) }}</strong></div>
            <div>Extra: <strong>€ {{ calcResult.extra.toFixed(2) }}</strong></div>
            <div style="margin-top: 8px">
              <strong>Totale stimato:</strong> € {{ calcResult.total.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /MODAL RICHIESTA NOLEGGIO -->
  </section>
</template>

<script setup>
    import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import axios from "axios"; // lo puoi anche togliere dopo, vedi sotto
    import { post, get } from "@/api/usatoPublic";
    import { nbtListingDefault } from "@/content/nbtListingDefault";
    import { fetchNbtCategorie } from "@/api/usatoPublic";

    // ====== BLOCCO UX (no BE/DB: default FE) ======
    const nbtUx = computed(() => nbtListingDefault || null);

    const hasNbtUx = computed(() => {
        const ux = nbtUx.value;
        return !!(ux && (ux.howItWorks?.length || ux.included?.length || ux.cta));
    });

    // CTA: apre il modal contatto già esistente, con messaggio precompilato
    function openContactFromCta() {
        if (isOpen.value) closeRequest();

        const title = String(nbtUx.value?.cta?.title || "Richiesta informazioni").trim();
        const msg = String(nbtUx.value?.cta?.text || "").trim();

        contact.value.messaggio = msg ? `${title}\n${msg}` : title;
        openContact();
    }

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => (route.params.slug || tenant.slug || "").toString().trim());
    const settings = computed(() => tenant.settings || {});

    // =========================
    // MAPPA: SEMPRE renderizzata
    // - usa map_embed_url se c'è
    // - altrimenti genera embed (prima “società”, poi indirizzo)
    // =========================
    const contactAddress = computed(() => String(settings.value?.contact_address || "").trim());

    // ✅ label “società” tenant-aware (no static)
    const companyLabel = computed(() =>
        String(settings.value?.company_name || settings.value?.meta_title || "").trim()
    );

    // supporto “chiavi legacy” (se prima funzionava con un nome diverso)
    const mapEmbedUrl = computed(() => {
        const s = settings.value || {};
        const candidates = [
            s.map_embed_url,
            s.google_maps_embed,
            s.google_map_embed,
            s.map_iframe,
            s.contact_map_embed,
            s.contact_map_iframe,
        ];
        const found = candidates
            .map((v) => String(v || "").trim())
            .find((v) => !!v);
        return found || "";
    });

    const mapSrc = computed(() => {
        // 1) se c'è embed “place” in settings, vince sempre
        if (mapEmbedUrl.value) return mapEmbedUrl.value;

        // 2) fallback: prova “società + indirizzo”, poi solo società, poi solo indirizzo
        const name = companyLabel.value;
        const addr = contactAddress.value;

        const q =
            name && addr ? `${name}, ${addr}` :
                name ? name :
                    addr ? addr :
                        "";

        if (q) {
            return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
        }

        return "";
    });

    // lo lasciamo: non usato in template ma non rompe nulla
    const mapsHref = computed(() => {
        const addr = contactAddress.value;
        if (!addr) return "";
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    });

    // =========================
    // DATA
    // =========================
    const loading = ref(true);
    const error = ref("");
    const items = ref([]);

    // ====== DETTAGLI (flip) per card ======
    const activeDetailsKey = ref(null);

    function cardKey(it) {
        return String(it?.id ?? it?.nbt_cat ?? it?.key ?? it?.name ?? "");
    }

    function toggleDetails(it) {
        const k = cardKey(it);
        activeDetailsKey.value = activeDetailsKey.value === k ? null : k;
    }

    // ====== FORMAT EURO (interi) ======
    const EUR_INT = new Intl.NumberFormat("it-IT", {
        maximumFractionDigits: 0,
        useGrouping: true,
    });

    function eurInt(v) {
        const raw = String(v ?? "").trim();

        const normalized = raw
            .replace(/\s/g, "")
            .replace(/[€]/g, "")
            .replace(/\./g, "")
            .replace(/,/g, ".")
            .replace(/[^\d.-]/g, "");

        const n = Number(normalized);
        return Number.isFinite(n) ? EUR_INT.format(Math.round(n)) : "0";
    }

    // ====== CONTATTO ======
    const contact = ref({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        messaggio: "",
    });

    const isContactValid = computed(() => {
        const nomeOk = !!contact.value.nome?.trim();
        const cognomeOk = !!contact.value.cognome?.trim();
        const emailOk = !!contact.value.email?.trim();
        const telOk = !!contact.value.telefono?.trim();
        return nomeOk && cognomeOk && (emailOk || telOk);
    });

    const contactLoading = ref(false);
    const contactError = ref("");
    const contactOk = ref("");

    // ====== MODAL STATES ======
    const isContactOpen = ref(false);

    const isOpen = ref(false);
    const selected = ref(null);

    // ====== Scroll lock deterministico ======
    let scrollLocked = false;
    let prevHtmlOverflow = "";
    let prevBodyOverflow = "";
    let prevBodyPaddingRight = "";

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function lockScroll() {
        if (scrollLocked) return;
        scrollLocked = true;

        prevHtmlOverflow = document.documentElement.style.overflow;
        prevBodyOverflow = document.body.style.overflow;
        prevBodyPaddingRight = document.body.style.paddingRight;

        const sbw = getScrollbarWidth();
        if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
    }

    function unlockScroll() {
        if (!scrollLocked) return;
        scrollLocked = false;

        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;

        prevHtmlOverflow = "";
        prevBodyOverflow = "";
        prevBodyPaddingRight = "";
    }

    function hardResetScrollStyles() {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
    }

    const isAnyModalOpen = computed(() => isOpen.value || isContactOpen.value);

    watch(
        isAnyModalOpen,
        (open) => {
            if (open) lockScroll();
            else unlockScroll();
        },
        { immediate: true }
    );

    // ====== MODAL CONTATTO ======
    function openContact() {
        contactError.value = "";
        contactOk.value = "";
        contactLoading.value = false;
        isContactOpen.value = true;
    }

    function openContactFromCard(it) {
        if (isOpen.value) closeRequest();

        const cat = String(it?.nbt_cat || it?.title || it?.name || "").trim();
        if (cat && !contact.value.messaggio) {
            contact.value.messaggio = `Info su: ${cat}`;
        }

        openContact();
    }

    function closeContact() {
        isContactOpen.value = false;
    }

    async function submitContact() {
        contactError.value = "";
        contactOk.value = "";

        if (!slug.value) {
            contactError.value = "Tenant non configurato.";
            return;
        }

        if (!contact.value.nome || !contact.value.cognome) {
            contactError.value = "Inserisci nome e cognome.";
            return;
        }

        if (!contact.value.email && !contact.value.telefono) {
            contactError.value = "Inserisci almeno email o telefono.";
            return;
        }

        contactLoading.value = true;
        try {
            await post(
                "/azlease/usato-pubblico/invia-contatto-generico",
                {
                    nome: contact.value.nome,
                    cognome: contact.value.cognome,
                    email: contact.value.email || "",
                    telefono: contact.value.telefono || "",
                    messaggio: contact.value.messaggio || "",
                    destinatario_email: settings.value?.contact_email || undefined,
                },
                { params: { _slug: slug.value } }
            );


            contactOk.value = "Richiesta inviata correttamente.";
            contact.value = { nome: "", cognome: "", email: "", telefono: "", messaggio: "" };
            closeContact();
        } catch (e) {
            console.error("[NbtPage] submitContact failed:", e);
            const status = e?.response?.status;
            contactError.value = status ? `Errore invio (${status})` : "Errore invio richiesta";
        } finally {
            contactLoading.value = false;
        }
    }

    // ====== MODAL RICHIESTA NOLEGGIO ======
    const form = ref({
        startDate: "",
        endDate: "",
        extraKm: 0,
        additionalDrivers: false,
        cancelFranchise: false,
    });

    const calcLoading = ref(false);
    const calcError = ref("");
    const calcResult = ref(null);

    const AZZ_FRANCHIGIA_FLAT_EUR = 70;

    function openRequest(it) {
        activeDetailsKey.value = null;
        selected.value = it;
        calcError.value = "";
        calcResult.value = null;
        isOpen.value = true;

        form.value.startDate = "";
        form.value.endDate = "";
        form.value.extraKm = 0;
        form.value.additionalDrivers = false;
        form.value.cancelFranchise = false;
    }

    function closeRequest() {
        isOpen.value = false;
        selected.value = null;
        calcError.value = "";
        calcResult.value = null;
    }

    function parseISOToUTC(iso) {
        const [y, m, d] = String(iso).split("-").map(Number);
        return Date.UTC(y, (m || 1) - 1, d || 1);
    }

    function diffDays(startISO, endISO) {
        const start = parseISOToUTC(startISO);
        const end = parseISOToUTC(endISO);
        const ms = end - start;
        const days = Math.floor(ms / 86400000);
        return Number.isFinite(days) ? Math.max(1, days) : 0;
    }

    function calcTotal() {
        if (!selected.value) {
            calcError.value = "Seleziona una categoria.";
            return;
        }

        calcError.value = "";
        calcResult.value = null;

        if (!form.value.startDate || !form.value.endDate) {
            calcError.value = "Seleziona il periodo di noleggio.";
            return;
        }

        const days = diffDays(form.value.startDate, form.value.endDate);
        if (!days) {
            calcError.value = "Date non valide.";
            return;
        }

        const cat = selected.value;

        let base = 0;
        let kmIncluded = 0;
        let label = "giorni";

        if (days >= 30) {
            base = Number(cat.costo_m || 0);
            kmIncluded = Number(cat.km_m || 0);
            label = "mese";
        } else if (days >= 7) {
            base = Number(cat.costo_w || 0);
            kmIncluded = Number(cat.km_w || 0);
            label = "settimana";
        } else {
            base = Number(cat.costo_d || 0) * days;
            kmIncluded = Number(cat.km_d || 0) * days;
            label = "giorni";
        }

        const extraKm = Number(form.value.extraKm || 0);
        const extraKmCost = extraKm * Number(cat.costo_km || 0);
        const driverCost = form.value.additionalDrivers ? Number(cat.costo_conducente || 0) : 0;
        const franchiseCost = form.value.cancelFranchise ? AZZ_FRANCHIGIA_FLAT_EUR : 0;

        const extra = extraKmCost + driverCost + franchiseCost;
        const total = base + extra;

        calcResult.value = { days, base, extra, total, kmIncluded, label };
    }

    // ====== LOAD CATEGORIE ======
    async function load() {
        if (!slug.value) {
            items.value = [];
            error.value = "Tenant non configurato.";
            loading.value = false;
            return;
        }

        loading.value = true;
        error.value = "";

        try {
            const data = await fetchNbtCategorie(slug.value);


            const arr = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                    ? data.items
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.results)
                            ? data.results
                            : [];

            items.value = arr.filter(Boolean);
        } catch (e) {
            console.error("[NbtPage] load failed:", e);
            items.value = [];
            const status = e?.response?.status;
            error.value = status ? `Errore ${status}` : "Errore fetch";
        } finally {
            loading.value = false;
        }
    }

    onMounted(() => {
        hardResetScrollStyles();
        load();
    });

    onBeforeUnmount(() => {
        hardResetScrollStyles();
    });

    watch(slug, () => load());

    watch(
        () => [
            form.value.startDate,
            form.value.endDate,
            form.value.extraKm,
            form.value.additionalDrivers,
            form.value.cancelFranchise,
            selected.value?.id,
        ],
        () => {
            calcResult.value = null;
            calcError.value = "";
        }
    );
</script>

<style scoped>
.nbt {
  --nbtCardBg: #f5f5f5;
  padding: 24px 16px 40px;
}

.head {
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
}

.state {
  padding: 12px 0;
  opacity: 0.8;
}

.state.error {
  opacity: 1;
}

/* =========================
   GRID + CARD
   ========================= */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.card {
  grid-column: span 12;
  background: transparent;
  border: 0;
  padding: 0;
}

@media (min-width: 1024px) {
  .card {
    grid-column: span 4;
  }
}

.cardFlip {
  background: var(--nbtCardBg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0;
  overflow: hidden;
  min-height: 420px;
  perspective: 1200px;
}

.cardInner {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
  transform-style: preserve-3d;
  transition: transform 260ms ease;
}

.cardFlip.flipped .cardInner {
  transform: rotateY(180deg);
}

.cardFace {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  background: var(--nbtCardBg);
}

.cardFront {
  transform: rotateY(0deg);
}

.cardBack {
  transform: rotateY(180deg);
}

.cardFacePad {
  padding-top: 12px;
}

.cardImg {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  border-radius: 0;
  display: block;
  background: var(--nbtCardBg);
  max-height: 220px;
}

@media (min-width: 1024px) {
  .cardImg {
    max-height: 200px;
    margin-bottom: 0.5rem;
  }
}

.cardBody {
  padding: 1rem 0.85rem 0.85rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.cardTop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cardTitle {
  margin: 0;
  text-align: center;
  font-size: clamp(1rem, 4.2vw, 1.1rem);
  font-weight: 700;
}

.cardDesc {
  margin: 0;
  text-align: center;
  opacity: 0.8;
  font-size: clamp(0.92rem, 3.7vw, 1rem);
}

.cardActions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: auto;
}

.btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
}

.btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.detailsBtn {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  z-index: 2;
}

.detailsBtn:hover {
  opacity: 0.75;
}

/* BACK tariffe */
.cardBack .cardBody {
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 12px;
}

.cardBack .cardActions {
  margin-top: 14px;
  padding-bottom: 8px;
}

.tariffeHead {
  display: flex;
  justify-content: center;
  margin-top: 6px;
  margin-bottom: 10px;
}

.tariffeFranchigia {
  opacity: 0.9;
}

.tariffeGrid {
  display: grid;
  gap: 0.45rem;
  width: min(560px, 100%);
  margin: 0 auto;
}

.r {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.45rem 0.55rem;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.k {
  font-size: clamp(0.92rem, 3.6vw, 1rem);
  font-weight: 600;
  text-align: left;
}

.v {
  font-size: clamp(0.95rem, 3.8vw, 1.02rem);
  font-weight: 700;
  white-space: nowrap;
}

.s {
  font-size: clamp(0.85rem, 3.3vw, 0.95rem);
  opacity: 0.8;
  white-space: nowrap;
}

/* =========================
   MODAL
   ========================= */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 9999;
}

.modal {
  width: min(720px, 100%);
  background: #fff;
  border-radius: 0px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: inherit;
}

.modal input,
.modal select,
.modal textarea,
.modal button {
  font-family: inherit;
}

.modalHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.modalTitle {
  font-weight: 700;
}

.x {
  border: 0;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.modalBody {
  padding: 16px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field span {
  font-size: 13px;
  opacity: 0.85;
}

.field input,
.field textarea {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 12px 12px;
  background: #fff;
  outline: none;
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(0, 0, 0, 0.28);
}

.field textarea {
  border-radius: 0;
  resize: vertical;
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.hint {
  margin: 10px 0;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0px;
  background: rgba(0, 0, 0, 0.02);
  line-height: 1.35;
}

.err {
  margin-top: 10px;
}

.ok {
  margin-top: 10px;
}

/* =========================
   UX (TOP + BOTTOM)
   ========================= */
.nbtUxTop {
  margin: 8px 0 18px;
}

.nbtUxBottom {
  margin-top: 10px;
}

.uxBox {
  display: grid;
  gap: 0px;
}

.uxTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.uxBlock {
  display: grid;
  gap: 10px;
}

.uxSteps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.uxStep {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
}

.uxStepN {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  font-weight: 800;
  line-height: 1;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.uxStepT {
  font-weight: 800;
  font-size: 14px;
}

.uxStepD {
  margin-top: 2px;
  opacity: 0.82;
  line-height: 1.35;
  font-size: 13px;
}

.uxList {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  opacity: 0.9;
  font-size: 14px;
}

.uxDesc {
  margin: 6px 0 0;
  opacity: 0.85;
  line-height: 1.35;
  font-size: 14px;
}

/* ===== BOTTOM layout ===== */
.uxBottomGrid {
  display: grid;
  grid-template-columns: 1fr; /* ✅ mobile: una colonna */
  gap: 16px;
  align-items: start;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.uxLeftCol {
  display: grid;
  gap: 14px;
}

.ctaLeft {
  text-align: left;
}

.uxCtaActions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

/* ✅ mappa a destra: top + centrata orizzontalmente */
/* ✅ colonna destra: layout pulito (no flex hacks) */
.uxRightCol {
  width: 100%;
}


.ctaMap {
  width: 100%;

  /* ✅ MOBILE-FIRST: riserva altezza reale (niente aspect-ratio che schiaccia) */
  height: clamp(320px, 60vw, 420px);
  min-height: 320px;

  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  overflow: hidden;
  margin: 0;

  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}




.ctaMapFrame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.ctaMapEmpty {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 14px;
  text-align: center;
  opacity: 0.9;
}

@media (min-width: 768px) {
  .uxSteps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ✅ QUI è IL PUNTO: desktop torna a 2 colonne */
@media (min-width: 1024px) {
  .uxBottomGrid {
    grid-template-columns: 1fr 1fr; /* ✅ elimina vuoto: 2 colonne bilanciate */
    column-gap: 24px;
    row-gap: 0;
    align-items: start;
    padding: 16px;
  }

  /* ✅ desktop: mappa più “hero” */
  .ctaMap {
    aspect-ratio: auto;   /* lascia che sia l’altezza a comandare */
    height: 360px;        /* ✅ più grande e credibile */
    min-height: 360px;
  }
}

</style>
