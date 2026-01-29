<script setup>
    import { useRouter, useRoute } from "vue-router";
    import { useTenantStore } from "@/stores/tenant";

    const props = defineProps({ car: Object });
    const router = useRouter();
    const route = useRoute();
    const tenant = useTenantStore();

    const slug = route.params.slug || tenant.slug;

    function goToDetail() {
        router.push(
            slug
                ? `/index/${slug}/usato/${props.car.slug}`
                : `/usato/${props.car.slug}`,
        );
    }
</script>

<template>
  <div class="card" @click="goToDetail">
    <img :src="car.image" />
    <h3>{{ car.brand }} {{ car.model }}</h3>
    <p>{{ car.price }} €</p>
  </div>
</template>
