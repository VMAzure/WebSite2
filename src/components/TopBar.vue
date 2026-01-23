<script setup>
    import { computed } from "vue"
    import { useTenantStore } from "@/stores/tenant"

    const props = defineProps({
        settings: Object,
        slug: String,
    })

    const tenant = useTenantStore()

    const compliance = computed(() => tenant.compliance || null)

    const iubendaCfg = computed(() => {
        const c = compliance.value
        if (!c?.enabled) return null
        if (c?.provider !== "iubenda") return null
        const cfg = c?.config || {}
        const privacyId = cfg.privacy_policy_id
        if (!privacyId) return null
        return {
            privacyId,
        }
    })

    const privacyLink = computed(() => {
        const cfg = iubendaCfg.value
        if (!cfg?.privacyId) return null
        return `https://www.iubenda.com/privacy-policy/${cfg.privacyId}`
    })
</script>


<template>
	<div
	  class="topbar"
	  :style="{
      backgroundColor: settings.primary_color,
      '--secondary': settings.secondary_color,
      '--tertiary': settings.tertiary_color
    }"
  >
		<!-- DEBUG TOPBAR: v3 -->
<div style="position:absolute; left:-9999px;">TOPBAR_DEBUG_V3</div>

		<!-- LEFT -->
		<div class="left">
			<a
			  v-if="settings.contact_email"
			  :href="`mailto:${settings.contact_email}`"
			  class="topbar-link"
      >
				<i class="fa-solid fa-envelope"></i>
				{{ settings.contact_email }}
			</a>

			<a
			  v-if="settings.contact_phone"
			  :href="`tel:${settings.contact_phone}`"
			  class="topbar-link"
      >
				<i class="fa-solid fa-phone"></i>
				{{ settings.contact_phone }}
			</a>
		</div>

		<!-- CENTER LOGO -->
		<div class="center">
			<router-link :to="slug ? `/index/${slug}` : `/`" class="logo-link">
				<img
				  v-if="settings.logo_web"
				  :src="settings.logo_web"
				  class="logo"
				  alt="logo"
        />
			</router-link>
		</div>

		<!-- debug temporaneo -->
<span style="display:none">{{ privacyLink }}</span>


		<!-- RIGHT SOCIAL -->
		<div class="right">
			<a
  v-if="privacyLink"
  :href="privacyLink"
  class="privacy-link"
  target="_blank"
  rel="noopener"
>
  Privacy
</a>
			<a v-if="settings.facebook_url" :href="settings.facebook_url" target="_blank">
				<i class="fa-brands fa-facebook"></i>
			</a>
			<a v-if="settings.instagram_url" :href="settings.instagram_url" target="_blank">
				<i class="fa-brands fa-instagram"></i>
			</a>
			<a v-if="settings.tiktok_url" :href="settings.tiktok_url" target="_blank">
				<i class="fa-brands fa-tiktok"></i>
			</a>
			<a v-if="settings.youtube_url" :href="settings.youtube_url" target="_blank">
				<i class="fa-brands fa-youtube"></i>
			</a>
			<a v-if="settings.linkedin_url" :href="settings.linkedin_url" target="_blank">
				<i class="fa-brands fa-linkedin"></i>
			</a>
			<a v-if="settings.x_url" :href="settings.x_url" target="_blank">
				<i class="fa-brands fa-x-twitter"></i>
			</a>
			<a v-if="settings.whatsapp_url" :href="settings.whatsapp_url" target="_blank">
				<i class="fa-brands fa-whatsapp"></i>
			</a>
		</div>
	</div>
</template>

<style scoped="">
	.topbar {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;

	padding: clamp(0.55rem, 1.4vw, 0.95rem) clamp(1rem, 3vw, 1.4rem);


	gap: clamp(0.6rem, 2vw, 1.2rem);
	font-size: clamp(0.85rem, 1.7vw, 1rem);

	box-shadow: 0 0.25rem 0.9rem rgba(0,0,0,0.08);
	position: relative;
	z-index: 999;
	}

	/* LEFT */
	.left {
	display: flex;
	gap: clamp(0.6rem, 2vw, 1.3rem);
	align-items: center;
	white-space: nowrap;
	}

	.topbar-link {
	color: var(--secondary);
	text-decoration: none;
	display: flex;
	align-items: center;
	gap: clamp(0.3rem, 1vw, 0.55rem);
	font-weight: 500;
	transition: opacity 0.25s ease;
	}
	.topbar-link:hover { opacity: 0.6; }

	/* CENTER */
	.center {
	flex: 1;
	display: flex;
	justify-content: center;
	}
	.logo-link {
	display: flex;
	}
	.logo {
	max-height: clamp(2.5rem, 4.8vw, 3.2rem);
	object-fit: contain;
	transition: transform 0.25s ease;
	}
	.logo-link:hover .logo {
	transform: none;
	opacity: 0.85; /* feedback leggero, elegante */
}


	/* RIGHT */
	.right {
	display: flex;
	gap: clamp(0.6rem, 2vw, 1.1rem);
	align-items: center;
	}
	.right i {
	font-size: clamp(1.15rem, 3vw, 1.55rem);
	color: var(--secondary);
	transition: opacity 0.25s ease, transform 0.25s ease;
	}
	.right i:hover {
	opacity: 0.55;
	transform: translateY(-0.1rem);
	}

	.privacy-link{
  color: var(--tertiary);
  text-decoration: none;
  font-weight: 400;
  padding: clamp(0.25rem, 0.7vw, 0.45rem) clamp(0.55rem, 1.2vw, 0.85rem);
  border: 0.10rem solid var(--tertiary);
  border-radius: 1.2rem;
  transition: opacity 0.25s ease, transform 0.25s ease;
  white-space: nowrap;
}

.privacy-link:hover{
  opacity: 0.65;
  transform: translateY(-0.05rem);
}

/* ===== DESKTOP: logo centrato perfettamente nella barra ===== */
@media (min-width: 901px) {
  .topbar {
    position: relative; /* già c'è, ma lo ribadisco */
	 /* 🔥 PIÙ ALTEZZA DESKTOP */
    padding-top: clamp(1.5rem, 1.8vw, 1.1rem);
    padding-bottom: clamp(1.5rem, 1.8vw, 1.1rem);
  }

  .center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    /* evita che il flex:1 faccia cose strane */
    flex: none;
    width: max-content;

    z-index: 5;
  }

  .fa-whatsapp {
        color: green !important;
    }
}


	/* MOBILE */
@media (max-width: 900px) {
	.topbar {
	flex-direction: column;
	text-align: center;
	padding: clamp(0.7rem, 3vw, 1.2rem) clamp(1rem, 4vw, 1.6rem);
	gap: clamp(0.35rem, 2vw, 0.7rem);
	}

	.left, .right {
	justify-content: center;
	flex-wrap: wrap;
	}

	.logo {
	max-height: clamp(3rem, 8vw, 3.8rem);
	}

	.fa-whatsapp {
      color: green !important;
  }
}
</style>
