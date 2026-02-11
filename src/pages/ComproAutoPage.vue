<template>
  <section
    class="compro"
    :style="{
      fontFamily: settings?.font_family || 'inherit',
      '--accent': settings?.tertiary_color || '#035909',
    }"
  >
    <header class="hero">
      <h1 class="heroTitle">{{ pageTitle }}</h1>
      <p v-if="pageSubtitle" class="heroSubtitle">{{ pageSubtitle }}</p>
    </header>

    <div v-if="loading" class="state">Caricamento…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else class="layout">
      <!-- COLONNA TESTO -->
      <section class="card">
        <h2 class="h2">Come funziona</h2>

        <ul v-if="howItWorks.length" class="list">
          <li v-for="(s, i) in howItWorks" :key="i">{{ s }}</li>
        </ul>
        <p v-else class="muted">Contenuto non disponibile.</p>

        <div v-if="bodyText" class="bodyText">
          <p v-for="(p, i) in bodyParagraphs" :key="i">{{ p }}</p>
        </div>

        <div class="trust">
          <h3 class="h3">Perché scegliere noi</h3>
          <ul class="list compact">
            <li>Valutazione professionale e trasparente</li>
            <li>Acquisto diretto senza intermediari</li>
            <li>Pagamento rapido</li>
            <li>Gestione pratiche inclusa</li>
          </ul>
        </div>
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
            <input
              v-model.trim="form.phone"
              type="tel"
              autocomplete="tel"
              required
            />
          </label>

          <label class="field">
            <span>Email</span>
            <input
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              required
            />
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

          <p v-if="submitOk" class="ok">
            Richiesta inviata. Ti ricontattiamo a breve.
          </p>
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
    import { computed, onMounted, ref } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import { submitComproAutoLead } from "@/api/servicesPublic";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || {});

    // form state
    const form = ref({
        nome: "",
        cognome: "",
        phone: "",
        email: "",
        message: "",
    });


    const submitting = ref(false);
    const submitOk = ref(false);
    const submitErr = ref("");

    const pageTitle = computed(
        () =>
            settings.value?.compro_title ||
            settings.value?.buy_car_title ||
            "Acquistiamo la tua auto",
    );

    const pageSubtitle = computed(
        () =>
            settings.value?.compro_subtitle ||
            settings.value?.buy_car_subtitle ||
            "Valutazione seria, rapida e pagamento immediato.",
    );

    const howItWorks = computed(() => {
        const arr =
            settings.value?.compro_how_it_works || settings.value?.buy_car_steps || [];

        return Array.isArray(arr)
            ? arr
                .filter(Boolean)
                .map((x) => String(x).trim())
                .filter(Boolean)
            : [];
    });

    const bodyText = computed(() =>
        String(
            settings.value?.compro_body || settings.value?.buy_car_body || "",
        ).trim(),
    );

    const bodyParagraphs = computed(() =>
        bodyText.value
            ? bodyText.value
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean)
            : [],
    );

    // contatti (coerenti con quanto già fai altrove)
    const phone = computed(() =>
        String(settings.value?.phone || settings.value?.telefono || "").trim(),
    );
    const email = computed(() =>
        String(settings.value?.email || settings.value?.mail || "").trim(),
    );

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

            // reset soft
            form.value.message = "";
        } catch (e) {
            submitErr.value = "Errore invio richiesta. Riprova tra poco.";
        } finally {
            submitting.value = false;
        }
    }
</script>

<style scoped>
.compro {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 24px 32px;
}


.hero {
  padding: 12px 0 16px;
}
.heroTitle {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
}
.heroSubtitle {
  margin: 8px 0 0;
  opacity: 0.85;
}

.state {
  padding: 12px;
  border-radius: 0px;
  background: #f6f6f6;
}
.state.error {
  background: #ffecec;
  color: #8a1f1f;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.h2 {
  margin: 0 0 10px;
  font-size: 18px;
}
.h3 {
  margin: 18px 0 8px;
  font-size: 16px;
}

.list {
  padding-left: 18px;
  margin: 0;
}
.list li {
  margin: 6px 0;
}
.list.compact li {
  margin: 4px 0;
}

.bodyText {
  margin-top: 14px;
}
.bodyText p {
  margin: 10px 0;
  opacity: 0.95;
}

.form {
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
.field span {
  font-size: 13px;
  opacity: 0.85;
}
input,
textarea {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 0px;
  padding: 10px 12px;
  outline: none;
}
input:focus,
textarea:focus {
  border-color: var(--accent);
}

.btn {
  border: 0;
  border-radius: 0px;
  padding: 12px 14px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
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
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 8px;
}
.contactRow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.label {
  opacity: 0.7;
  font-size: 13px;
}
.link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
.link:hover {
  text-decoration: underline;
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: start;
  }
}
</style>
