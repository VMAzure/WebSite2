<template>
  <!-- ✅ pagine tenant: chrome sempre -->
  <div v-if="showChrome">
    <div v-if="settings" style="min-height: 100vh; background: #fff">
      <Topbar :settings="settings" :slug="slug" />
      <Navbar :settings="settings" :slug="slug" />

      <router-view />

      <Footer :settings="settings" />
    </div>

    <div v-else class="loading">Caricamento...</div>
  </div>

  <!-- ✅ pagine di sistema (tenant-not-configured, 404) -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
    import { computed, watch } from "vue";
    import { useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    import Topbar from "@/components/TopBar.vue";
    import Navbar from "@/components/Navbar.vue";
    import Footer from "@/components/Footer.vue";

    import { loadIubendaIfNeeded } from "@/compliance/iubenda";

    const route = useRoute();
    const tenant = useTenantStore();

    const slug = computed(() => route.params.slug || tenant.slug || "");
    const settings = computed(() => tenant.settings || null);

    // chrome solo dove serve
    const showChrome = computed(() => route.meta?.tenantRequired === true);

    // ✅ quando arriva la compliance (fetch non bloccante), carica iubenda una volta
    watch(
        () => tenant.compliance,
        (c) => loadIubendaIfNeeded(c),
        { immediate: true },
    );
</script>

<style>
.loading {
  padding: 16px;
}
</style>
