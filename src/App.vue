<script setup>
    import { onMounted } from "vue"
    import { useRoute } from "vue-router"
    import { useTenantStore } from "./stores/tenant"

    const route = useRoute()
    const tenantStore = useTenantStore()

    onMounted(async () => {
        const slugFromPath = route.params.slug
            ? String(route.params.slug)
            : null

        // 🔒 SE c'è uno slug nel path → NON fare resolve
        if (slugFromPath && slugFromPath !== "default") {
            return
        }

        // 🔒 In locale NON fare resolve
        if (window.location.hostname === "localhost") {
            return
        }

        // ✅ SOLO root domain senza slug
        try {
            const resolved = await tenantStore.resolveTenantByHost()
            if (resolved) {
                tenantStore.setSlug(resolved)
            }
        } catch {
            // silenzioso: il BE può non conoscere ancora il dominio
        }
    })
</script>

<template>
  <router-view />
</template>
