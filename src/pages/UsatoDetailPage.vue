const slug = computed(() => route.params.slug || tenant.slug)
const carSlug = route.params.carSlug
<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useTenantStore } from "@/stores/tenant"
import { fetchUsatoDetail, fetchUsatoFoto, inviaContattoUsato } from "@/api/usatoPublic"

const route = useRoute()
const router = useRouter()
const tenant = useTenantStore()

const slug = computed(() => (route.params.slug || tenant.slug || "").toString().trim())
const idAuto = computed(() => String(route.params.id || "").trim())

const loading = ref(true)
const error = ref("")
const car = ref(null)
const foto = ref([])

const form = ref({ nome: "", cognome: "", email: "", telefono: "", messaggio: "" })
const sending = ref(false)
const sentOk = ref(false)

async function load() {
  error.value = ""
  loading.value = true
  sentOk.value = false

  if (!slug.value) {
    router.replace("/tenant-not-configured")
    return
  }

  try {
    car.value = await fetchUsatoDetail(slug.value, idAuto.value)
    foto.value = await fetchUsatoFoto(slug.value, idAuto.value)
  } catch (e) {
    error.value = "Errore nel caricamento dettaglio"
  } finally {
    loading.value = false
  }
}

async function submit() {
  sending.value = true
  sentOk.value = false
  try {
    await inviaContattoUsato({
      slug: slug.value,
      payload: {
        id_auto: (car.value?.id || car.value?.id_auto || idAuto.value),
        ...form.value,
      },
    })
    sentOk.value = true
  } catch (e) {
    error.value = "Errore invio richiesta"
  } finally {
    sending.value = false
  }
}

onMounted(load)
watch([slug, idAuto], load)
</script>

<template>
  <section style="padding:16px">
    <button @click="$router.back()">← Indietro</button>

    <div v-if="loading" style="margin-top:12px">Caricamento…</div>
    <div v-else-if="error" style="margin-top:12px">{{ error }}</div>

    <div v-else style="margin-top:12px">
      <h1 style="margin:0 0 8px">
        {{ car?.marca || car?.brand }} {{ car?.modello || car?.model }}
      </h1>

      <pre style="background:#fafafa; padding:12px; border-radius:12px; overflow:auto">{{ car }}</pre>

      <h2>Contattaci su questa auto</h2>

      <div v-if="sentOk" style="padding:10px; border:1px solid #cfc; border-radius:10px">
        Richiesta inviata ✅
      </div>

      <form @submit.prevent="submit" style="display:grid; gap:8px; max-width:420px">
        <input v-model="form.nome" placeholder="Nome" required />
        <input v-model="form.cognome" placeholder="Cognome" required />
        <input v-model="form.email" placeholder="Email" required />
        <input v-model="form.telefono" placeholder="Telefono" required />
        <textarea v-model="form.messaggio" placeholder="Messaggio"></textarea>

        <button :disabled="sending">{{ sending ? "Invio…" : "Invia" }}</button>
      </form>
    </div>
  </section>
</template>
