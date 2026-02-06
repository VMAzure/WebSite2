<script setup>
    import { computed } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || {});

    const isReady = computed(() => !!(settings.value?.meta_title || settings.value?.company_name));

    const companyName = computed(() => settings.value?.company_name || settings.value?.meta_title || slug.value);

    const aboutText = computed(() =>
        String(
            settings.value?.about_us ||
            settings.value?.chi_siamo ||
            settings.value?.company_description ||
            ""
        ).trim()
    );

    const clean = (v) =>
        String(v || "")
            .replace(/>/g, "")
            .replace(/\s+/g, " ")
            .trim();

    const staff = computed(() => {
        const arr = Array.isArray(tenant.team) ? tenant.team : [];
        return arr
            .filter(Boolean)
            .map((m) => {
                const first = clean(m.nome || m.name);
                const last = clean(m.cognome);
                const fullName = clean(`${first} ${last}`);

                return {
                    name: fullName,
                    role: clean(m.ruolo || m.role || m.title),
                    email: clean(m.email),
                    phone: clean(m.cellulare || m.phone || m.mobile),
                    avatar: clean(m.avatar_url || m.photo_url || m.avatar),
                };
            })
            .filter((p) => p.name);
    });

    /**
     * ✅ Deduplica UI: se dentro tenant.team esiste un item “dealer”
     * (stesso nome del dealer o stessi contatti globali),
     * lo togliamo dalla colonna Team per non ripeterlo due volte.
     */
    const teamPeople = computed(() => {
        const list = staff.value || [];

        const dealerName = clean(companyName.value).toLowerCase();
        const dealerEmail = clean(settings.value?.contact_email).toLowerCase();
        const dealerPhone = clean(settings.value?.contact_phone);

        return list.filter((p) => {
            const n = clean(p.name).toLowerCase();
            const e = clean(p.email).toLowerCase();
            const ph = clean(p.phone);

            const sameName = dealerName && n === dealerName;
            const sameContacts = (dealerEmail && e === dealerEmail) && (dealerPhone && ph === dealerPhone);

            return !(sameName || sameContacts);
        });
    });

    // ------------------------------
    // “Chi contattare per cosa”
    // - solo mapping UI sulla lista staff esistente
    // ------------------------------
    function pickByRoleKeywords(keywords = []) {
        const list = staff.value;
        if (!list.length) return null;

        const hit = list.find((p) => {
            const r = (p.role || "").toLowerCase();
            return keywords.some((k) => r.includes(String(k).toLowerCase()));
        });

        return hit || list[0] || null;
    }

    const contactMatrix = computed(() => {
        const fallbackDealer = {
            name: companyName.value,
            role: "Contatti dealer",
            email: clean(settings.value?.contact_email),
            phone: clean(settings.value?.contact_phone),
            avatar: "",
        };

        const vendite = pickByRoleKeywords(["vendita", "sales", "commerciale"]) || fallbackDealer;
        const usato = pickByRoleKeywords(["usato", "vendita", "sales"]) || fallbackDealer;
        const assistenza =
            pickByRoleKeywords(["assistenza", "service", "post", "officina", "tecnico"]) || fallbackDealer;

        return [
            { label: "Acquisto / informazioni usato", person: usato },
            { label: "Noleggio breve termine", person: vendite },
            { label: "Assistenza / Post-vendita", person: assistenza },
        ];
    });

    const hasSocial = computed(() =>
        !!(
            settings.value.facebook_url ||
            settings.value.instagram_url ||
            settings.value.tiktok_url ||
            settings.value.youtube_url ||
            settings.value.linkedin_url ||
            settings.value.whatsapp_url ||
            settings.value.x_url
        )
    );
</script>

<template>
  <div class="page" :style="{ fontFamily: settings.font_family || 'inherit' }">
    <main class="main">
      <section v-if="isReady" class="contatti-page">
        <header class="head">
          <h1 class="title">Contatti</h1>
          <p class="subtitle">
            {{ companyName }}
            <span v-if="settings.contact_address"> · {{ settings.contact_address }}</span>
          </p>
        </header>

        <!-- =========================
             CHI CONTATTARE PER COSA
             ========================= -->
        <section class="card cardCompact">
          <h2 class="section-title">Chi contattare per cosa</h2>

          <div class="matrix">
            <article v-for="row in contactMatrix" :key="row.label" class="matrixRow">
              <div class="matrixLeft">{{ row.label }}</div>

              <div class="matrixRight">
                <div class="matrixName">{{ row.person?.name }}</div>

                <div class="matrixContacts">
                  <a
                    v-if="row.person?.email"
                    class="miniLink"
                    :href="`mailto:${row.person.email}`"
                    >✉️ {{ row.person.email }}</a
                  >
                  <a
                    v-if="row.person?.phone"
                    class="miniLink"
                    :href="`tel:${row.person.phone}`"
                    >📞 {{ row.person.phone }}</a
                  >
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- =========================
             LAYOUT PRINCIPALE
             Mobile: 1 colonna
             Desktop: 2 colonne
             ========================= -->
        <div class="layout">
          <!-- SINISTRA: TEAM -->
          <section v-if="teamPeople.length" class="teamCol">
            <h2 class="staffTitle">Il nostro team</h2>

            <div class="teamList">
              <article v-for="p in teamPeople" :key="p.name + p.email" class="teamRow">
                <div class="avatar">
                  <img
                    v-if="p.avatar"
                    :src="p.avatar"
                    :alt="p.name"
                    width="44"
                    height="44"
                    loading="lazy"
                    decoding="async"
                  />
                  <div v-else class="avatar-fallback">
                    {{ p.name.slice(0, 1).toUpperCase() }}
                  </div>
                </div>

                <div class="teamMeta">
                  <div class="teamName">{{ p.name }}</div>
                  <div v-if="p.role" class="teamRole">{{ p.role }}</div>

                  <div class="teamContacts">
                    <a v-if="p.email" class="teamLink" :href="`mailto:${p.email}`">✉️ {{ p.email }}</a>
                    <a v-if="p.phone" class="teamLink" :href="`tel:${p.phone}`">📞 {{ p.phone }}</a>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- DESTRA: CONTATTI + CHI SIAMO -->
          <section class="rightCol">
            <!-- CONTATTI -->
            <div class="card">
              <h2 class="dealer-name">{{ companyName }}</h2>

              <ul class="list">
                <li v-if="settings.contact_phone" class="row">
                  <span class="icon"><i class="fa-solid fa-phone"></i></span>
                  <a class="link" :href="`tel:${settings.contact_phone}`">{{ settings.contact_phone }}</a>
                </li>

                <li v-if="settings.contact_email" class="row">
                  <span class="icon"><i class="fa-solid fa-envelope"></i></span>
                  <a class="link" :href="`mailto:${settings.contact_email}`">{{ settings.contact_email }}</a>
                </li>

                <li v-if="settings.contact_address" class="row">
                  <span class="icon"><i class="fa-solid fa-location-dot"></i></span>
                  <span class="text">{{ settings.contact_address }}</span>
                </li>

                <li v-if="settings.opening_hours" class="row">
                  <span class="icon"><i class="fa-solid fa-clock"></i></span>
                  <span class="text">{{ settings.opening_hours }}</span>
                </li>
              </ul>

              <div v-if="hasSocial" class="social">
                <a v-if="settings.facebook_url" :href="settings.facebook_url" target="_blank" rel="noopener">
                  <i class="fab fa-facebook"></i>
                </a>
                <a v-if="settings.instagram_url" :href="settings.instagram_url" target="_blank" rel="noopener">
                  <i class="fab fa-instagram"></i>
                </a>
                <a v-if="settings.tiktok_url" :href="settings.tiktok_url" target="_blank" rel="noopener">
                  <i class="fab fa-tiktok"></i>
                </a>
                <a v-if="settings.youtube_url" :href="settings.youtube_url" target="_blank" rel="noopener">
                  <i class="fab fa-youtube"></i>
                </a>
                <a v-if="settings.linkedin_url" :href="settings.linkedin_url" target="_blank" rel="noopener">
                  <i class="fab fa-linkedin"></i>
                </a>
                <a v-if="settings.x_url" :href="settings.x_url" target="_blank" rel="noopener">
                  <i class="fab fa-x-twitter"></i>
                </a>
                <a v-if="settings.whatsapp_url" :href="settings.whatsapp_url" target="_blank" rel="noopener">
                  <i class="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>

            <!-- CHI SIAMO -->
            <div class="card">
              <h2 class="section-title">Chi siamo</h2>

              <p v-if="aboutText" class="about">{{ aboutText }}</p>
              <p v-else class="about muted">Aggiungi “Chi siamo” nei site settings.</p>

              <div v-if="settings.opening_hours" class="hours">
                <div class="hours-title">Orari di apertura</div>
                <div class="hours-text">{{ settings.opening_hours }}</div>
              </div>
            </div>
          </section>
        </div>

        <!-- MAPPA -->
        <div v-if="settings.map_embed_url" class="card map-card">
          <div class="map">
            <iframe
              :src="settings.map_embed_url"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Mappa"
            />
          </div>
        </div>
      </section>

      <!-- fallback -->
      <section v-else class="contatti-page">
        <header class="head">
          <h1 class="title">Contatti</h1>
        </header>
        <p class="loading">Caricamento…</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ✅ meno “bianco”: background pagina leggero, card restano bianche */
.page {
  min-height: 100%;
  background: #f6f6f6;
}

.main {
  /* ✅ pagina piena ai lati come le altre */
  width: 100%;
  max-width: none;
  margin: 0;
  padding: clamp(1rem, 2.2vw, 2rem);
}

/* ✅ niente max-width fisso: fluid */
.contatti-page {
  width: 100%;
  max-width: none;
}

.head {
  margin-bottom: clamp(1rem, 3vw, 1.75rem);
}

.title {
  font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.1;
  margin: 0;
}

.subtitle {
  margin: 0.75rem 0 0;
  opacity: 0.8;
  max-width: 70ch;
}

.loading {
  opacity: 0.7;
  margin: 0;
}

/* CARD base */
.card {
  background: #fff;
  border-radius: 0;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.05);
}

/* versione più compatta per la matrix */
.cardCompact {
  padding: clamp(0.9rem, 2vw, 1.2rem);
  margin-bottom: clamp(1rem, 2.4vw, 1.5rem);
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
  font-weight: 800;
}

/* =========================
   MATRIX "chi contattare"
   ========================= */
.matrix {
  display: grid;
  gap: 0.65rem;
}

.matrixRow {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
}

.matrixLeft {
  font-weight: 700;
}

.matrixRight {
  display: grid;
  gap: 0.25rem;
  justify-items: start;
}

.matrixName {
  font-weight: 700;
}

.matrixContacts {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.miniLink {
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
  white-space: nowrap;
}

.miniLink:hover {
  opacity: 0.7;
}

@media (max-width: 720px) {
  .matrixRow {
    grid-template-columns: 1fr;
  }
}

/* =========================
   LAYOUT 2 COLONNE (desktop)
   ========================= */
.layout {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (min-width: 980px) {
  .layout {
    grid-template-columns: 1.05fr 0.95fr;
    align-items: start;
  }
}

.rightCol {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
}

/* =========================
   TEAM: lista verticale
   ========================= */
.staffTitle {
  margin: 0 0 0.75rem;
  font-size: 1.3rem;
  font-weight: 800;
}

.teamList {
  display: grid;
  gap: 0.75rem;
}

.teamRow {
  background: #fff;
  border-radius: 0;
  padding: 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 0.6rem 1.4rem rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 0.75rem;
  align-items: start;
}

.avatar img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 999px;
  display: block;
}

.avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.06);
  font-weight: 800;
}

.teamMeta {
  min-width: 0;
}

.teamName {
  font-weight: 800;
  line-height: 1.15;
}

.teamRole {
  opacity: 0.75;
  margin-top: 0.15rem;
}

.teamContacts {
  margin-top: 0.55rem;
  padding-top: 0.55rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 0.35rem;
}

.teamLink {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.teamLink:hover {
  opacity: 0.7;
}

.teamLink:focus-visible,
.link:focus-visible,
.miniLink:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.25);
  outline-offset: 3px;
  border-radius: 6px;
}

/* =========================
   CONTATTI card (destra)
   ========================= */
.dealer-name {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 1rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.row {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 0.75rem;
  align-items: start;
}

.icon {
  display: flex;
  align-items: center;
}
.icon i {
  font-size: 1rem;
  opacity: 0.85;
}

.text {
  line-height: 1.45;
}

.link {
  line-height: 1.45;
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
  cursor: pointer;
  width: fit-content;
}

.link:hover {
  opacity: 0.7;
}

/* CHI SIAMO */
.about {
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
}

.muted {
  opacity: 0.65;
}

.hours {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.hours-title {
  font-weight: 800;
  margin-bottom: 0.4rem;
}

.hours-text {
  line-height: 1.6;
}

/* SOCIAL */
.social {
  display: flex;
  gap: clamp(1rem, 2vw, 1.6rem);
  margin-top: clamp(0.8rem, 1.6vw, 1.2rem);
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.social i {
  font-size: clamp(1.6rem, 2.2vw, 2.4rem);
  color: #333;
  transition: 0.2s ease;
}
.social i:hover {
  opacity: 0.6;
}

.fa-whatsapp {
  color: green !important;
}

/* MAPPA */
.map-card {
  border-radius: 0;
  padding: 0;
  overflow: hidden;
  margin-top: clamp(1rem, 2vw, 1.5rem);
}

.map {
  aspect-ratio: 16 / 9;
}

.map iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
