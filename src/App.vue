<script setup>
    import { computed, watch } from "vue"
    import { useRoute } from "vue-router"
    import { useTenantStore } from "./stores/tenant"

    const route = useRoute()
    const tenantStore = useTenantStore()

    const slugFromPath = computed(() => {
        const s = route.params.slug ? String(route.params.slug) : null
        return s && s !== "default" ? s : null
    })

    watch(
        slugFromPath,
        async (slug) => {
            // ✅ se ho slug nel path, NON faccio resolve
            if (slug) return

            // ✅ in locale non faccio resolve
            if (window.location.hostname === "localhost") return

            // ✅ solo root domain senza slug
            try {
                const resolved = await tenantStore.resolveTenantByHost()
                if (resolved) tenantStore.setSlug(resolved)
            } catch {
                // silenzioso
            }
        },
        { immediate: true }
    )
</script>

<template>
  <router-view />
</template>
