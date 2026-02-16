<!-- src/pages/ComproAutoPage.vue -->
<template>
  <section
    class="compro"
    :style="{
      fontFamily: settings?.font_family || 'inherit',
      '--accent': settings?.tertiary_color || '#035909',
    }"
  >
    <!-- HERO -->
    <header class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="heroSubtitle">{{ pageSubtitle }}</p>
      </div>
    </header>

    <!-- CONTENUTO -->
    <div class="layout">
      <!-- COLONNA TESTO -->
      <section class="card">
        <!-- ✅ Se il backend ci dà un blocco HTML pronto, lo renderizziamo SSR -->
        <div v-if="richHtml" class="rich" v-html="richHtml"></div>

        <!-- ✅ Fallback: UI a steps -->
        <template v-else>
          <h2 class="h2">Come funziona</h2>

          <!-- Steps -->
          <ol v-if="howItWorks.length" class="steps">
            <li v-for="(s, i) in howItWorks.slice(0, 4)" :key="i" class="step">
              <div class="stepN">{{ i + 1 }}</div>
              <div class="stepT">{{ s }}</div>
            </li>
          </ol>
          <p v-else class="muted">Contenuto non disponibile.</p>

          <!-- Step extra -->
          <ul v-if="howItWorks.length > 4" class="list compact moreSteps">
            <li v-for="(s, i) in howItWorks.slice(4)" :key="`more-${i}`">
              {{ s }}
            </li>
          </ul>

          <!-- Testo descrittivo -->
          <div v-if="bodyText" class="bodyText">
            <p v-for="(p, i) in bodyParagraphs" :key="i">{{ p }}</p>
          </div>

          <!-- BENEFIT -->
          <div class="trust">
            <h3 class="h3">Perché scegliere noi</h3>
            <ul class="list compact">
              <li v-for="(b, i) in benefits" :key="i">{{ b }}</li>
            </ul>
          </div>
        </template>
      </section>

      <!-- COLONNA FORM -->
      <aside class="card formCard">
        <h2 class="h2">Richiedi una valutazione</h2>

        <form class="form" @submit.prevent="onSubmit">
          <label class="field">
            <span>Nome</span>
            <input v-model.trim="form.nome" type="text" autocomplete="given-name" required />
          </label>

          <label class="field">
            <span>Cognome</span>
            <input v-model.trim="form.cognome" type="text" autocomplete="family-name" required />
          </label>

          <label class="field">
            <span>Telefono</span>
            <input v-model.trim="form.phone" type="tel" autocomplete="tel" required />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model.trim="form.email" type="email" autocomplete="email" required />
          </label>

          <label class="field">
            <span>Messaggio</span>
            <textarea
              v-model.trim="form.message"
              rows="5"
              placeholder="Modello, anno, km, note utili…"
            ></textarea>
          </label>

          <button class="btn" type="submit" :disabled="submitting">
            {{ submitting ? "Invio…" : "Invia richiesta" }}
          </button>

          <p v-if="submitOk" class="ok">Richiesta inviata. Ti ricontattiamo a breve.</p>
          <p v-if="submitErr" class="err">{{ submitErr }}</p>

          <div class="contacts">
            <div v-if="phone" class="contactRow">
              <span class="label">Telefono</span>
              <a class="link" :href="`tel:${phone}`">{{ phone }}</a>
            </div>

            <div v-if="email" class="contactRow">
              <span class="label">Email</span>
              <a class="link" :href="`mailto:${email}`">{{ email }}</a>
            </div>
          </div>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup>
    import { computed, ref } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import { submitComproAutoLead } from "@/api/servicesPublic";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => String(route.params.slug || tenant.slug || "").trim());
    const settings = computed(() => tenant.settings || {});

    // form state
    const form = ref({ nome: "", cognome: "", phone: "", email: "", message: "" });
    const submitting = ref(false);
    const submitOk = ref(false);
    const submitErr = ref("");

    function toList(raw) {
        if (Array.isArray(raw)) {
            return raw
                .filter(Boolean)
                .map((x) => String(x).trim())
                .filter(Boolean);
        }
        const s = String(raw || "").trim();
        if (!s) return [];
        return s
            .split(/\r?\n+/)
            .map((r) => r.replace(/^\s*[-•]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim())
            .filter(Boolean);
    }

    function looksLikeHtml(s) {
        const v = String(s || "").trim();
        return !!(v && /<[a-z][\s\S]*>/i.test(v));
    }

    /**
     * ✅ Contenuti SOLO da chiavi esplicite nei settings "compro_*".
     * Niente euristiche su "services": contratto stabile e dealer-aware.
     */
    const pageTitle = computed(
        () => settings.value?.compro_title || "Acquistiamo la tua auto"
    );

    const pageSubtitle = computed(
        () =>
            settings.value?.compro_subtitle ||
            "Valutazione seria, rapida e pagamento immediato."
    );

    const richHtml = computed(() => {
        const html = String(
            settings.value?.compro_html ||
            settings.value?.compro_content_html ||
            ""
        ).trim();

        return looksLikeHtml(html) ? html : "";
    });

    const howItWorks = computed(() => {
        if (richHtml.value) return [];

        const raw =
            settings.value?.compro_how_it_works ??
            settings.value?.compro_steps ??
            "";

        const list = toList(raw);
        if (list.length) return list;

        // fallback MINIMO (non testo marketing lungo hardcoded)
        return [
            "Compila il form con i dati principali",
            "Ti contattiamo rapidamente per una prima valutazione",
            "Fissiamo un appuntamento per verifica e proposta",
            "Pagamento e pratiche gestite in sede",
        ];
    });

    const bodyText = computed(() => {
        if (richHtml.value) return "";
        return String(
            settings.value?.compro_body ||
            settings.value?.compro_description ||
            ""
        ).trim();
    });

    const bodyParagraphs = computed(() =>
        bodyText.value
            ? String(bodyText.value)
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean)
            : []
    );

    const benefits = computed(() => {
        if (richHtml.value) return [];

        const raw =
            settings.value?.compro_benefits ??
            settings.value?.compro_points ??
            "";

        const list = toList(raw);
        if (list.length) return list;

        // fallback MINIMO
        return [
            "Valutazione trasparente",
            "Nessun intermediario",
            "Gestione pratiche inclusa",
            "Pagamento rapido",
        ];
    });

    // contatti
    const phone = computed(() => String(settings.value?.phone || settings.value?.telefono || "").trim());
    const email = computed(() => String(settings.value?.email || settings.value?.mail || "").trim());

    async function onSubmit() {
        submitOk.value = false;
        submitErr.value = "";
        submitting.value = true;

        try {
            const payload = {
                nome: form.value.nome,
                cognome: form.value.cognome,
                phone: form.value.phone,
                email: form.value.email,
                message: form.value.message,
                source: "compro-auto",
            };

            await submitComproAutoLead(slug.value, payload);
            submitOk.value = true;
            form.value = { nome: "", cognome: "", phone: "", email: "", message: "" };
        } catch (e) {
            submitErr.value = "Errore invio richiesta. Riprova tra poco.";
        } finally {
            submitting.value = false;
        }
    }
</script>

<style scoped>
/* reset minimo SOLO dentro pagina */
.compro,
.compro * {
  box-sizing: border-box;
}

.compro {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  background: #fff;
  overflow-x: hidden;
}

/* HERO */
.hero {
  width: 100%;
  padding: clamp(1rem, 3vw, 2.75rem) clamp(1rem, 4vw, 3rem);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));
}

.heroInner {
  width: 100%;
  max-width: none;
  margin: 0;
}

.heroTitle {
  margin: 0;
  font-size: clamp(1.95rem, 3.4vw, 2.9rem);
  line-height: 1.06;
  letter-spacing: -0.02em;
}

.heroSubtitle {
  margin: 0.65rem 0 0;
  font-size: clamp(0.95rem, 1.2vw, 1.15rem);
  opacity: 0.86;
  max-width: 72ch;
}

/* LAYOUT */
.layout {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: clamp(1rem, 3vw, 2.25rem) clamp(1rem, 4vw, 3rem);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2.2vw, 1.75rem);
  align-items: stretch;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0) 55%);
}

/* CARD */
.card {
  width: 100%;
  max-width: none;
  justify-self: stretch;
  height: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 0;
  padding: clamp(1rem, 1.6vw, 1.5rem);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
  position: relative;
}

.card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 4px;
  width: 100%;
  background: var(--accent);
}

.formCard {
  background: #fbfbfb;
}

.formCard .form {
  height: 100%;
  align-content: start;
}

/* ✅ Stile base per HTML ricco */
.rich :deep(h1),
.rich :deep(h2),
.rich :deep(h3) {
  margin: 0 0 0.75rem;
  letter-spacing: -0.01em;
}
.rich :deep(p) {
  margin: 0.6rem 0;
  opacity: 0.95;
}
.rich :deep(ul),
.rich :deep(ol) {
  margin: 0.6rem 0;
  padding-left: 1.1rem;
}
.rich :deep(li) {
  margin: 0.35rem 0;
}

.h2 {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
}

.h3 {
  margin: 1.1rem 0 0.6rem;
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.muted {
  opacity: 0.75;
  margin: 0;
}

/* Steps */
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.65rem;
}

.step {
  display: grid;
  grid-template-columns: 2.15rem 1fr;
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.stepN {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 900;
  background: var(--accent);
  color: #fff;
  font-size: 0.9rem;
}

.stepT {
  line-height: 1.35;
  font-weight: 650;
}

.moreSteps {
  margin-top: 0.6rem;
}

.list {
  padding-left: 1.1rem;
  margin: 0;
}
.list li {
  margin: 0.35rem 0;
}
.list.compact li {
  margin: 0.25rem 0;
}

.bodyText {
  margin-top: 0.9rem;
}
.bodyText p {
  margin: 0.6rem 0;
  opacity: 0.95;
}

.trust {
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(0, 0, 0, 0.10);
}

/* FORM */
.form {
  display: grid;
  gap: 0.75rem;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field span {
  font-size: 0.82rem;
  opacity: 0.85;
}

input,
textarea {
  width: 100%;
  max-width: 100%;
  display: block;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 0;
  padding: 0.65rem 0.8rem;
  outline: none;
  background: #fff;
}

input:focus,
textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.btn {
  width: 100%;
  border: 0;
  border-radius: 0;
  padding: 0.85rem 0.95rem;
  background: var(--accent);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.ok {
  margin: 0;
  color: #0f6b2f;
}
.err {
  margin: 0;
  color: #8a1f1f;
}

.contacts {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(0, 0, 0, 0.10);
  display: grid;
  gap: 0.55rem;
}

.contactRow {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.label {
  opacity: 0.7;
  font-size: 0.82rem;
}

.link {
  color: inherit;
  text-decoration: none;
  font-weight: 800;
}
.link:hover {
  text-decoration: underline;
}

/* DESKTOP: due colonne UGUALI (50/50) */
@media (min-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: clamp(1rem, 2.5vw, 2rem);
  }
}
</style>
