<!-- src/components/CatalogHeader.vue -->
<template>
  <header class="catalog-header">
    <div class="catalog-header__inner">
      <router-link class="catalog-brand" :to="homePath" aria-label="Home">
        <img
          v-if="settings?.logo_web"
          :src="settings.logo_web"
          alt="logo"
          class="catalog-brand__logo"
          width="220"
          height="52"
          decoding="async"
        />
        <span v-else class="catalog-brand__text">
          {{
            settings?.company_name ||
            settings?.meta_title ||
            effectiveSlug ||
            "Home"
          }}
        </span>
      </router-link>

      <div class="catalog-actions">
        <a
          v-if="instagramUrl"
          :href="instagramUrl"
          target="_blank"
          rel="noopener"
          class="catalog-social"
          aria-label="Instagram"
        >
          <i class="fa-brands fa-instagram"></i>
        </a>

        <a
          v-if="whatsappUrl"
          :href="whatsappUrl"
          target="_blank"
          rel="noopener"
          class="catalog-social"
          aria-label="WhatsApp"
        >
          <i class="fa-brands fa-whatsapp"></i>
        </a>

        <a
          v-if="tiktokUrl"
          :href="tiktokUrl"
          target="_blank"
          rel="noopener"
          class="catalog-social"
          aria-label="TikTok"
        >
          <i class="fa-brands fa-tiktok"></i>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  slug: String,
  settings: Object,
});

const route = useRoute();

const effectiveSlug = computed(() =>
  String(props.slug || route.params?.slug || "").trim(),
);

const isPathTenant = computed(() => {
  const p = String(route.path || "").toLowerCase();
  const s = effectiveSlug.value.toLowerCase();
  if (!s) return false;
  if (p.startsWith(`/index/${s}`)) return true;
  if (p === `/${s}` || p.startsWith(`/${s}/`)) return true;
  return false;
});

const homePath = computed(() => {
  if (isPathTenant.value && effectiveSlug.value) return `/${effectiveSlug.value}`;
  return "/";
});

function asUrl(v) {
  const s = String(v || "").trim();
  return s || "";
}

const instagramUrl = computed(() =>
  asUrl(
    props.settings?.instagram_url ||
      props.settings?.social_instagram ||
      props.settings?.instagram
  ),
);

const tiktokUrl = computed(() =>
  asUrl(
    props.settings?.tiktok_url ||
      props.settings?.social_tiktok ||
      props.settings?.tiktok
  ),
);

const whatsappUrl = computed(() => {
  const raw =
    props.settings?.whatsapp_url ||
    props.settings?.social_whatsapp ||
    props.settings?.whatsapp ||
    props.settings?.phone ||
    props.settings?.telefono ||
    "";

  const s = String(raw).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;

  const digits = s.replace(/[^\d+]/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.replace(/^\+/, "")}`;
});
</script>

<style scoped>
.catalog-header {
  position: sticky;
  top: 0;
  z-index: 4000;
  background: #f3f3f3;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  margin: calc(clamp(1rem, 3vw, 2.2rem) * -1);
  margin-bottom: clamp(1rem, 2vw, 1.4rem);
}

.catalog-header__inner {
  min-height: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem clamp(0.75rem, 2vw, 1.5rem);
}

.catalog-brand {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  text-decoration: none;
}

.catalog-brand__logo {
  height: clamp(2.4rem, 4vw, 3.2rem);
  width: auto;
  object-fit: contain;
  display: block;
}

.catalog-brand__text {
  color: #1f1f1f;
  font-size: clamp(1.2rem, 2.2vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.01em;
}

.catalog-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.catalog-social {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #111;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 1.2rem;
}

@media (max-width: 40rem) {
  .catalog-header {
    margin: calc(clamp(1rem, 3vw, 2.2rem) * -1);
    margin-bottom: 1rem;
  }

  .catalog-header__inner {
    min-height: 4.8rem;
    padding: 0.6rem 0.75rem;
  }

  .catalog-actions {
    gap: 0.5rem;
  }

  .catalog-social {
    width: 2.3rem;
    height: 2.3rem;
    font-size: 1rem;
  }
}
</style>