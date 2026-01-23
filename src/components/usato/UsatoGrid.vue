<template>
  <div class="grid">
    <UsatoCard
      v-for="car in cars"
      :key="car.id"
      :car="car"
    />
  </div>
</template>

<script setup>
defineProps({
  cars: Array
})
</script>
