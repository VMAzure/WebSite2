<script setup>
defineProps({
  slug: { type: String, required: true },
});
</script>

<template>
  <header class="nav">
    <div class="brand">AZCORE</div>
    <div class="tenant">
      Tenant: <b>{{ slug }}</b>
    </div>
  </header>
</template>

<style scoped>
.nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 16px 24px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.brand{
  font-weight: 800;
  letter-spacing: 0.5px;
}
.tenant{
  opacity: 0.9;
}
</style>
