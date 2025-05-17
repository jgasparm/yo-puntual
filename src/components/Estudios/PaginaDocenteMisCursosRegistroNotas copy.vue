<template>
  <v-container class="pt-0 pb-4">
    <!-- Cabecera -->
    <v-row class="mb-2">
      <v-col cols="12" class="text-center">
        <h2 class="text-h5 font-weight-bold text-primary">📖 Registro de Notas</h2>
        <p class="text-subtitle-2 mt-1 text-grey-darken-1">
          Registra o actualiza las calificaciones de los alumnos por actividad.
        </p>
      </v-col>
    </v-row>

    <!-- Curso y Periodo (responsive y accesible visualmente) -->
    <v-row class="mb-2" justify="center" align="center">
      <v-col cols="12" md="auto" class="d-flex justify-center align-center">
        <v-chip class="font-weight-medium px-4" color="primary" text-color="white" label>
          <v-icon start size="18">mdi-book-open-page-variant</v-icon>
          Curso: {{ cursoSeleccionado?.aede_nombre }}
        </v-chip>
      </v-col>
      <v-col cols="12" md="auto" class="d-flex justify-center align-center">
        <v-chip class="font-weight-medium px-4" color="indigo" text-color="white" label>
          <v-icon start size="18">mdi-calendar-range</v-icon>
          Periodo: {{ bimestre?.peed_nombre }}
        </v-chip>
      </v-col>
    </v-row>



    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6">
        <v-select
          v-model="selectedCompetencia"
          :items="competencias"
          item-title="comp_nombre"
          item-value="pcco_id"
          return-object
          label="Competencias"
          clearable
          solo
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          v-model="selectedActividad"
          :items="actividades"
          item-title="acti_nombre"
          item-value="pcca_id"
          return-object
          label="Actividades"
          clearable
          :disabled="!selectedCompetencia"
          solo
        />
      </v-col>
    </v-row>

    <!-- Desktop: Tabla -->
    <v-data-table
      v-if="$vuetify.display.mdAndUp"
      :headers="headers"
      :items="filteredItems"
      class="elevation-1 mt-4"
    >
      <template v-slot:item.nota="{ item }">
        <v-text-field
          v-model="item.nota"
          type="number"
          min="0"
          max="20"
          density="compact"
          hide-details
          @input="actualizarLetra(item)"
        />
      </template>

      <template v-slot:item.nota_letra="{ item }">
        <span>{{ item.nota_letra }}</span>
      </template>

      <template v-slot:item.alumno="{ item }">
        <div style="text-align: left; padding-left: 12px;">{{ item.alumno }}</div>
      </template>
    </v-data-table>

    <!-- Mobile: Tarjetas -->
    <v-row v-else class="mt-2" dense>
      <v-col cols="12" v-for="item in filteredItems" :key="item.alum_id">
        <v-card class="pa-3">
          <div class="text-subtitle-2 font-weight-bold">{{ item.alumno }}</div>
          <v-row class="mt-2" align="center">
            <v-col cols="6">
              <v-text-field
                v-model="item.nota"
                label="Nota"
                type="number"
                min="0"
                max="20"
                density="compact"
                hide-details
                @input="actualizarLetra(item)"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :model-value="item.nota_letra"
                label="Letra"
                readonly
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón Guardar -->
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <v-btn color="primary" @click="guardarNotas">Guardar Notas</v-btn>
      </v-col>
    </v-row>

    <!-- Mensaje -->
    <v-snackbar v-model="mensajeActivo" color="success" timeout="3000">{{ mensaje }}</v-snackbar>
  </v-container>
</template>


<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const cursoSeleccionado = ref(JSON.parse(decodeURIComponent(route.query.curso)))
const bimestre = ref(JSON.parse(decodeURIComponent(route.query.bimestre)))
const detalle = ref(JSON.parse(decodeURIComponent(route.query.detalle)))
const pacuId = ref(route.query.pacu_id || cursoSeleccionado.value?.pacu_id || null)

const competencias = ref([])
const actividades = ref([])
const selectedCompetencia = ref(null)
const selectedActividad = ref(null)

const headers = [
  { title: 'N°', key: 'numero', align: 'center' },
  { title: 'Apellidos y Nombres', key: 'alumno', align: 'center' },
  { title: 'Nota', key: 'nota' },
  { title: 'Letra', key: 'nota_letra' }
]

const tableItems = ref([])
const mensajeActivo = ref(false)
const mensaje = ref('')

onMounted(() => {
  if (pacuId.value) {
    fetchCompetencias()
  } else {
    console.warn('pacuId no está definido al montar')
  }
})

watch(selectedCompetencia, async (val) => {
  if (val?.pcco_id) await fetchActividades(val.pcco_id)
})

watch(selectedActividad, () => {
  construirTabla()
})

function actualizarLetra(item) {
  const valor = parseFloat(item.nota)
  if (isNaN(valor)) {
    item.nota_letra = ''
    return
  }
  if (valor <= 10) item.nota_letra = 'C'
  else if (valor <= 13) item.nota_letra = 'B'
  else if (valor <= 17) item.nota_letra = 'A'
  else item.nota_letra = 'AD'
}

async function fetchCompetencias() {
  const token = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      ai_pacu_id: pacuId.value,
      ac_pcco_estado: 'A',
      av_profile: profile
    }
  }
  const res = await axios.get('https://amsoftsolution.com/amss/ws/wsConsultaPlanCurricularCompetencias.php', config)
  competencias.value = res.data.status ? res.data.data : []
  if (competencias.value.length > 0) {
    selectedCompetencia.value = competencias.value[0]
  }
}

async function fetchActividades(pcco_id) {
  const token = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      ai_pcco_id: pcco_id,
      ac_pcca_estado: 'A',
      av_profile: profile
    }
  }
  const res = await axios.get('https://amsoftsolution.com/amss/ws/wsConsultaPCCompetenciasActividades.php', config)
  actividades.value = res.data.status ? res.data.data : []
  if (actividades.value.length > 0) selectedActividad.value = actividades.value[0]
}

function construirTabla() {
  if (!detalle.value || !selectedActividad.value || !selectedCompetencia.value) return
  const alumnos = detalle.value.data
  const comp_id = selectedCompetencia.value.comp_id
  const pcca_id = selectedActividad.value.pcca_id
  const acti_id = selectedActividad.value.acti_id
  const items = alumnos.map((alum, index) => {
    const comp = alum.competencias.find(c => c.comp_id == comp_id)
    const act = comp?.actividades.find(a => a.pcca_id == pcca_id)
    return {
      numero: index + 1,
      alumno: alum.alumno,
      alum_id: alum.alum_id,

      pacu_id : pacuId.value,                       // id del curso
      pcal_id : alum.pcal_id,             // plan curricular alumno
      pcco_id : selectedCompetencia.value.pcco_id, // competencia seleccionada

      pcac_id  : comp?.pcac_id || null,
      acti_id  : act?.acti_id  || acti_id,
      pcaa_id: act?.pcaa_id || null,
      nota: act?.nota || null,
      nota_letra: act?.nota_letra || null
    }
  })
  tableItems.value = items
}

const filteredItems = computed(() => tableItems.value)

async function guardarNotas() {
  const token = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const payload = {
    av_profile: profile,
    notas: tableItems.value.map(i => ({
      pacu_id: i.pacu_id,
      alum_id: i.alum_id,
      pcal_id: i.pcal_id,
      pcco_id: i.pcco_id,
      pcac_id: i.pcac_id,
      acti_id: i.acti_id,
      pcaa_id: i.pcaa_id,
      pcaa_nota: i.nota,
      pcaa_nota_letra: i.nota_letra

    }))
  }

  try {
    const res = await axios.post('https://amsoftsolution.com/amss/ws/wsRegistraNotas.php', payload, config)
    mensaje.value = res.data.message
    mensajeActivo.value = true
  } catch (e) {
    mensaje.value = 'Error al guardar notas'
    mensajeActivo.value = true
  }
}
</script>

<style scoped>
.curso-highlight {
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

/* Alineación correcta por posición de columna */
.v-data-table td:nth-child(1) {
  text-align: center !important;
}

/* Alinea el contenido real dentro de la celda "Apellidos y Nombres" */
.v-data-table tbody td:nth-child(2) {
  text-align: left !important;
}

/* Corrige el div interno que Vuetify usa para alinear contenido centrado por defecto */
.v-data-table tbody td:nth-child(2) .v-data-table__td {
  justify-content: flex-start !important;
  display: flex !important;
}
.v-data-table tbody td:nth-child(2) > * {
  justify-content: flex-start !important;
  text-align: left !important;
}
.info-box {
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 8px;
}
@media (max-width: 600px) {
  .info-box {
    justify-content: flex-start;
    margin-bottom: 6px;
    width: 100%;
  }
}
.v-chip {
  font-size: 0.875rem;
}
</style>

