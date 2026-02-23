<script setup>
    import { computed } from "vue";
    import { useRouter } from "vue-router";
    import TileCarouselBase from "@/components/TileCarouselBase.vue";

    const props = defineProps({
        settings: { type: Object, required: true },
        slug: { type: String, required: true },

        // [{ key, label, iconUrl }]
        items: { type: Array, default: () => [] },

        title: { type: String, default: "Cerca per marche" },
        queryKey: { type: String, default: "brand" },
    });

    const router = useRouter();

    const usatoPath = computed(() => {
        return import.meta.env.DEV ? `/index/${props.slug}/usato` : `/usato`;
    });

    const safeItems = computed(() => {
        const arr = Array.isArray(props.items) ? props.items : [];
        return arr
            .filter(Boolean)
            .map((x) => ({
                key: String(x.key || "").trim(),
                label: String(x.label || "").trim(),
                iconUrl: String(x.iconUrl || "").trim(),
            }))
            .filter((x) => x.key && x.label);
    });

    const onSelect = (it) => {
        router.push({
            path: usatoPath.value,
            query: { [props.queryKey]: it.key },
        });
    };
</script>

<template>
  <TileCarouselBase
    v-if="safeItems.length"
    :title="title"
    :viewAllTo="usatoPath"
    :items="safeItems"
    @select="onSelect"
  />
</template>
