<template>
	<nav
	  :class="['navbar', { 'navbar-fixed': isFixed }]"
	  class="navbar-full"
	  :style="{
      backgroundColor: settings.secondary_color,
      borderBottom: '0.2rem solid ' + settings.tertiary_color,
      '--hover-color': settings.tertiary_color
    }"
 >
		<!-- ===== MOBILE HEADER ===== -->
		<div class="mobile-header">
			<button class="hamburger" @click="open = !open">
				<i class="fa-solid" :class="open ? 'fa-xmark' : 'fa-bars'"></i>
			</button>
		</div>

		<!-- ===== MENU MOBILE + DESKTOP ===== -->
		<ul :class="{ open: open }">
			<li class="mobile-item first-item">
				<router-link class="nav-link" :to="isDev ? `/index/${slug}` : `/`">
					Home
				</router-link>
			</li>

			<li
			  v-for="(srv, i) in menuItems"
			  :key="i"
			  class="mobile-item"
      >
				<!-- LINK INTERNI -->
			<router-link
  v-if="!isExternal(srv.link)"
  class="nav-link"
  :to="srv._forceAbsolute ? srv.link : toTenantPath(srv.link)"
>

					{{ srv.title }}
				</router-link>

				<!-- LINK ESTERNI -->
			<a
			  v-else
			  class="nav-link"
			  :href="srv.link"
			  target="_blank"
			>
		
					{{ srv.title }}
				</a>
			</li>
		</ul>
	</nav>
</template>



<script setup="">
    import { ref, computed, onMounted, onUnmounted } from "vue"

    const props = defineProps({
        slug: String,
        settings: Object
    })

    const isDev = computed(() => import.meta.env.DEV)

    const usatoVetrinaPath = computed(() => {
        return isDev.value ? `/index/${props.slug}/usato-vetrina` : `/usato-vetrina`
    })

    function normalizePath(p) {
        const s = String(p || "").trim()
        if (!s) return "/"
        return s.startsWith("/") ? s : `/${s}`
    }

    function toTenantPath(p) {
        const path = normalizePath(p)

        // in DEV: sempre /index/:slug + path
        if (isDev.value) return `/index/${props.slug}${path}`

        // in PROD (dominio): path pulito
        return path
    }


    const open = ref(false)
    const isFixed = ref(false)

    /* ------------------------------
    MENU GENERATO DA SETTINGS
    -------------------------------- */
    const menuItems = computed(() => {
        const visibility = props.settings?.servizi_visibili || {}
        const details = props.settings?.servizi_dettaglio || {}

        return Object.keys(visibility)
            .filter(k => visibility[k])
            .map(k => {
                const title = String(details[k]?.title || k).trim()
                const link = String(details[k]?.link || "#").trim()

                // ✅ Intercetta la voce "Vendita" (qualunque label tu abbia messo nel tenant)
                const t = title.toLowerCase()

                const isVendita =
                    t === "vendita" ||
                    t === "vendita veicoli" ||
                    t === "vetrina proposte"

                if (isVendita) {
                    return { title, link: usatoVetrinaPath.value, _forceAbsolute: true }
                }

                return { title, link }
            })
    })


    const isExternal = link => /^https?:\/\//i.test(link)

    /* ------------------------------
    STICKY NAVBAR DINAMICA
    -------------------------------- */
    const onScroll = () => {
        isFixed.value = window.scrollY > 80 // dinamico, non cambia
    }

    onMounted(() => window.addEventListener("scroll", onScroll))
    onUnmounted(() => window.removeEventListener("scroll", onScroll))
</script>



<style scoped="">
	/* ============================================
	FULL WIDTH ASSOLUTO
	============================================ */
	.navbar-full {
	width: 100vw;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	overflow: hidden;
	}

	/* BASE NAVBAR */
	.navbar {
	width: 100vw;
	margin: 0;
	padding: 0;
	position: relative;
	z-index: 3000;
	transition: all 0.25s ease;
	}

	/* ============================================
	STICKY MODE PREMIUM
	============================================ */
	.navbar-fixed {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;

	/* stesso effetto della tua UI */
	backdrop-filter: blur(0.6rem);
	-webkit-backdrop-filter: blur(0.6rem);
	background-color: rgba(0, 0, 0, 0.85) !important;
	}

	/* ============================================
	MOBILE HEADER
	============================================ */
	.mobile-header {
	display: flex;
	justify-content: flex-end;
	align-items: center;

	/* PADDING DINAMICO → NAVBAR MOBILE */
	padding: clamp(0.8rem, 4vw, 1.2rem);
	}

	.hamburger {
	font-size: clamp(1.6rem, 4vw, 2rem);
	color: white;
	background: none;
	border: none;
	cursor: pointer;
	}

	/* ============================================
	MENU MOBILE
	============================================ */
	ul {
	list-style: none;
	padding: 0;
	margin: 0;
	width: 100%;
	display: none;
	flex-direction: column;
	text-align: center;
	}

	ul.open {
	display: flex;
	}

	.mobile-item {
	padding: clamp(0.9rem, 3vw, 1.2rem) 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}

	.first-item {
	border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.mobile-item:last-child {
	border-bottom: none;
	}

	.nav-link {
	color: white;
	text-decoration: none;

	/* FONT DINAMICO */
	font-size: clamp(1.1rem, 3vw, 1.3rem);
	display: block;
	font-weight: 500;
	}

	/* ============================================
	DESKTOP PREMIUM
	============================================ */
	@media (min-width: 64rem) {
	.mobile-header {
	display: none;
	}

	ul {
	display: flex !important;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	/* PADDING → ALTEZZA NAVBAR DESKTOP */
	padding: clamp(1rem, 2vw, 1.6rem) 0;
	gap: clamp(1.6rem, 3vw, 3rem);
	}

	.mobile-item {
	border: none !important;
	padding: 0 !important;
	}

	.nav-link {
	font-size: clamp(1rem, 1.2vw, 1.2rem);
	font-weight: 500;
	padding: 0.2rem 0;
	position: relative;
	}

	/* Underline animato premium */
	.nav-link::after {
	content: "";
	position: absolute;
	bottom: -0.35rem;
	left: 50%;
	height: 0.15rem;
	width: 0;
	background: var(--hover-color);
	transform: translateX(-50%);
	transition: width 0.25s ease;
	}

	.nav-link:hover::after {
	width: 65%;
	}
	}
</style>
