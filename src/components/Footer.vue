<script setup>
defineProps({
  slug: { type: String, required: true },
});
</script>

<template>
  <footer class="footer">
    <div class="left">© {{ new Date().getFullYear() }} AZCORE</div>
    <div class="right">tenant: <b>{{ slug }}</b></div>
  </footer>
</template>

<style scoped>
.footer{
  margin-top: 24px;
  padding: 16px 24px;
  background: rgba(255,255,255,0.04);
  border-top: 1px solid rgba(255,255,255,0.10);
  display:flex;
  justify-content:space-between;
  gap: 12px;
  opacity: 0.9;
}
</style>
