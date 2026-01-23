<script setup>
    import { ref, computed, watch } from "vue"
    import { useRoute } from "vue-router"
    import { useTenantStore } from "@/stores/tenant"
    import axios from "axios"

    import Hero from "@/components/Hero.vue"

    // ✅ TOLTO: BodyTypeCarousel
    import BrandCarousel from "@/components/BrandCarousel.vue"
    import { fetchBrandsCount } from "@/api/brandsPublic"
    import { mapBrandsCountToCarouselItems } from "@/mappers/brandsMapper"

    const brandItems = ref([])

    const route = useRoute()
    const tenant = useTenantStore()

    // slug = path (/index/:slug) oppure store (dominio custom)
    const slug = computed(() => route.params.slug || tenant.slug)

    // UI settings (tema, navbar, hero, footer ecc.)
    const uiSettings = ref(null)

    /* ===========================================
    FONT DINAMICO
    =========================================== */
    const applyFontFamily = (font) => {
        if (!font) return
        document.documentElement.style.setProperty("--dynamic-font", font)
        document.body.classList.add("dynamic-font")
    }

    /* ===========================================
    API: site-settings-public (UI)
    =========================================== */
    const fetchSiteSettings = async () => {
        if (!slug.value) return

        const url = `https://api.azcore.it/api/site-settings-public/${slug.value}`
        const res = await axios.get(url, { timeout: 15000 })
        uiSettings.value = res.data

        // TITLE
        document.title =
            uiSettings.value?.claim_hero ||
            uiSettings.value?.footer_text ||
            uiSettings.value?.meta_title ||
            ""

        // FAVICON
        const favicon =
            uiSettings.value?.avatar_url ||
            uiSettings.value?.logo_web ||
            uiSettings.value?.favicon_url

        if (favicon) {
            let link = document.querySelector("link[rel~='icon']")
            if (!link) {
                link = document.createElement("link")
                link.rel = "icon"
                document.head.appendChild(link)
            }
            link.href = `${favicon}?v=${Date.now()}`
            link.type = "image/png"
        }

        applyFontFamily(uiSettings.value?.font_family)
    }

    /* ===========================================
    BOOT
    =========================================== */
    watch(
        slug,
        async (newSlug) => {
            if (!newSlug) return

            try {
                await fetchSiteSettings()
            } catch (e) {
                uiSettings.value = null
            }

            try {
                const rawBrands = await fetchBrandsCount(newSlug)
                brandItems.value = mapBrandsCountToCarouselItems(rawBrands)

                console.log("[brands raw]", rawBrands)
                console.log("[brands mapped]", brandItems.value)

            } catch (e) {
                console.error("[IndexPage] fetchBrandsCount failed:", e)
                brandItems.value = []
            }
        },
        { immediate: true }
    )


</script>

<template>
  <div v-if="uiSettings" style="min-height: 100vh; background: #fff;">
    <Hero :settings="uiSettings" :slug="slug" />

    <!-- ✅ TOLTO: BodyTypeCarousel -->

    <!-- ✅ I BRAND: arrivano dall’endpoint -->
    <BrandCarousel :settings="uiSettings" :slug="slug" :items="brandItems" />
  </div>

  <div v-else class="loading">Caricamento...</div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  max-width: 100vw;
  overflow-x: hidden;
}
body.dynamic-font {
  font-family: var(--dynamic-font) !important;
}
</style>

<style scoped>
.loading {
  padding: var(--u-4);
  text-align: center;
  font-size: var(--fs-sm);
}
</style>
