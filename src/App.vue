<script setup>
    import { onMounted } from "vue"
    import { useRoute } from "vue-router"
    import { useTenantStore } from "./stores/tenant"

    const route = useRoute()
    const tenantStore = useTenantStore()

    onMounted(async () => {
        const slugFromPath = route.params.slug ? String(route.params.slug) : null

        // 🔒 SE c'è uno slug nel path → NON fare resolve
        if (slugFromPath && slugFromPath !== "default") {
            return
        }

        // 🔒 In locale non fare resolve
        if (window.location.hostname === "localhost") {
            return
        }

        // ✅ SOLO root domain senza slug
        const resolved = await tenantStore.resolveTenantByHost()
        if (!resolved) return

        tenantStore.setSlug(resolved)
    })
</script>

<template>
  <router-view />
</template>
