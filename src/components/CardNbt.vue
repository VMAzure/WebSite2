<template>
  <button class="card" type="button" @click="$emit('open', item)">
    <div class="name">{{ item.title }}</div>
    <div class="cta">Seleziona</div>
  </button>
</template>

<script setup>
defineProps({ item: { type: Object, required: true } })
defineEmits(["open"])
</script>
