<!-- src/pages/NbtPage.vue -->
<template>
  <section
    class="nbt"
    :style="{
      fontFamily: settings?.font_family || 'inherit',
    }"
  >
    <header class="head">
      <h2 class="title">Noleggio da 1 a 30 giorni</h2>
    </header>

    <div v-if="loading" class="state">Caricamento…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else>
      <div v-if="!items.length" class="state">
        Nessuna disponibilità al momento.
      </div>

      <!-- CARD CATEGORIE (con retro tariffe) -->
      <div v-else class="grid">
        <article
          v-for="it in items"
          :key="it.id || it.key || it.name || JSON.stringify(it)"
          class="card"
        >
          <div
            class="cardFlip"
            :class="{ flipped: activeDetailsKey === cardKey(it) }"
          >
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
                    <h3 class="cardTitle">
                      {{ it.nbt_cat || it.title || it.name || "Opzione" }}
                    </h3>

                    <button
                      class="detailsBtn"
                      type="button"
                      @click="toggleDetails(it)"
                      :aria-expanded="activeDetailsKey === cardKey(it)"
                    >
                      Dettagli
                    </button>
                  </div>

                  <p
                    v-if="it.descrizione || it.subtitle || it.description"
                    class="cardDesc"
                  >
                    {{ it.descrizione || it.subtitle || it.description }}
                  </p>

                  <div class="cardActions">
                    <button class="btn" type="button" @click="openRequest(it)">
                      Calcola Canone
                    </button>
                  </div>
                </div>
              </div>

              <!-- BACK (tariffe) -->
              <div class="cardFace cardBack cardFacePad" aria-hidden="false">
                <div class="cardBody">
                  <div class="cardTop">
                    <h3 class="cardTitle">{{ it.nbt_cat || "Categoria" }}</h3>

                    <button
                      class="detailsBtn"
                      type="button"
                      @click="toggleDetails(it)"
                    >
                      Indietro
                    </button>
                  </div>

                  <div class="tariffeHead">
                    <div class="tariffeFranchigia" v-if="it.franchigia != null">
                      Franchigia:
                      <strong
                        :style="{
                          color: settings?.tertiary_color || '#0f8a3a',
                        }"
                        >€ {{ eurInt(it.franchigia) }}</strong
                      >
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
                    <button class="btn" type="button" @click="openRequest(it)">
                      Calcola Canone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

          <!-- CTA FINALE (UNICA) — contatto progressivo (modal), non inline -->
          <section v-if="items.length" class="cta">
            <div class="ctaBox">
              <div class="ctaText">
                <h3 class="ctaTitle">Hai dubbi?</h3>
                <p class="ctaDesc">
                  Scrivici o chiamaci: ti aiutiamo a scegliere la soluzione
                  migliore.
                </p>

                <div class="ctaContacts">
      <a
        v-if="settings.contact_phone"
        class="ctaChip"
        :href="`tel:${String(settings.contact_phone).replace(/\s+/g, '')}`"
      >
        {{ settings.contact_phone }}
      </a>

      <a
        v-if="settings.contact_email"
        class="ctaChip"
        :href="`mailto:${settings.contact_email}`"
      >
        {{ settings.contact_email }}
      </a>
    </div>


                <div class="ctaActionsInline">
                  <button class="btn" type="button" @click="openContact">
                    Invia richiesta
                  </button>
                </div>
              </div>
            </div>
          </section>

      <!-- MODAL CONTATTO (stesso pattern del modal noleggio) -->
      <div v-if="isContactOpen" class="backdrop" @click.self="closeContact">
        <div class="modal" role="dialog" aria-modal="true">
          <header class="modalHead">
            <div class="modalTitle">Invia richiesta</div>
            <button
              class="x"
              type="button"
              aria-label="Chiudi"
              @click="closeContact"
            >
              ✕
            </button>
          </header>

          <div class="modalBody">
            <div class="row">
              <label class="field">
                <span>Nome</span>
                <input
                  v-model.trim="contact.nome"
                  type="text"
                  autocomplete="given-name"
                />
              </label>

              <label class="field">
                <span>Cognome</span>
                <input
                  v-model.trim="contact.cognome"
                  type="text"
                  autocomplete="family-name"
                />
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
    </div>

    <!-- MODAL RICHIESTA NOLEGGIO (rimane com'era) -->
    <div v-if="isOpen" class="backdrop" @click.self="closeRequest">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modalHead">
          <div class="modalTitle">
            {{ selected?.nbt_cat || "Richiesta noleggio" }}
          </div>
          <button
            class="x"
            type="button"
            aria-label="Chiudi"
            @click="closeRequest"
          >
            ✕
          </button>
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
              {{ calcResult.days }} giorni con {{ calcResult.kmIncluded }} km
              totali inclusi
              <span v-if="calcResult.label === 'settimana'">
                (tariffa settimanale)</span
              >
              <span v-else-if="calcResult.label === 'mese'">
                (tariffa mensile)</span
              >
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
            Franchigia danni:
            <strong>€ {{ eurInt(selected.franchigia) }}</strong>
          </div>

          <div class="modalActions">
            <button
              class="btn"
              type="button"
              @click="calcTotal"
              :disabled="calcLoading"
            >
              {{ calcLoading ? "Calcolo…" : "Calcola Totale" }}
            </button>
          </div>

          <div v-if="calcError" class="err">{{ calcError }}</div>

          <div v-if="calcResult" class="ok">
            <div>
              Periodo selezionato: <strong>{{ calcResult.days }}</strong> giorni
            </div>
            <div>
              Tariffa base: <strong>€ {{ calcResult.base.toFixed(2) }}</strong>
            </div>
            <div>
              Extra: <strong>€ {{ calcResult.extra.toFixed(2) }}</strong>
            </div>
            <div style="margin-top: 8px">
              <strong>Totale stimato:</strong> €
              {{ calcResult.total.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import axios from "axios";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() =>
        (route.params.slug || tenant.slug || "").toString().trim(),
    );
    const settings = computed(() => tenant.settings || {});

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
    const EUR_INT = new Intl.NumberFormat("it-IT", {
        maximumFractionDigits: 0,
        useGrouping: true, // ✅ forza 1.000 / 2.000 / 1.890
    });

    function eurInt(v) {
        const raw = String(v ?? "").trim();

        const normalized = raw
            .replace(/\s/g, "")
            .replace(/[€]/g, "")
            .replace(/\./g, "") // separatore migliaia
            .replace(/,/g, ".") // decimali
            .replace(/[^\d.-]/g, "");

        const n = Number(normalized);
        return Number.isFinite(n) ? EUR_INT.format(Math.round(n)) : "0";
    }

    // ====== CONTATTO (INLINE) ======
    const contact = ref({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        messaggio: "",
    });

    const isContactValid = computed(() => {
        const nomeOk = !!contact.value.nome?.trim()
        const cognomeOk = !!contact.value.cognome?.trim()
        const emailOk = !!contact.value.email?.trim()
        const telOk = !!contact.value.telefono?.trim()
        return nomeOk && cognomeOk && (emailOk || telOk)
    })


    const contactLoading = ref(false);
    const contactError = ref("");
    const contactOk = ref("");

    // ====== MODAL CONTATTO ======
    const isContactOpen = ref(false);

    function openContact() {
        contactError.value = "";
        contactOk.value = "";
        isContactOpen.value = true;
        contactLoading.value = false
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
            await axios.post(
                "/api/azlease/usato-pubblico/invia-contatto-generico",
                {
                    nome: contact.value.nome,
                    cognome: contact.value.cognome,
                    email: contact.value.email || "",
                    telefono: contact.value.telefono || "",
                    messaggio: contact.value.messaggio || "",
                    // opzionale
                    destinatario_email: settings.value?.contact_email || undefined,
                },
                {
                    // fondamentale multi-tenant
                    params: { _slug: slug.value },
                },
            );

            contactOk.value = "Richiesta inviata correttamente.";
            contact.value = {
                nome: "",
                cognome: "",
                email: "",
                telefono: "",
                messaggio: "",
            };
            closeContact();
        } catch (e) {
            console.error("[NbtPage] submitContact failed:", e);
            const status = e?.response?.status;
            contactError.value = status
                ? `Errore invio (${status})`
                : "Errore invio richiesta";
        } finally {
            contactLoading.value = false;
        }

    }

    // ====== MODAL RICHIESTA NOLEGGIO ======
    const isOpen = ref(false);
    const selected = ref(null);

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

    // ✅ REGOLA: azzeramento franchigia = FLAT 70€
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

    // 04 -> 11 = 7 giorni (fine esclusa)
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
        const driverCost = form.value.additionalDrivers
            ? Number(cat.costo_conducente || 0)
            : 0;
        const franchiseCost = form.value.cancelFranchise
            ? AZZ_FRANCHIGIA_FLAT_EUR
            : 0;

        const extra = extraKmCost + driverCost + franchiseCost;
        const total = base + extra;

        calcResult.value = {
            days,
            base,
            extra,
            total,
            kmIncluded,
            label,
        };
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
            const { data } = await axios.get(
                `/api/nbt/${encodeURIComponent(slug.value)}/categorie`,
            );
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

    onMounted(load);
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
        },
    );
</script>

<style scoped>
.nbt {
  --nbtCardBg: #f5f5f5; /* stesso grigio tipo carousel */
}

.nbt {
  padding: 24px 16px;
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

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px; /* prima 12px */
}

.card {
  grid-column: span 12;
  background: transparent;
  border: 0;
  padding: 0;
}

.cardFlip {
  background: var(--nbtCardBg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0;
  overflow: hidden;

  /* prima: 360 / 520 -> rendiamola “in piedi” */
  min-height: 420px;

  perspective: 1200px;
}

@media (min-width: 1024px) {
  /* prima 520px */
  .cardFlip {
    min-height: 420px;
  }
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

/* BACK: riduci aria e tieni CTA più vicina alle tariffe */
.cardBack .cardActions {
  margin-top: 14px; /* invece di auto */
  padding-bottom: 8px;
}

.cardBack .tariffeHead {
  display: flex;
  justify-content: center; /* franchigia centrata come il titolo */
  margin-top: 6px;
  margin-bottom: 10px;
}

.cardBack .tariffeFranchigia {
  opacity: 0.9;
}

@media (min-width: 1024px) {
  .card {
    grid-column: span 3;
  }
}

.cardTitle {
  margin: 0 0 6px;
  font-size: 16px;
}
.cardDesc {
  margin: 0 0 12px;
  opacity: 0.8;
}

.cardActions {
  display: flex;
  justify-content: center; /* 👈 centrato */
  margin-top: auto; /* spinto in basso */
}

.cardTitle {
  margin: 0;
  text-align: center;
  font-size: clamp(1rem, 4.2vw, 1.1rem);
  font-weight: 700;
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
}

.modalTitle {
  font-weight: 600;
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

.field span {
  font-size: 13px;
  opacity: 0.85;
}

.modalHead {
  background: #fff;
}

.modalTitle {
  font-weight: 700;
}


.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
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
.err {
  margin-top: 10px;
}
.ok {
  margin-top: 10px;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.cardTop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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
.cardBack .tariffeGrid {
  width: min(560px, 100%);
  margin: 0 auto;
}

.cardBack .r {
  padding: 0.4rem 0.55rem;
  background: rgba(0, 0, 0, 0.015); /* un pelo meno grigio */
}

.cardBody {
  padding: 1rem 0.85rem 0.85rem; /* sopra un filo di più */
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.cardBack .cardBody {
  align-items: center;
  text-align: center;

  justify-content: center; /* ✅ CENTRO VERTICALE vero */
  gap: 12px; /* respiro uniforme tra blocchi */
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

.hint {
  margin: 10px 0;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0px;
  background: rgba(0, 0, 0, 0.02);
  line-height: 1.35;
}

/* =========================
   DETTAGLI TARIFFE (mobile-first)
   ========================= */
.tariffe {
  margin-top: 1.25rem;
}

.tariffeTitle {
  margin: 0 0 0.75rem;
  font-size: clamp(1.05rem, 4.2vw, 1.25rem);
  font-weight: 700;
}

.tariffeList {
  display: grid;
  gap: 0.75rem;
}

.tariffeCard {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0 !important;
  overflow: hidden;
  background: #fff;
  padding: 0rem;
}

.tariffeHead {
  gap: 0.25rem; /* prima 0.35rem */
  margin-bottom: 0.55rem; /* prima 0.75rem */
}

.tariffeName {
  font-size: clamp(1rem, 4vw, 1.1rem);
  font-weight: 700;
}

.tariffeFranchigia {
  font-size: clamp(0.9rem, 3.6vw, 1rem);
  opacity: 0.85;
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

  /* prima 0.55rem 0.6rem */
  padding: 0.45rem 0.55rem;

  border-radius: 0rem;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.k {
  font-size: clamp(0.92rem, 3.6vw, 1rem);
  font-weight: 600;
  text-align: left; /* ✅ attaccato come i prezzi */
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

/* CTA */
.cta {
  margin-top: 1.25rem;
}

.ctaBox {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  border-radius: 0;
  padding: clamp(1rem, 4.2vw, 1.25rem);
  display: grid;
  gap: 0.85rem;
}

.ctaTitle {
  margin: 0 0 0.35rem;
  font-size: clamp(1.05rem, 4.4vw, 1.25rem);
  font-weight: 800;
}

.ctaDesc {
  margin: 0;
  opacity: 0.85;
  font-size: clamp(0.95rem, 3.8vw, 1.05rem);
  line-height: 1.35;
}

.ctaContacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 0.9rem;
  margin-top: 0.75rem;
}

.ctaChip {
  display: inline-flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  color: inherit;
  text-decoration: none; /* look premium */
}

.ctaChip:hover {
  border-color: rgba(0, 0, 0, 0.2);
}

.ctaLink {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  font-size: clamp(0.95rem, 3.8vw, 1.02rem);
}

.ctaForm {
  display: grid;
  gap: 0.25rem;
  max-width: 720px;
}

.ctaActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

/* desktop layout */
@media (min-width: 1024px) {
  .tariffeList {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .tariffeCard {
    padding: 1rem;
  }

  .card {
    grid-column: span 4;
    flex-direction: column;
  }

  .cardImg {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    border-radius: 0;
    display: block;
    background: var(--nbtCardBg);

    /* aggiunte */
    max-height: 220px;
  }

  @media (min-width: 1024px) {
    .cardImg {
      max-height: 200px;
      margin-bottom: 0.5rem; /* prima 0.65rem */
    }
  }

  .ctaBox {
    grid-template-columns: 1fr 1fr;
    align-items: start;
    gap: 1rem;
  }

  .ctaActions {
    justify-content: flex-end;
  }

  .ctaActionsInline {
    margin-top: 0.9rem;
    display: flex;
    justify-content: flex-start;
  }

  /* il modal usa .modalActions già definito;
   qui uniformiamo l’allineamento come CTA */
  .modalActions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .cardFront .cardImg {
    margin-top: 10px;
  }

  .cardFacePad {
    padding-top: 12px;
  }

  .btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

}
</style>
