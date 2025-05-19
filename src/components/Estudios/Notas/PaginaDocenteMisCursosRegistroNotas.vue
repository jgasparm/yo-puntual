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

    <!-- Curso y Periodo -->
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

    <!-- Tabla / Tarjetas -->
    <v-data-table
      v-if="$vuetify.display.mdAndUp"
      :headers="headers"
      :items="filteredItems"
      class="elevation-1 mt-4"
    >
      <template v-slot:item.nota="{ item }">
        <v-text-field
          v-model="item.nota"
          type="number" min="0" max="20"
          density="compact" hide-details
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
    <v-row v-else class="mt-2" dense>
      <v-col cols="12" v-for="item in filteredItems" :key="item.alum_id">
        <v-card class="pa-3">
          <div class="text-subtitle-2 font-weight-bold">{{ item.alumno }}</div>
          <v-row class="mt-2" align="center">
            <v-col cols="6">
              <v-text-field
                v-model="item.nota"
                label="Nota"
                type="number" min="0" max="20"
                density="compact" hide-details
                @input="actualizarLetra(item)"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :model-value="item.nota_letra"
                label="Letra"
                readonly
                density="compact" hide-details
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

    <!-- Snackbar -->
    <v-snackbar v-model="mensajeActivo" :color="mensajeError ? 'error' : 'success'" timeout="3000">
      {{ mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const cursoSeleccionado = ref(JSON.parse(decodeURIComponent(route.query.curso)))
const bimestre         = ref(JSON.parse(decodeURIComponent(route.query.bimestre)))
const detalle          = ref({ data: [] })
const pacuId           = ref(route.query.pacu_id || cursoSeleccionado.value?.pacu_id || null)

const competencias      = ref([])
const actividades       = ref([])
const selectedCompetencia = ref(null)
const selectedActividad   = ref(null)

const headers = [
  { title: 'N°', key: 'numero', align: 'center' },
  { title: 'Apellidos y Nombres', key: 'alumno', align: 'center' },
  { title: 'Nota', key: 'nota' },
  { title: 'Letra', key: 'nota_letra' }
]

const tableItems   = ref([])
const mensajeActivo = ref(false)
const mensaje       = ref('')
const mensajeError  = ref(false)

// 1) Trae las competencias del curso
async function fetchCompetencias() {
  const token   = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const { data } = await axios.get(
    'https://amsoftsolution.com/amss/ws/wsConsultaPlanCurricularCompetencias.php',
    { headers:{ Authorization:`Bearer ${token}` }, params:{
      ai_pacu_id: pacuId.value,
      ac_pcco_estado: 'A',
      av_profile: profile
    }}
  )
  competencias.value = data.status ? data.data : []
  if (competencias.value.length) selectedCompetencia.value = competencias.value[0]
}

// 2) Trae las actividades de la competencia
async function fetchActividades(pcco_id) {
  const token   = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const { data } = await axios.get(
    'https://amsoftsolution.com/amss/ws/wsConsultaPCCompetenciasActividades.php',
    { headers:{ Authorization:`Bearer ${token}` }, params:{
      ai_pcco_id: pcco_id,
      ac_pcca_estado: 'A',
      av_profile: profile
    }}
  )
  actividades.value = data.status ? data.data : []
  if (actividades.value.length) selectedActividad.value = actividades.value[0]
}

// 3) Reconstruye la tabla a partir de `detalle.value`
function construirTabla() {
  const alumnos = detalle.value.data
  const pccoId  = selectedCompetencia.value?.pcco_id
  const pccaId  = selectedActividad.value?.pcca_id
  

  tableItems.value = alumnos.map((alum, i) => {
    // pcal_id está en el root de cada alumno
    const pcalId = alum.pcal_id

    // busca la competencia seleccionada
    //const comp = alum.competencias.find(c => c.pcco_id == pccoId)
    const comp = alum.competencias.find(c => String(c.comp_id) === String(pccoId))

    // dentro de esa competencia, busca la actividad
    const act  = comp?.actividades.find(a => a.pcca_id == pccaId)

    return {
      numero:      i+1,
      alumno:      alum.alumno,
      alum_id:     alum.alum_id,

      pacu_id:     pacuId.value,
      pcal_id:     pcalId,
      pcco_id:     pccoId,
      pcac_id:     comp?.pcac_id || null,
      acti_id:     act?.acti_id  || null,
      pcaa_id:     act?.pcaa_id  || null,

      nota:        act?.nota     ?? null,
      nota_letra:  act?.nota_letra ?? null
    }
  })
}

const filteredItems = computed(() => tableItems.value)

// actualiza la letra al cambiar la nota
function actualizarLetra(item) {
  const v = parseFloat(item.nota)
  if (isNaN(v)) return item.nota_letra = ''
  item.nota_letra = v <= 10 ? 'C'
                   : v <= 13 ? 'B'
                   : v <= 17 ? 'A'
                   :            'AD'
}

// 4) Trae de nuevo el detalle completo (para refrescar tras guardar)
async function fetchDetalle() {
  const token   = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')
  const doad_id = route.query.doad_id
  const aude_id = cursoSeleccionado.value.aude_id
  const grad_id = cursoSeleccionado.value.grad_id
  const peed_id = bimestre.value.peed_id

  const { data } = await axios.get(
    'https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliar.php',
    {
      headers: { Authorization:`Bearer ${token}` },
      params: {
        ai_doad_id: doad_id,
        ai_aude_id: aude_id,
        ai_peed_id: peed_id,
        ai_grad_id: grad_id,
        av_profile: profile
      }
    }
  )

  detalle.value = data
  construirTabla()
}

// al montar, cargo todo
onMounted(async () => {
  if (!pacuId.value) return console.warn('pacuId no definido')
  await fetchCompetencias()

  if (route.query.detalle) {
     detalle.value = JSON.parse(decodeURIComponent(route.query.detalle))
     construirTabla()
   }
  //await fetchActividades(selectedCompetencia.value.pcco_id)
  //await fetchDetalle()
})

// re-construyo la tabla cuando cambias filtros
watch(selectedCompetencia, val => val && fetchActividades(val.pcco_id))
watch(selectedActividad, construirTabla)

// 5) Guarda y, si va bien, vuelve a traer el detalle y muestra mensaje
async function guardarNotas() {
  mensajeActivo.value = false
  const token   = localStorage.getItem('token')
  const profile = localStorage.getItem('profile')

  const payload = {
    av_profile: profile,
    notas: tableItems.value.map(i => ({
      pacu_id:         i.pacu_id,
      alum_id:         i.alum_id,
      pcal_id:         i.pcal_id,
      pcco_id:         i.pcco_id,
      pcac_id:         i.pcac_id,
      acti_id:         i.acti_id,
      pcaa_id:         i.pcaa_id,
      pcaa_nota:       i.nota,
      pcaa_nota_letra: i.nota_letra
    }))
  }

  try {
    const { data } = await axios.post(
      'https://amsoftsolution.com/amss/ws/wsRegistraNotas.php',
      payload,
      { headers: { Authorization:`Bearer ${token}` } }
    )

    if (data.status) {
      mensajeError.value = false
      mensaje.value      = data.message
      await fetchDetalle()           // 🔄 refresca datos
    } else {
      throw new Error(data.message)
    }
  } catch (err) {
    mensajeError.value = true
    mensaje.value      = err.message || 'Error al guardar notas'
  } finally {
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

