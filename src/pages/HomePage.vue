<script setup>
    import { computed, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "../stores/tenant";

    import Navbar from "../components/Navbar.vue";
    import Footer from "../components/Footer.vue";

    const route = useRoute();
    const tenantStore = useTenantStore();

    function getSlugFromDomain() {
        const host = window.location.hostname;
        if (host === "localhost") return null;

        const parts = host.split(".");
        if (parts.length < 3) return null;

        return parts[0];
    }

    const resolvedSlug = computed(() => {
        const d = getSlugFromDomain();
        if (d) return d;

        if (route.params.slug) return String(route.params.slug);

        return "default";
    });

    // 1) salva slug  2) chiama settings dal BE
    watch(
        resolvedSlug,
        async (slug) => {
            tenantStore.setSlug(slug);
            await tenantStore.loadPublicSettings(slug);
        },
        { immediate: true }
    );
</script>

<template>
  <div style="min-height:100vh; display:flex; flex-direction:column; background:#0b0f1a; color:#e5e7eb;">
    <Navbar :slug="resolvedSlug" />

    <main style="flex:1; padding:24px;">
      <h1>Home</h1>

      <p>Slug attivo: <b>{{ resolvedSlug }}</b></p>

      <p v-if="tenantStore.loading">Carico settings…</p>
      <p v-else-if="tenantStore.error">Errore: {{ tenantStore.error }}</p>

      <div v-else-if="tenantStore.settings">
        <p><b>meta_title:</b> {{ tenantStore.settings.meta_title }}</p>
        <p><b>primary_color:</b> {{ tenantStore.settings.primary_color }}</p>
        <p><b>secondary_color:</b> {{ tenantStore.settings.secondary_color }}</p>
      </div>
    </main>

    <Footer :slug="resolvedSlug" />
  </div>
</template>
