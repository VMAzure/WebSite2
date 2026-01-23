<script setup="">
    defineProps({
        settings: Object
    })
</script>

<template>
	<section
	  class="hero hero-full"
	  :style="{
      backgroundImage: settings?.hero_image_url
  ? `url('${encodeURI(settings.hero_image_url)}')`
  : 'none'

    }"
  >
		<!-- Overlay premium -->
		<div class="overlay"></div>

		<!-- Contenuto -->
		<div class="hero-content">
			<p v-if="settings.claim_hero" class="claim">
				{{ settings.claim_hero }}
			</p>

			<p v-if="settings.subclaim_hero" class="subclaim">
				{{ settings.subclaim_hero }}
			</p>
		</div>
	</section>
</template>

<style scoped="">
	/* ============================================================
	HERO FULL BLEED — come NAVBAR e TOPBAR
	============================================================ */
	.hero-full {
	width: 100vw;
	margin-left: calc(50% - 50vw);
	display: block;
	overflow: hidden;
	}

	/* ============================================================
	HERO PREMIUM
	============================================================ */
	.hero {
	height: clamp(55vh, 72vh, 85vh);
	min-height: clamp(22rem, 48vw, 40rem);

	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;

	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;

	transition: background-image 0.4s ease-out;
	}

	/* ============================================================
	OVERLAY PREMIUM con gradiente automotive
	============================================================ */
	.overlay {
	position: absolute;
	inset: 0;
	background:
	linear-gradient(
	to bottom,
	rgba(0, 0, 0, 0.25) 0%,
	rgba(0, 0, 0, 0.45) 45%,
	rgba(0, 0, 0, 0.55) 100%
	);
	z-index: 3;
	}

	/* ============================================================
	CONTENUTO
	============================================================ */
	.hero-content {
	position: relative;
	z-index: 5;
	text-align: center;
	max-width: 85vw;

	padding: 0 clamp(1rem, 4vw, 2rem);
	color: white;

	display: flex;
	flex-direction: column;

	}

	/* Claim grande, automotive luxury */
	.claim {
	font-size: clamp(2.6rem, 6vw, 4rem);
	font-weight: 400;
	letter-spacing: -0.02em;
	line-height: 1.1;
	text-shadow: 0 0.4rem 1.2rem rgba(0,0,0,0.45);
	opacity: 0;
	transform: translateY(1rem);
	animation: fadeUp 0.9s ease forwards;
	margin-bottom: 0;
	}

	/* Subclaim più morbido */
	.subclaim {
	font-size: clamp(1.3rem, 3vw, 2rem);
	font-weight: 400;
	opacity: 0.9;
	line-height: 1.35;
	text-shadow: 0 0.35rem 1rem rgba(0,0,0,0.35);
	opacity: 0;
	transform: translateY(1.2rem);
	animation: fadeUp 1.2s ease forwards;
	margin-top: 1rem;
	}

	/* Animazioni premium */
	@keyframes fadeUp {
	to {
	opacity: 1;
	transform: translateY(0);
	}
	}
</style>
