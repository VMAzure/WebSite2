<!-- src/pages/UsatoPage.vue -->
<script setup>
    import { ref, computed, onMounted } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    import CardUsato from "@/components/CardUsato.vue";
    import { fetchUsatoList } from "@/api/usatoPublic";
    import { mapListToCardUsatoDto } from "@/mappers/usatoCardMapper";

    const route = useRoute();
    const router = useRouter();
    const tenant = useTenantStore();

    const slug = computed(() =>
        (route.params.slug || tenant.slug || "").toString().trim(),
    );
    const settings = computed(() => tenant.settings || {});

    const loading = ref(true);
    const error = ref(null);
    const cards = ref([]);

    // ============================
    // Mobile filters panel
    // ============================
    const mobileFiltersOpen = ref(false);

    function toggleMobileFilters() {
        mobileFiltersOpen.value = !mobileFiltersOpen.value;
    }

    function closeMobileFilters() {
        mobileFiltersOpen.value = false;
    }

    // ============================
    // Helpers
    // ============================
    function normBrand(v) {
        return String(v ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function toInt(v) {
        const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10);
        return Number.isFinite(n) ? n : null;
    }
    function roundDownTo(n, step) {
        if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
        return Math.floor(n / step) * step;
    }

    function roundUpTo(n, step) {
        if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
        return Math.ceil(n / step) * step;
    }

    function setQuery(patch) {
        const next = { ...route.query, ...patch };
        Object.keys(next).forEach((k) => {
            const v = next[k];
            if (v === "" || v === null || v === undefined) delete next[k];
        });
        router.replace({ path: route.path, query: next });
    }

    function clearFilters() {
        router.replace({ path: route.path, query: {} });
        closeMobileFilters();
    }

    // ============================
    // Query-driven filters
    // ============================
    const qBrand = computed(() =>
        String(route.query.brand || "")
            .trim()
            .toLowerCase(),
    );
    const qPriceMax = computed(() => String(route.query.price_max || "").trim());
    const qYearMin = computed(() => String(route.query.year_min || "").trim());
    const qSort = computed(() => String(route.query.sort || "year_desc").trim());

    // ============================
    // Options (dropdown)
    // ============================
    const brandOptions = computed(() => {
        const map = new Map();
        for (const c of cards.value || []) {
            const label = String(c?.marca || "").trim();
            if (!label) continue;
            map.set(normBrand(label), label);
        }
        return Array.from(map.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, "it"));
    });

    const yearBounds = computed(() => {
        const years = (cards.value || [])
            .map((c) => toInt(c?.anno_immatricolazione))
            .filter(Boolean);
        if (!years.length) return { min: null, max: null };
        return { min: Math.min(...years), max: Math.max(...years) };
    });

    const yearMinStart = computed(() => {
        const { min, max } = yearBounds.value;
        if (!min || !max) return null;

        // Finestra dinamica: mostra ultimi N anni rispetto al max disponibile
        // (evita liste infinite; resta 100% data-driven sul tenant)
        const windowSize = 15;
        const candidate = max - windowSize;

        // non scendere sotto al minimo reale del tenant
        return Math.max(min, candidate);
    });

    const priceBounds = computed(() => {
        const prices = (cards.value || [])
            .map((c) => toInt(c?.prezzo_vendita))
            .filter((v) => v !== null);

        if (!prices.length) return { min: null, max: null };
        return { min: Math.min(...prices), max: Math.max(...prices) };
    });

    const priceStep = computed(() => {
        const { min, max } = priceBounds.value;
        if (min === null || max === null) return 5000;
        const range = max - min;

        // step sensato in base al range (evita 40 opzioni)
        if (range <= 30000) return 2500;
        if (range <= 80000) return 5000;
        if (range <= 200000) return 10000;
        return 25000;
    });

    const yearMinOptions = computed(() => {
        const { min, max } = yearBounds.value;
        const start = yearMinStart.value;

        if (!min || !max || start === null) return [{ value: "", label: "Tutti" }];

        const out = [{ value: "", label: "Tutti" }];

        // dal più recente al più vecchio (ma non oltre lo start calcolato)
        for (let y = max; y >= start; y--) {
            out.push({ value: String(y), label: String(y) });
        }

        return out;
    });

    const priceMaxOptions = computed(() => {
        const { min, max } = priceBounds.value;
        const step = priceStep.value;

        // fallback: se non abbiamo prezzi, lasciamo un set minimo
        if (min === null || max === null) {
            return [{ value: "", label: "Nessun limite" }];
        }

        // partiamo dal minimo "sensato" dello slug (arrotondato in giù)
        const start = Math.max(step, roundDownTo(min, step));
        const end = roundUpTo(max, step);

        const out = [{ value: "", label: "Nessun limite" }];

        // Generiamo valori da start a end
        for (let v = start; v <= end; v += step) {
            out.push({ value: String(v), label: `${v.toLocaleString("it-IT")} €` });
        }

        return out;
    });

    const sortOptions = [
        { value: "year_desc", label: "Anno: più recenti" },
        { value: "price_asc", label: "Prezzo: crescente" },
        { value: "price_desc", label: "Prezzo: decrescente" },
        { value: "km_asc", label: "Km: crescenti" },
    ];

    // ============================
    // Filter + sort
    // ============================
    const filteredCards = computed(() => {
        const brand = qBrand.value;
        const yearMin = toInt(qYearMin.value);
        const priceMax = toInt(qPriceMax.value);
        const sort = qSort.value || "year_desc";

        const arr = (cards.value || []).filter((c) => {
            if (brand && normBrand(c?.marca) !== brand) return false;

            const y = toInt(c?.anno_immatricolazione);
            if (yearMin !== null && (y === null || y < yearMin)) return false;

            const p = toInt(c?.prezzo_vendita);
            if (priceMax !== null && (p === null || p > priceMax)) return false;

            return true;
        });

        const byYear = (c) => toInt(c?.anno_immatricolazione) ?? -1;
        const byPrice = (c) => toInt(c?.prezzo_vendita) ?? Number.POSITIVE_INFINITY;
        const byKm = (c) => toInt(c?.km_certificati) ?? Number.POSITIVE_INFINITY;

        if (sort === "price_asc") arr.sort((a, b) => byPrice(a) - byPrice(b));
        else if (sort === "price_desc") arr.sort((a, b) => byPrice(b) - byPrice(a));
        else if (sort === "km_asc") arr.sort((a, b) => byKm(a) - byKm(b));
        else arr.sort((a, b) => byYear(b) - byYear(a));

        return arr;
    });

    const initialCards = computed(() => filteredCards.value.slice(0, 8));
    const firstCard = computed(() => initialCards.value[0] || null);
    const restCards = computed(() => initialCards.value.slice(1));

    // ============================
    // Data fetch (single)
    // ============================
    onMounted(async () => {
        loading.value = true;
        error.value = null;

        try {
            const raw = await fetchUsatoList(slug.value);
            const list = Array.isArray(raw) ? raw : raw?.items || raw?.data || [];
            cards.value = mapListToCardUsatoDto(list);
        } catch (e) {
            error.value = e?.message || "Errore caricamento usato";
            cards.value = [];
        } finally {
            loading.value = false;
        }
    });
</script>

<template>
  <section
    class="page"
    :style="{ '--tenant-accent': settings.secondary_color || '#111' }"
  >
    <div class="container">
      <header class="page-head">
        <div class="page-head-row">
          <h1 class="page-title">Vetture disponibili</h1>

          <!-- Mobile action -->
          <button
            class="filters-toggle"
            type="button"
            @click="toggleMobileFilters"
            :aria-expanded="mobileFiltersOpen ? 'true' : 'false'"
            aria-controls="mobile-filters-panel"
            v-if="!loading && !error"
          >
            Filtri
          </button>
        </div>

        <!-- Count sempre visibile (anche mobile) -->
        <div v-if="!loading && !error" class="results-count">
          {{ filteredCards.length }} risultati
        </div>
      </header>

      <!-- FILTRI -->
      <div class="filters" v-if="!loading && !error">
        <!-- Desktop: sempre aperto. Mobile: apribile -->
        <div
          id="mobile-filters-panel"
          class="filters-panel"
          :class="{ 'is-open': mobileFiltersOpen }"
        >
          <div class="filters-grid">
            <!-- Marca -->
            <label class="field">
              <select
                class="control"
                :value="qBrand"
                @change="(e) => setQuery({ brand: e.target.value || '' })"
              >
                <option value="">Tutte</option>
                <option
                  v-for="b in brandOptions"
                  :key="b.value"
                  :value="b.value"
                >
                  {{ b.label }}
                </option>
              </select>
              <span class="label">Marca</span>
            </label>

            <!-- Prezzo massimo -->
            <label class="field">
              <select
                class="control"
                :value="qPriceMax"
                @change="(e) => setQuery({ price_max: e.target.value || '' })"
              >
                <option
                  v-for="p in priceMaxOptions"
                  :key="p.value"
                  :value="p.value"
                >
                  {{ p.label }}
                </option>
              </select>
              <span class="label">Prezzo massimo</span>
            </label>

            <!-- Anno minimo -->
            <label class="field">
              <select
                class="control"
                :value="qYearMin"
                @change="(e) => setQuery({ year_min: e.target.value || '' })"
              >
                <option
                  v-for="y in yearMinOptions"
                  :key="y.value"
                  :value="y.value"
                >
                  {{ y.label }}
                </option>
              </select>
              <span class="label">Anno minimo</span>
            </label>

            <!-- Ordina per -->
            <label class="field">
              <select
                class="control"
                :value="qSort"
                @change="
                  (e) => setQuery({ sort: e.target.value || 'year_desc' })
                "
              >
                <option
                  v-for="s in sortOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </option>
              </select>
              <span class="label">Ordina per</span>
            </label>

            <!-- Reset (e SOLO reset qui dentro) -->
            <div class="field field-meta">
              <button
                class="control reset-btn"
                type="button"
                @click="clearFilters"
                :disabled="!Object.keys(route.query).length"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile: micro CTA sotto per chiudere (facoltativo ma utile UX) -->
        <button
          class="filters-close"
          type="button"
          @click="closeMobileFilters"
          v-if="mobileFiltersOpen"
        >
          Chiudi filtri
        </button>
      </div>

      <div v-if="loading" class="state">Caricamento…</div>
      <div v-else-if="error" class="state">{{ error }}</div>

<div v-else class="grid">
  <!-- 1) Prima card: eager/high (LCP stabile) -->
  <CardUsato
    v-if="firstCard"
    :key="firstCard.id_auto"
    :slug="slug"
    :item="firstCard"
    :settings="settings"
    :priority="true"
  />

  <!-- 2) Tutte le altre: lazy -->
  <CardUsato
    v-for="c in restCards"
    :key="c.id_auto"
    :slug="slug"
    :item="c"
    :settings="settings"
    :priority="false"
  />
</div>
    </div>
  </section>
</template>

<style scoped>
/* Page */
/* Page */
.page {
  /* mobile: ok così; desktop lo apriamo di più sotto */
  padding: clamp(1rem, 3vw, 2.2rem);
}

/* Container: full width vero */
.container {
  width: 100%;
  max-width: none;
  margin: 0;
  padding-top: clamp(0.6rem, 1.6vw, 1.2rem);
}

/* Desktop: se vuoi “schermo intero” percepito, riduci padding laterale */
@media (min-width: 60rem) {
  .page {
    padding-left: clamp(0.75rem, 1.5vw, 1.5rem);
    padding-right: clamp(0.75rem, 1.5vw, 1.5rem);
  }
}

/* Ultra-wide: quasi a filo (ma non 0, per non diventare brutto) */
@media (min-width: 90rem) {
  .page {
    padding-left: clamp(0.5rem, 1vw, 1rem);
    padding-right: clamp(0.5rem, 1vw, 1rem);
  }
}


/* Header */
.page-head {
  margin: 0 0 clamp(1rem, 2vw, 1.6rem);
}
.page-head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.filters-toggle {
  display: none; /* desktop hidden */
  height: clamp(3rem, 6vw, 3.4rem);
  padding: 0 1rem;
  border: 0.12rem solid rgba(0, 0, 0, 0.18);
  background: #fff;
  font-weight: 850;
  cursor: pointer;
  border-radius: 0;
}

.results-count {
  margin-top: 0.6rem;
  font-size: clamp(0.95rem, 1.3vw, 1.05rem);
  font-weight: 800;
  color: rgba(0, 0, 0, 0.7);
  text-align: left;
}

.filters-panel {
  /* desktop: normale */
}

.filters-close {
  display: none; /* desktop hidden */
  margin-top: 0.8rem;
  height: clamp(3rem, 6vw, 3.4rem);
  width: 100%;
  border: 0.12rem solid rgba(0, 0, 0, 0.18);
  background: #fff;
  font-weight: 850;
  cursor: pointer;
  border-radius: 0;
}

/* Mobile behavior */
@media (max-width: 40rem) {
  .filters-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  /* su mobile, la barra filtri non deve occupare spazio quando chiusa */
  .filters-panel {
    display: none;
  }
  .filters-panel.is-open {
    display: block;
  }

  .filters-close {
    display: block;
  }

  .results-count {
    text-align: left;
  }
}

.page-title {
  margin: 0;
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
  line-height: 1.1;
}

/* Filters wrapper */
.filters {
  margin: clamp(0.8rem, 1.6vw, 1.2rem) 0 var(--u-6);
}

/* Filtri: niente riquadro, solo linee + spazi */
.filters-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr auto;
  gap: clamp(0.8rem, 1.6vw, 1.4rem);
  align-items: start;

  padding: clamp(0.7rem, 1.5vw, 1.1rem) 0;
  border-bottom: 0.12rem solid rgba(0, 0, 0, 0.1);
}

/* Fields: CONTROL sopra, LABEL sotto */
.field {
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 0.8vw, 0.6rem);
  min-width: 0;
}

.label {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  font-weight: 800;
  color: rgba(0, 0, 0, 0.7);
}

.field:not(.field-meta) .label {
  text-align: center;
  line-height: 1.2;
}

/* Select */
.control {
  height: clamp(3rem, 6vw, 3.4rem);
  padding: 0 var(--u-4);

  border: 0.12rem solid rgba(0, 0, 0, 0.18);
  background: #fff;

  font-size: clamp(0.95rem, 1.3vw, 1.05rem);
  font-weight: 650;
  color: rgba(0, 0, 0, 0.92);

  outline: none;
  border-radius: 0;
}

.control:focus {
  border-color: rgba(0, 0, 0, 0.45);
}

/* Colonna count/reset */
.field-meta {
  min-width: 14rem;
  align-items: stretch;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;
  cursor: pointer;
  white-space: nowrap;

  /* eredita bordo/altezza/padding da .control */
  font-weight: 850;
}

.reset-btn:hover:not(:disabled) {
  border-color: rgba(0, 0, 0, 0.45);
}

.reset-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* States */
.state {
  padding: var(--u-4) 0;
  font-size: var(--fs-sm);
}

/* Grid cards */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.6rem);
  margin-top: var(--u-5);
}

/* Responsive */
@media (max-width: 80rem) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .field-meta {
    grid-column: 1 / -1;
    max-width: 22rem;
  }
}

@media (max-width: 60rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .grid {
    grid-template-columns: 1fr;
  }
  .filters-grid {
    grid-template-columns: 1fr;
  }
  .field-meta {
    max-width: none;
  }
}

.count-label {
  text-align: center;
  white-space: nowrap;
}
</style>
