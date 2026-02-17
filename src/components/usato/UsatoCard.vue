<script setup>
    import { computed } from "vue";
    import { useRouter, useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const props = defineProps({ car: Object });

    const router = useRouter();
    const route = useRoute();
    const tenant = useTenantStore();

    const effectiveSlug = computed(() =>
        String(route.params?.slug || tenant.slug || "").trim()
    );

    // usa id se c’è, fallback su slug se è l’unica cosa che hai
    const carId = computed(() =>
        String(
            props.car?.id ??
            props.car?.id_auto ??
            props.car?.uuid ??
            props.car?.slug ??
            ""
        ).trim()
    );

    function goToDetail() {
        const s = effectiveSlug.value;
        const id = carId.value;
        if (!id) return;

        // ✅ path-tenant (Railway/shared): /:slug/usato/:id
        if (tenant.source === "path" && s) {
            router.push(`/${s}/usato/${encodeURIComponent(id)}`);
            return;
        }

        // ✅ domain-tenant: /usato/:id
        router.push(`/usato/${encodeURIComponent(id)}`);
    }
</script>

<template>
  <div class="card" role="link" tabindex="0" @click="goToDetail" @keydown.enter="goToDetail">
    <img :src="car.image" alt="" />
    <h3>{{ car.brand }} {{ car.model }}</h3>
    <p>{{ car.price }} €</p>
  </div>
</template>
