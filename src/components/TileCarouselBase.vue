<script setup>
    import { ref, computed } from "vue";

    const props = defineProps({
        title: { type: String, required: true },
        viewAllLabel: { type: String, default: "Vedi tutto" },
        viewAllTo: { type: [String, Object], default: null },
        items: { type: Array, default: () => [] }, // [{ key, label, iconUrl }]
    });

    defineEmits(["select"]);

    const scrollerRef = ref(null);
    const hasItems = computed(() => (props.items?.length || 0) > 0);

    const scrollByCard = (dir) => {
        const el = scrollerRef.value;
        if (!el) return;
        const card = el.querySelector("[data-tile]");
        const step = card ? card.getBoundingClientRect().width + 16 : 320;
        el.scrollBy({ left: dir * step, behavior: "smooth" });
    };
</script>

<template>
  <section class="row">
    <header class="head">
      <h2 class="title">{{ title }}</h2>

      <div class="actions">
        <router-link v-if="viewAllTo" class="viewall" :to="viewAllTo">
          {{ viewAllLabel }} <span class="chev">›</span>
        </router-link>

        <div class="nav" v-if="hasItems">
          <button
            class="navbtn"
            type="button"
            aria-label="Indietro"
            @click="scrollByCard(-1)"
          >
            ‹
          </button>
          <button
            class="navbtn"
            type="button"
            aria-label="Avanti"
            @click="scrollByCard(1)"
          >
            ›
          </button>
        </div>
      </div>
    </header>

    <div class="scroller" ref="scrollerRef">
      <button
        v-for="it in items"
        :key="it.key"
        class="tile"
        type="button"
        data-tile
        @click="$emit('select', it)"
      >
        <div class="tileInner">
          <img
            v-if="it.iconUrl"
            class="icon"
            :src="it.iconUrl"
            :alt="it.label"
            loading="lazy"
          />
          <div class="label">{{ it.label }}</div>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.row {
  width: 100%;
  padding: clamp(1.2rem, 3vw, 2rem) clamp(1rem, 1.5vw, 1.6rem);
}


.head {
  width: 100%;
  max-width: none;
  margin: 0;

  /* ✅ filo di bordo SEMPRE visibile */
  padding-left: max(1rem, 1.5vw);
  padding-right: max(1rem, 1.5vw);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.8rem, 2.2vw, 1.4rem);
}




.title {
  margin: 0;
  font-size: clamp(1.15rem, 2.4vw, 1.55rem);
  font-weight: 800;
  letter-spacing: -0.01em;
}

.actions {
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 2vw, 1rem);
}

.viewall {
  text-decoration: none;
  font-size: clamp(0.9rem, 1.8vw, 1.05rem);
  font-weight: 600;
  padding: clamp(0.45rem, 1.3vw, 0.6rem) clamp(0.7rem, 2vw, 0.9rem);
  border-radius: 999rem;
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.chev {
  opacity: 0.75;
}

.nav {
  display: inline-flex;
  gap: 0.5rem;
}

.navbtn {
  width: clamp(2.1rem, 4.6vw, 2.6rem);
  height: clamp(2.1rem, 4.6vw, 2.6rem);
  border-radius: 999rem;
  border: 0.06rem solid rgba(0, 0, 0, 0.14);
  background: #fff;
  cursor: pointer;
  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  line-height: 1;
}

.scroller {
  width: 100%;
  margin-top: clamp(0.9rem, 2.4vw, 1.2rem);

  /* ✅ stesso gutter della head */
  padding-left: max(1rem, 1.5vw);
  padding-right: max(1rem, 1.5vw);

  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(8.8rem, 16vw, 11.5rem);
  gap: clamp(0.7rem, 1.8vw, 1rem);

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  max-width: none;
}


.scroller::-webkit-scrollbar {
  height: 0;
}

.tile {
  border: 0;
  background: rgba(0, 0, 0, 0.03);
  border-radius: clamp(0.8rem, 2vw, 1.1rem);
  padding: clamp(0.9rem, 2.2vw, 1.1rem);
  cursor: pointer;
  scroll-snap-align: start;
}

.tileInner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.55rem, 1.6vw, 0.8rem);
}
.icon {
  width: clamp(3.6rem, 7vw, 4.6rem);
  height: clamp(3rem, 6vw, 3.8rem);
  object-fit: contain;
  display: block;
}
.label {
  font-size: clamp(0.85rem, 1.6vw, 0.98rem);
  font-weight: 600;
  opacity: 0.9;
  text-align: center;
  line-height: 1.2;
}
</style>
