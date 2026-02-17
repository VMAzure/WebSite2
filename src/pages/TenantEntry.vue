<script setup>
    import { onMounted } from "vue";
    import { useRouter } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";
    import { resolveTenantSlug } from "@/tenant/bootstrapTenant";

    const router = useRouter();
    const tenant = useTenantStore();

    onMounted(() => {
        (async () => {
            try {
                console.log("[TenantEntry] hostname:", window.location.hostname);
                console.log("[TenantEntry] path:", window.location.pathname);

                const resolved = await resolveTenantSlug(router.currentRoute.value);
                console.log("[TenantEntry] resolved:", resolved);

                if (!resolved?.slug) {
                    await router.replace("/tenant-not-configured");
                    return;
                }

                tenant.setTenant(resolved);

                if (resolved.source === "path") {
                    // ✅ railway/shared: canonical /:slug
                    await router.replace(`/${resolved.slug}`);
                } else {
                    // domain-based
                    await router.replace(`/`);
                }


                console.log("[TenantEntry] redirect done");
            } catch (e) {
                console.error("[TenantEntry] ERROR:", e);
                await router.replace("/tenant-not-configured");
            }
        })();
    });
</script>
