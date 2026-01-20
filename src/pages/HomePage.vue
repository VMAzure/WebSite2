<script setup>
    import { computed, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "../stores/tenant";

    import Navbar from "../components/Navbar.vue";
    import Footer from "../components/Footer.vue";

    const route = useRoute();
    const tenantStore = useTenantStore();

    // ✅ regola: se c'è lo slug nel path, È QUELLO. Lo store serve solo per root-domain senza slug.
    const resolvedSlug = computed(() => {
        const fromPath = route.params.slug ? String(route.params.slug) : null;

        // se ho slug nel path, non guardo lo store
        if (fromPath) return fromPath;

        // root domain (senza /:slug): qui userai tenantStore.slug (settato dalla resolve)
        return tenantStore.slug || null;
    });


    // ✅ fetch SOLO se lo slug esiste davvero
    watch(
        resolvedSlug,
        async (slug) => {
            if (!slug) return

            if (slug === "default") {
                tenantStore.reset()
                return
            }

            tenantStore.setSlug(slug)
            await tenantStore.loadPublicSettings(slug)
        },
        { immediate: true }
    )
</script>


<template>
  <div style="min-height:100vh; display:flex; flex-direction:column; background:#0b0f1a; color:#e5e7eb;">
    <Navbar :slug="resolvedSlug" />

    <main style="flex:1; padding:24px;">
      <h1>Home</h1>
<p style="opacity:.6;font-size:12px">
  BUILD MARKER: 2026-01-20-1 | route.slug: <b>{{ String(route.params.slug || "") }}</b>
</p>




      <p>
  Slug attivo:
  <b>{{ resolvedSlug ?? "— (non configurato)" }}</b>
</p>


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
