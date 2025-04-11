<template>
  <v-card flat class="pa-4">
    <h3 class="text-h6 text-center mb-4">Anuncios</h3>

    <v-skeleton-loader
      v-if="loading"
      type="list-item-two-line"
      :loading="loading"
    />

    <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>

    <template v-if="!loading && anuncios.length">
      <v-list v-if="!isMobile">
        <v-list-item 
          v-for="(a, i) in anuncios" 
          :key="i"
          :class="{ 'espaciado-anuncio': i > 0 }">
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold titulo-anuncio">
              {{ a.anun_titulo }}
            </v-list-item-title>
            <div class="full-description">
              {{ a.anun_descripcion }}
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-expansion-panels v-else>
        <v-expansion-panel v-for="(a, i) in anuncios" :key="i">
          <v-expansion-panel-title>{{ a.anun_titulo }}</v-expansion-panel-title>
          <v-expansion-panel-text>{{ a.anun_descripcion }}</v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <v-alert
      v-if="!loading && !anuncios.length && !error"
      type="info"
      dense
      class="text-center"
    >
      No hay anuncios disponibles
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'

const anuncios = ref([])
const loading = ref(false)
const error = ref('')
const { mobile: isMobile } = useDisplay()

async function fetchAnuncios() {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const profile = localStorage.getItem('profile')

    const response = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsListaAnunciosPublicados.php',
      {
        params: { av_profile: profile },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.status) {
      anuncios.value = response.data.data
    } else {
      error.value = response.data.message || 'No se encontraron anuncios'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar los anuncios'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnuncios)
</script>

<style scoped>
.v-list-item-title {
  font-size: 1rem;
}
.titulo-anuncio {
  white-space: normal;
  word-break: break-word;
  text-align: center;
  line-height: 1.3;
}
.v-list-item-subtitle {
  font-size: 0.875rem;
}
.text-wrap {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
.full-description {
  white-space: normal;
  overflow-wrap: break-word;
  font-size: 0.875rem;
  margin-top: 4px;
}
.espaciado-anuncio {
  margin-top: 16px; /* Puedes ajustar a 12px o 24px según tu diseño */
}
</style>
