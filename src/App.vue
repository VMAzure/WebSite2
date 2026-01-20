<script setup>
    import { onMounted } from "vue"
    import { useRoute } from "vue-router"
    import { useTenantStore } from "./stores/tenant"

    const route = useRoute()
    const tenantStore = useTenantStore()

    onMounted(async () => {
        const slugFromPath = route.params.slug ? String(route.params.slug) : null

        // 1) slug nel path => niente resolve, carico settings e basta
        if (slugFromPath && slugFromPath !== "default") {
            tenantStore.setTenant(slugFromPath, "path")
            await tenantStore.loadPublicSettings(slugFromPath)
            return
        }

        // 2) se sono in locale, non provo nemmeno la resolve
        if (window.location.hostname === "localhost") return

        // 3) root domain => resolve
        const resolved = await tenantStore.resolveTenantByHost()
        if (!resolved) return

        await tenantStore.loadPublicSettings(resolved)
    })
</script>

<template>
  <router-view />
</template>
