<template>
  <v-container class="px-4">
    <!-- Título y descripción -->
    <v-row class="section-space">
      <v-col cols="12">
        <div class="text-h5 font-weight-bold text-primary mb-2">
          📚 Consulta de Notas
        </div>
        <div class="text-body-2 text-grey-darken-1">
          Revisa tus promedios y notas por bimestre y curso.
        </div>
      </v-col>
    </v-row>

    <!-- Información del Alumno -->
    <v-sheet
      v-if="infoAlumno"
      color="blue-lighten-5"
      class="pa-4 mb-2 rounded-lg elevation-1 section-space"
    >
      <v-row>
        <v-col cols="12">
          <v-icon color="primary" start>mdi-account</v-icon>
          <strong>Tutor:</strong> <span>{{ infoAlumno.tutor }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-clock-time-eight-outline</v-icon>
          <strong>Turno:</strong> <span>{{ infoAlumno.turn_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-school</v-icon>
          <strong>Nivel:</strong> <span>{{ infoAlumno.nive_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-numeric</v-icon>
          <strong>Grado:</strong> <span>{{ infoAlumno.grad_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-alpha-s-circle-outline</v-icon>
          <strong>Sección:</strong> <span>{{ infoAlumno.secc_nombre }}</span>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- Error y Loader -->
    <v-alert type="error" v-if="error" class="mb-4">{{ error }}</v-alert>
    <v-skeleton-loader v-if="loading" type="card" class="mb-4"></v-skeleton-loader>

    <!-- Filtros -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedPeriodo"
          :items="periodos"
          item-title="periodo"
          item-value="id"
          label="Periodo Educativo"
          clearable
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="cursoFilter"
          label="Filtrar cursos"
          prepend-inner-icon="mdi-magnify"
          clearable
          outlined
          dense
        />
      </v-col>
    </v-row>

    <!-- Grilla de cursos: 2 por fila en desktop -->
    <v-row>
      <v-col
        v-for="curso in filteredCourses"
        :key="curso.aede_id"
        cols="12"
        sm="6"
        md="6"
        lg="6"
      >
        <v-card elevation="2">
          <!-- Header con nombre y promedio del curso -->
          <v-card-title class="justify-space-between">
            <div class="d-flex align-center">
              <v-icon left small color="primary">mdi-book-open-variant</v-icon>
              <span class="course-title">{{ curso.aede_nombre }}</span>
            </div>
            <!-- Promedio estilo Consulta de Notas -->
            <v-chip color="primary" text-color="white" small>
              Promedio bimestral: {{ curso.promedio_letra }}
            </v-chip>
          </v-card-title>

          <!-- Docente -->
          <v-card-subtitle class="text-left">
            Docente: <span class="docente">{{ curso.docente }}</span>
          </v-card-subtitle>

          <!-- Botón para expandir detalles -->
          <v-card-actions>
            <v-btn text @click="toggleExpand(curso.aede_id)">
              {{ expanded === curso.aede_id ? 'Ocultar detalles' : 'Ver Detalles' }}
              <v-icon right small>
                {{ expanded === curso.aede_id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </v-card-actions>

          <!-- Detalles: competencias y actividades alineados a la izquierda -->
          <v-expand-transition>
            <div v-if="expanded === curso.aede_id" class="pa-3 text-left details">
              <v-list dense>
                <v-list-item v-for="comp in curso.competencias" :key="comp.comp_id" dense class="comp-item">
                  <v-list-item-content>
                    <div class="comp-name">{{ comp.comp_nombre }}</div>
                    <div class="comp-logro"><strong>Logro: {{ comp.logro_letra || '–' }}</strong></div>

                    <v-list dense class="ml-4">
                      <v-list-item v-for="act in comp.actividades" :key="act.pcca_id" dense class="act-item">
                        <v-list-item-content class="act-content">
                          {{ act.acti_nombre }}: <strong>{{ act.nota_letra || '–' }}</strong>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <!-- Sin cursos -->
      <v-col cols="12" v-if="!loading && filteredCourses.length === 0">
        <v-alert type="info">No hay cursos para mostrar</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'

const periodos = ref([])
const selectedPeriodo = ref(null)
const cursoFilter = ref('')
const courses = ref([])
const loading = ref(false)
const error = ref('')
const expanded = ref(null)

const token = localStorage.getItem('token')
const profile = localStorage.getItem('profile')
const userId = localStorage.getItem('usua_id')

const infoAlumno = ref(null)           // <--- declarar alumno
const anio_escolar = localStorage.getItem('anio_escolar')

// 1) Traer datos del alumno
async function fetchInformacionAlumno() {
  try {
    const token = localStorage.getItem('token')
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsConsultaInformacionAlumno.php'
    const params = {
      ai_usua_id: userId,
      ac_anio_escolar: anio_escolar,
      av_profile: profile
    }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status && response.data.data.length > 0) {
      infoAlumno.value = response.data.data[0]
    }
  } catch (error) {
    console.error('Error fetchInformacionAlumno:', error)
  }
}

// 2) onMounted: primero alumno, luego periodos (o en paralelo)
onMounted(async () => {
  if (!token || !profile || !userId || !anio_escolar) {
    error.value = 'Faltan parámetros de autenticación'
    return
  }
  loading.value = true
  await Promise.all([
    fetchInformacionAlumno(),
    fetchPeriodos()
  ])
  loading.value = false
})

// Cargar lista de periodos académicos
const fetchPeriodos = async () => {
  try {
     const url = `https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativo.php?av_profile=${profile}`
     const { data } = await axios.get(url, { headers:{ Authorization:`Bearer ${token}` } })
     if (data.status) {
       // Mapeamos al nuevo esquema
       periodos.value = data.data.map(p => ({
         id:      p.id,
         periodo: p.periodo,
         estado:  p.estado
       }))
       // Selección predeterminada
       const activo = periodos.value.find(p => p.estado === 'A')
       selectedPeriodo.value = activo
         ? activo.id
         : (periodos.value[0]?.id ?? null)
     } else {
       error.value = 'No se pudo cargar los periodos'
     }
   } catch (e) {
     error.value = 'Error al cargar periodos'
     console.error(e)
   }
 }

// Cargar cursos para el periodo seleccionado
const fetchCourses = async () => {
  if (!selectedPeriodo.value) return courses.value = []
  loading.value = true
  try {
    const url = `https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarAlumno.php?ai_usua_id=${userId}&ai_peed_id=${selectedPeriodo.value}&av_profile=${profile}`
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    if (data.status) {
      // Guardamos el listado completo de cursos
      courses.value = data.data
    } else {
      error.value = 'No se encontraron cursos para este periodo'
    }
  } catch (e) {
    error.value = 'Error al cargar cursos'
  } finally {
    loading.value = false
  }
}

// Filtrar lista de cursos
const filteredCourses = computed(() => {
  if (!cursoFilter.value) return courses.value
  return courses.value.filter(c =>
    c.aede_nombre.toLowerCase().includes(cursoFilter.value.toLowerCase())
  )
})

// Expandir/colapsar detalles de curso
const toggleExpand = (id) => {
  expanded.value = expanded.value === id ? null : id
}

// Reactividad: cuando cambia el periodo, recargar cursos
watch(selectedPeriodo, fetchCourses)

</script>

<style scoped>
.course-title { font-weight: 600; font-size: 1.1rem; }
.average { font-weight: bold; font-size: 1.1rem; color: #1976D2; }
.docente-subtitle { font-size: 0.9rem; line-height: 1.2; }
.docente { color: #1976D2; font-size: 0.9rem; }
.comp-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 1px; }
.comp-logro { font-size: 0.85rem; margin-bottom: 2px; font-weight: 700; }

.act-content {
  font-size: 0.85rem;
  line-height: 1.2;
  margin-bottom: 1px;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.section-space { margin-bottom: 24px; }
.v-card { transition: transform 0.2s; }
.v-card:hover { transform: translateY(-2px); }
.text-left { text-align: left; }
/* Forzar padding/margen cero en cada item */
.details ::v-deep .v-list-item {
  margin: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Quitar el padding interno del content wrapper */
.details .v-list-item__content {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Asegurarte de que la lista use dense */
.details v-list {
  --v-list-item-height: auto; /* para que no fije altura mínima */
}

/* Si tu ml-4 añade margin-left excesivo, sobreescríbelo */
.details .ml-4 {
  margin-left: 8px !important; /* o el valor que necesites */
}
</style>
