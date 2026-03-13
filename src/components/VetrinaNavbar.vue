<!-- Header entry=external: solo logo + social (navbar minimale) -->
<template>
  <header class="vetrina-navbar">
    <div class="vetrina-navbar__top">
      <router-link class="vetrina-navbar__brand" :to="homePath" aria-label="Home">
        <img
          v-if="settings?.logo_web"
          :src="settings.logo_web"
          alt="logo"
          class="vetrina-navbar__logo"
          width="220"
          height="52"
          decoding="async"
        />
        <span v-else class="vetrina-navbar__brand-text">
          {{ settings?.company_name || settings?.meta_title || effectiveSlug || "Home" }}
        </span>
      </router-link>

      <div class="vetrina-navbar__social">
        <a v-if="facebookUrl" :href="facebookUrl" target="_blank" rel="noopener" class="vetrina-navbar__social-btn vetrina-navbar__social--fb" aria-label="Facebook">
          <i class="fa-brands fa-facebook-f"></i>
        </a>
        <a v-if="instagramUrl" :href="instagramUrl" target="_blank" rel="noopener" class="vetrina-navbar__social-btn vetrina-navbar__social--ig" aria-label="Instagram">
          <i class="fa-brands fa-instagram"></i>
        </a>
        <a v-if="youtubeUrl" :href="youtubeUrl" target="_blank" rel="noopener" class="vetrina-navbar__social-btn vetrina-navbar__social--yt" aria-label="YouTube">
          <i class="fa-brands fa-youtube"></i>
        </a>
        <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener" class="vetrina-navbar__social-btn vetrina-navbar__social--wa" aria-label="WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
        <a v-if="tiktokUrl" :href="tiktokUrl" target="_blank" rel="noopener" class="vetrina-navbar__social-btn vetrina-navbar__social--tt" aria-label="TikTok">
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
  return String(v || "").trim() || "";
}

const facebookUrl = computed(() => asUrl(props.settings?.facebook_url));
const instagramUrl = computed(() =>
  asUrl(
    props.settings?.instagram_url ||
      props.settings?.social_instagram ||
      props.settings?.instagram,
  ),
);
const youtubeUrl = computed(() => asUrl(props.settings?.youtube_url));
const tiktokUrl = computed(() =>
  asUrl(
    props.settings?.tiktok_url ||
      props.settings?.social_tiktok ||
      props.settings?.tiktok,
  ),
);
const whatsappUrl = computed(() => {
  const raw =
    props.settings?.whatsapp_url ||
    props.settings?.social_whatsapp ||
    props.settings?.whatsapp ||
    props.settings?.phone ||
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
.vetrina-navbar {
  position: sticky;
  top: 0;
  z-index: 4000;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin: 0;
}

.vetrina-navbar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem clamp(0.75rem, 2vw, 1.5rem);
  min-height: 4rem;
}

.vetrina-navbar__brand {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  text-decoration: none;
}

.vetrina-navbar__logo {
  height: clamp(2.2rem, 4vw, 3rem);
  width: auto;
  object-fit: contain;
}

.vetrina-navbar__brand-text {
  color: #1f1f1f;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
}

.vetrina-navbar__social {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vetrina-navbar__social-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #fff;
  font-size: 1rem;
}

.vetrina-navbar__social--fb { background: #1877f2; }
.vetrina-navbar__social--ig { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
.vetrina-navbar__social--yt { background: #ff0000; }
.vetrina-navbar__social--wa { background: #25d366; }
.vetrina-navbar__social--tt { background: #000; }
</style>
