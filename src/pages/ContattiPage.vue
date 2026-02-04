<script setup>
    import { computed } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || {});

    const isReady = computed(
        () => !!(settings.value?.meta_title || settings.value?.company_name),
    );

    const companyName = computed(
        () =>
            settings.value?.company_name || settings.value?.meta_title || slug.value,
    );

    const aboutText = computed(() =>
        String(
            settings.value?.about_us ||
            settings.value?.chi_siamo ||
            settings.value?.company_description ||
            "",
        ).trim(),
    );

    const clean = (v) =>
        String(v || "")
            .replace(/>/g, "")
            .replace(/\s+/g, " ")
            .trim()

    const staff = computed(() => {
        const arr = Array.isArray(tenant.team) ? tenant.team : []

        return arr
            .filter(Boolean)
            .map((m) => {
                const first = clean(m.nome || m.name)
                const last = clean(m.cognome)
                const fullName = clean(`${first} ${last}`)

                return {
                    name: fullName,
                    role: clean(m.ruolo || m.role || m.title),
                    email: clean(m.email),
                    phone: clean(m.cellulare || m.phone || m.mobile),
                    avatar: clean(m.avatar_url || m.photo_url || m.avatar),
                }
            })
            .filter((p) => p.name)
    })


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


        <!-- GRID: contatti + chi siamo -->
        <div class="grid">
          <!-- CONTATTI -->
          <div class="card">
            <h2 class="dealer-name">{{ companyName }}</h2>

            <ul class="list">
              <li v-if="settings.contact_phone" class="row">
                <span class="icon"><i class="fa-solid fa-phone"></i></span>
                <a class="link" :href="`tel:${settings.contact_phone}`">{{
                  settings.contact_phone
                }}</a>
              </li>

              <li v-if="settings.contact_email" class="row">
                <span class="icon"><i class="fa-solid fa-envelope"></i></span>
                <a class="link" :href="`mailto:${settings.contact_email}`">{{
                  settings.contact_email
                }}</a>
              </li>

              <li v-if="settings.contact_address" class="row">
                <span class="icon"
                  ><i class="fa-solid fa-location-dot"></i
                ></span>
                <span class="text">{{ settings.contact_address }}</span>
              </li>

              <li v-if="settings.opening_hours" class="row">
                <span class="icon"><i class="fa-solid fa-clock"></i></span>
                <span class="text">{{ settings.opening_hours }}</span>
              </li>
            </ul>

            <!-- SOCIAL (icone) -->
            <div
              class="social"
              v-if="
                settings.facebook_url ||
                settings.instagram_url ||
                settings.tiktok_url ||
                settings.youtube_url ||
                settings.linkedin_url ||
                settings.whatsapp_url ||
                settings.x_url
              "
            >
              <a
                v-if="settings.facebook_url"
                :href="settings.facebook_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-facebook"></i>
              </a>

              <a
                v-if="settings.instagram_url"
                :href="settings.instagram_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-instagram"></i>
              </a>

              <a
                v-if="settings.tiktok_url"
                :href="settings.tiktok_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-tiktok"></i>
              </a>

              <a
                v-if="settings.youtube_url"
                :href="settings.youtube_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-youtube"></i>
              </a>

              <a
                v-if="settings.linkedin_url"
                :href="settings.linkedin_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-linkedin"></i>
              </a>

              <a
                v-if="settings.x_url"
                :href="settings.x_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-x-twitter"></i>
              </a>

              <a
                v-if="settings.whatsapp_url"
                :href="settings.whatsapp_url"
                target="_blank"
                rel="noopener"
              >
                <i class="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          <!-- CHI SIAMO -->
          <div class="card">
            <h2 class="section-title">Chi siamo</h2>

            <p v-if="aboutText" class="about">{{ aboutText }}</p>
            <p v-else class="about muted">
              Aggiungi “Chi siamo” nei site settings.
            </p>

            <div v-if="settings.opening_hours" class="hours">
              <div class="hours-title">Orari di apertura</div>
              <div class="hours-text">{{ settings.opening_hours }}</div>
            </div>
          </div>
        </div>

        <!-- STAFF -->
        <section v-if="staff.length" class="staff">
          <h2 class="staff-title">Il nostro staff</h2>

          <div class="staff-grid">
            <article
              v-for="p in staff"
              :key="p.name + p.email"
              class="staff-card"
            >
              <div class="staff-head">
                <div class="avatar">
                  <img
                    v-if="p.avatar"
                    :src="p.avatar"
                    :alt="p.name"
                    width="56"
                    height="56"
                    loading="lazy"
                    decoding="async"
                  />

                  <div v-else class="avatar-fallback">
                    {{ p.name.slice(0, 1).toUpperCase() }}
                  </div>
                </div>

                <div class="staff-meta">
                  <div class="staff-name">{{ p.name }}</div>
                  <div v-if="p.role" class="staff-role">{{ p.role }}</div>
                </div>
              </div>

              <div class="staff-contacts">
                <a v-if="p.email" class="staff-link" :href="`mailto:${p.email}`"
                  >✉️ {{ p.email }}</a
                >
                <a v-if="p.phone" class="staff-link" :href="`tel:${p.phone}`"
                  >📞 {{ p.phone }}</a
                >
              </div>
            </article>
          </div>
        </section>

        <!-- MAPPA (una sola, chiusa bene) -->
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
.page {
  min-height: 100%;
}

.main {
  padding: clamp(1rem, 3vw, 2rem);
}

.contatti-page{
  width: 100%;
  max-width: 1200px;  /* ✅ leggibilità premium */
  margin: 0 auto;     /* ✅ centrato */
}

.main{
  padding: clamp(1rem, 3vw, 2rem);
}

.head{
  margin-bottom: clamp(1.2rem, 3vw, 2rem);
}

.grid{
  margin-bottom: clamp(1.6rem, 4vw, 2.6rem); /* ✅ stacco chiaro prima dello staff */
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

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: 1fr 1.2fr;
    align-items: start;
  }
}

.card{
  background: #fff;
  border-radius: 0;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border: 1px solid rgba(0,0,0,0.06);         /* ✅ premium: bordo leggero */
  box-shadow: 0 0.6rem 1.6rem rgba(0,0,0,0.05);/* ✅ shadow più soft */
  display: block;
}

.social{
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.08);
}

.row{
  padding: 0.15rem 0;
}

.link{
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}


.dealer-name {
  font-size: 1.35rem;
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

  /* ✅ niente underline */
  text-decoration: none;
  border-bottom: 0;

  /* resta chiaramente “cliccabile” senza sottolineatura */
  opacity: 0.92;
  cursor: pointer;

  width: fit-content;
}

.link:hover {
  opacity: 0.7;
}

.link:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.25);
  outline-offset: 3px;
  border-radius: 6px;
}


.loading {
  opacity: 0.7;
  margin: 0;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 800;
}

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

/* SOCIAL ICONS — come SitoA */
.social {
  display: flex;
  gap: clamp(1rem, 2vw, 1.6rem);
  margin-top: clamp(0.8rem, 1.6vw, 1.4rem);
}

.social i {
  font-size: clamp(1.8rem, 2.6vw, 2.8rem);
  color: #333;
  transition: 0.2s ease;
}
.social i:hover {
  opacity: 0.6;
}

/* WhatsApp verde come SitoA */
.fa-whatsapp {
  color: green !important;
}

/* ================================
	STAFF
	================================ */
.staff-title {
  margin: clamp(2.4rem, 5vw, 3.6rem) 0 clamp(1.2rem, 2vw, 1.8rem);
  font-size: clamp(1.8rem, 2.6vw, 3rem);
  font-weight: 600;
}

/* GRID STAFF */
.staff-grid {
  display: grid;
  gap: clamp(1.2rem, 2vw, 2.2rem);
}

@media (min-width: 50rem) {
  .staff-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 70rem) {
  .staff-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* CARD STAFF PREMIUM */
.staff-card {
  background: white;
  border-radius: 0;
  padding: clamp(1rem, 2vw, 1.6rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1vw, 0.9rem); /* più piccolo = card meno alta */
  box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.07);
}

.staff-mail {
  min-width: 0;
}

/* mappa */
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

.staff-contacts {
  display: grid;
  gap: 0.35rem;
}

/* link contatti staff: interattivi ma NON blu/underline */
.staff-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  color: inherit;            /* ✅ niente blu */
  text-decoration: none;     /* ✅ niente underline */
  border-bottom: 0;          /* nel dubbio, se c'era */

  opacity: 0.92;
  line-height: 1.35;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.staff-link:hover {
  opacity: 0.7;              /* hover soft */
}

.staff-link:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.25);
  outline-offset: 3px;
  border-radius: 6px;
}

/* se l'icona è emoji o fa, allineala meglio */
.staff-link .icon {
  display: inline-flex;
  width: 18px;
  justify-content: center;
  opacity: 0.75;
}


.avatar img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 999px;
  display: block;
}

.staff-name{
  font-weight: 800;
  line-height: 1.15;
}

.staff-role{
  opacity: 0.75;
}

.staff-contacts{
  margin-top: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0,0,0,0.08);
}


</style>
